/* @preserve
 * functions.js by P. Hughes (www.phugh.es)
 * @license Open source under the AGPLv3 license.
 * @copy Copyright 2018 P. Hughes. All rights reserved.
 * see LICENSE file for further details.
 */

(function() {
    'use strict';
    const language = require('./language.js');
    const questions = require('./questions.js');
    const nlp = require('compromise');
    const moment = require('moment');

    const affect = require('affectimo');
    const age = require('predictage');
    const dark = require('darktriad');
    const gender = require('predictgender');
    const time = require('prospectimo');
    const optimism = require('optimismo');
    const wellbeing = require('wellbeing_analysis');

    const averageArr = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
    const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const filterFalsey = (arr) => arr.filter((n) => n);

    /**
     * Sanitise the users input
     * @function cleanTxt
     * @param  {string} str user input
     * @return {string} sanitised string
     */
    function cleanTxt(str) {
        if (!str) return '';
        let clean = nlp(str).normalize({
            numbers: false, 
            contractions: false,
        }).out('text');
        return clean.toLowerCase().trim();
    }

    /**
     * Detect special conditions
     * @function detectSpecial
     * @param  {Array} tokens array of tokens
     * @return {Object}
     */
    function detectSpecial(tokens) {
        const specials = {
            danger: false,
            final: false,
        };
        for (let i of tokens) {
            if (language.coachDangerWords.indexOf(i) > -1) {
                specials.danger = true;
            }
            if (language.coachQuitWords.indexOf(i) > -1) {
                specials.final = true;
            }
        }
        return specials;
    }

    /**
     * @function getQuestion
     * @param  {Array} tokens     array of tokens
     * @param  {string} cleanStr  cleaned string
     * @param  {Object} data      string data
     * @param  {Number} depth     current issue depth
     * @param  {Array} depthIssue array of current depth issue
     * @param  {string} prev      previous question
     * @param  {Object} opts      coach options object
     * @return {Array} [modded question, question, category, X, Y]
     */
    function getQuestion(
            tokens, cleanStr, data, depth, depthIssue, prev, opts) {
        // default response question
        let question = 'and what would you like to have happen?';
        let category = 'unknown';
        if (depthIssue) depthIssue = filterFalsey(depthIssue);

        /**
         * @function chooseQuestion
         * @param  {Array} arr 
         * @param  {string} prev previous question
         * @return {Array} [question, category]
         */
        function chooseQuestion(arr, prev) {
            let i = 0;
            let pot = chooseRandom(arr);
            let item = chooseRandom(questions.cleanQuestions[pot]);
            let question = item[0];
            let category = item[1];
            while (question === prev && i < 10) {
                i += 1;
                pot = chooseRandom(arr);
                item = chooseRandom(questions.cleanQuestions[pot]);
                question = item[0];
                category = item[1];           
            }
            return [question, category];
        }

        /**
         * @function chooseItems
         * @param  {Array} X 
         * @param  {Array} Y 
         * @return {Object} {X, Y}
         */
        function chooseItems(X, Y) {
            // create merged array
            if (!Array.isArray(X)) X = [X];
            if (!Array.isArray(Y)) Y = [Y];
            let merge = filterFalsey([...X, ...Y]);
            // choose two random items
            let a = chooseRandom(merge);
            let b = chooseRandom(merge);
            let i = 0;
            let len = merge.length;
            // make sure choices are different
            while (a === b && i < len) {
                i++;
                a = chooseRandom(merge);
                b = chooseRandom(merge);
            }
            return {X: a, Y: b};
        }

        // question and items selection
        let X;  // item 1
        let Y;  // item 2
        let items;  // array of possible items
        if (data.pos.nouns.length > 0) {
            if (data.pos.nouns.length > 1) {
                question = chooseQuestion(['NONES', 'GENERIC_QS', 'X_QS', 
                        'XY_QS', 'X_QS', 'XY_QS'], prev);
                items = chooseItems(data.pos.nouns, depthIssue);
                X = items.X;
                Y = items.Y;
            } else {
                question = 
                        chooseQuestion(['NONES', 'GENERIC_QS', 'X_QS'], prev);
                X = chooseItems(
                        [...data.pos.nouns, ...data.pos.adjectives], 
                        depthIssue).X;
            }
        } else if (data.pos.adjectives.length > 0) {
            if (data.pos.verbs.length > 0) {
                question = chooseQuestion(['NONES', 'GENERIC_QS', 'X_QS', 
                        'XY_QS', 'X_QS'], prev);
                items = chooseItems(
                        [...data.pos.verbs, ...data.pos.adjectives], 
                        depthIssue);
                X = items.X;
                Y = items.Y;
            } else {
                question = 
                        chooseQuestion(['NONES', 'GENERIC_QS', 'X_QS'], prev);
                items = chooseItems(data.pos.adjectives, depthIssue);
                X = items.X;
                Y = items.Y;
            }
        } else if (data.pos.verbs.length > 0) {
            question = chooseQuestion(['NONES', 'GENERIC_QS', 'X_QS'], prev);
            X = chooseItems(data.pos.verbs).X;
        } else if (data.pos.entities.length > 0) {
            question = chooseQuestion(['NONES', 'GENERIC_QS', 'NE_QS', 
                    'NE_QS'], prev);
            X = chooseItems(data.pos.entities).X;
        } else {
            if (depthIssue) {
                question = chooseQuestion(['NONES', 'X_QS', 'X_QS'], prev);
                X = chooseItems(depthIssue).X;
            } else {
                // none of the above
                question = chooseQuestion(['NONES'], prev);
            }
        }

        /**
         * Modify the chosen Clean Language question to include user's input
         * @function modifyQuestion
         * @param  {string} X        input item 1 (e.g. a noun)
         * @param  {string} Y        input item 2 (e.g. a verb)
         * @param  {string} question the chosen clean language question
         * @param  {string} str      original user input
         * @param  {Object} opts     coach's options object
         * @return {string} modified question
         */
        function modifyQuestion(X, Y, question, str, opts) {
            const nlpStr = nlp(str);

            /**
             * Choose between string modifiers (i.e. singular / plural forms)
             * @function getMods
             * @param  {string} str
             * @return {array}
             */
            function getMods(str) {
                // @todo better way of finding plurals
                if (str && nlpStr.nouns().isPlural().out().length > 0) {
                    return ['are', 'they', 'them', 'those', 'happen'];
                } else {
                    return ['is', 'that', 'that', 'that', 'happens'];
                }
            }

            category = question[1];
            question = question[0];

            const a = /X/g; // item 1
            const b = /Y/g; // item 2
            const c = /Z/g; // are / is
            const d = /Q/g; // they / that
            const e = /T/g; // them / that
            const g = /R/g; // those / that
            const h = /H/g; // happen / happens
            const j = /D/g; // would / do

            // replace placeholders with user's input
            if (opts.quoteUser) {
                // modify based on coach options
                question = question.replace(a, '"' + X + '"');
                question = question.replace(b, '"' + Y + '"');
            } else {
                question = question.replace(a, X);
                question = question.replace(b, Y);
            }
            // replace remaining placeholders based on plurality of input
            const Z = getMods(X);
            question = question.replace(c, Z[0]);
            question = question.replace(d, Z[1]);
            question = question.replace(e, Z[2]);
            question = question.replace(g, Z[3]);
            question = question.replace(h, Z[4]);
            // handle past, present, future tense
            if (str === nlpStr.sentences().toFutureTense().out()) {
                let terms = ['could', 'would'];
                let term = chooseRandom(terms);
                question = question.replace(j, term);
            } else if (str === nlpStr.sentences().toPastTense().out()) {
                let terms = ['did', 'do', 'can'];
                let term = chooseRandom(terms);
                question = question.replace(j, term);
            } else {
                question = question.replace(j, 'do');
            }
            // handle output options
            return question;
        }

        // Return modified question
        let modded = modifyQuestion(X, Y, question, cleanStr, opts);
        return [modded, question, category, X, Y];
    }

    /**
     * @function makeReflection
     * @param  {Array} tokens array of tokens
     * @return {string} reflective statement
     */
    function getReflection(tokens) {
        // handle output option
        let reflection = 'and ';
        // previous word storage
        let prev = '';
        // main loop
        for (let word of tokens) {
            // if not a word, skip
            if (!word.match(/\b\w+\b/gi)) {
                reflection = reflection + word + ' ';
                prev = word;
                continue;
            }
            // handle 'I'
            if (word === 'i') {
                word = 'you';
            } else
            // handle you = I or me
            if (word === 'you') {
                if (language.coachPrepositions.indexOf(prev) >= 0) {
                    word = 'I';
                } else {
                    word = 'me';
                }
            } else
            // handle 'us'
            if (word === 'us' && 
                    language.coachPrepositions.indexOf(prev) >= 0) {
                word = 'you'; // we?
            } else {
                // handle other pronouns
                for (let p in language.coachPronouns) {
                    if (language.coachPronouns.hasOwnProperty(p) && 
                            word === p) {
                        word = language.coachPronouns[p];
                    }
                }
            }
            prev = word;
            reflection = reflection + word + ' ';
        }
        return reflection.trim();
    }

    /**
     * @function getStrData
     * @param  {Number} session  session number
     * @param  {Number} i        iteration
     * @param  {Number} depth    current issue depth
     * @param  {string} str      unaltered input
     * @param  {string} cleanStr cleaned input
     * @param  {Array} tokens    array of input tokens
     * @param  {string} category question category
     * @param  {string} question question string
     * @return {Object}
     */
    function getStrData(session, i, depth, str, cleanStr, tokens, category, question) {
        const opts = {logs: 0, places: 4};

        const af = affect(str, opts);
        const dt = dark(str, opts);
        const to = time(str, opts);
        const wb = wellbeing(str, opts);

        const strInfo = {
            id: session + '_' + i,
            session: session,
            iteration: i,
            time: moment().format('HH:mm:ss'),
            depth: depth,
            category: category,
            question: question,
            originalStr: str,
            cleanedStr: cleanStr,
            tokens: tokens,
            stats: {
                age: age(str, opts).AGE,
                gender: gender(str, opts).GENDER,
                darktriad: dt.darktriad,
                psychopathy: dt.psychopathy,
                narcissism: dt.narcissism,
                machiavellianism: dt.machiavellianism,
                past: to.PAST,
                present: to.PRESENT,
                future: to.FUTURE,
                optimism: optimism(str, opts),
                affect: af.AFFECT,
                intensity: af.INTENSITY,
                POS_P: wb.POS_P,
                POS_E: wb.POS_E,
                POS_R: wb.POS_R,
                POS_M: wb.POS_M,
                POS_A: wb.POS_A,
                NEG_P: wb.NEG_P,
                NEG_E: wb.NEG_E,
                NEG_R: wb.NEG_R,
                NEG_M: wb.NEG_M,
                NEG_A: wb.NEG_A,
            },
            pos: {},
        };

        // sort POS
        str = nlp(str);
        strInfo.pos.nouns = str.nouns().out('array');
        strInfo.pos.verbs = str.verbs().out('array');
        strInfo.pos.entities = str.topics().out('array');
        strInfo.pos.sentences = str.sentences().out('array');
        strInfo.pos.adjectives = str.adjectives().out('array');

        return strInfo;
    }

    /**
     * Tokenise the input
     * from https://github.com/phugh/happynodetokenizer
     * @function tokenise
     * @param  {string} str user input
     * @param  {string} rsw remove stop words?
     * @return {array} array of tokens
     */
    function tokenise(str, rsw) {
        if (!str) return [];
        const r = new RegExp(/(?:(?:\+?[01][\-\s.]*)?(?:[\(]?\d{3}[\-\s.\)]*)?\d{3}[\-\s.]*\d{4})|(?:[<>]?[:;=8>][\-o\*\']?[\)\]\(\[dDpPxX\/\:\}\{@\|\\]|[\)\]\(\[dDpPxX\/\:\}\{@\|\\][\-o\*\']?[:;=8<][<>]?|<3|\(?\(?\#?\(?\(?\#?[>\-\^\*\+o\~][\_\.\|oO\,][<\-\^\*\+o\~][\#\;]?\)?\)?)|(?:(?:http[s]?\:\/\/)?(?:[\w\_\-]+\.)+(?:com|net|gov|edu|info|org|ly|be|gl|co|gs|pr|me|cc|us|gd|nl|ws|am|im|fm|kr|to|jp|sg))|(?:http[s]?\:\/\/)|(?:\[[a-z_]+\])|(?:\/\w+\?(?:\;?\w+\=\w+)+)|<[^>]+>|(?:@[\w_]+)|(?:\#+[\w_]+[\w\'_\-]*[\w_]+)|(?:[a-z][a-z'\-_]+[a-z])|(?:[+\-]?\d+[,\/.:-]\d+[+\-]?)|(?:[\w_]+)|(?:\.(?:\s*\.){1,})|(?:\S)/, 'gi'); // eslint-disable-line
        let tokens = str.match(r);
        // remove stop words
        if (rsw) {
            for (let word of tokens) {
                if (language.coachStopWords.indexOf(word) >= 0) {
                    tokens.splice(word, 1);
                }
            }
        }
        return tokens;
    }

    const functions = {
        averageArr: averageArr,
        chooseRandom: chooseRandom,
        cleanTxt: cleanTxt,
        detectSpecial: detectSpecial,
        getQuestion: getQuestion,
        getReflection: getReflection,
        getStrData: getStrData,
        tokenise: tokenise,
        filterFalsey: filterFalsey,
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = functions;
        }
        exports.functions = functions;
    } else {
        global.functions = functions;
    }
})();
