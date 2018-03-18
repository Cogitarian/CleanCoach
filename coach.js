/* @preserve
* Coach.js by P. Hughes (www.phugh.es)
* @license Open source under the AGPLv3 license.
* @copy Copyright 2018 P. Hughes. All rights reserved.
* see LICENSE file for further details.
*
* Currently requires compromise.js to be loaded BEFORE coach.js
*/

const version = '0.1.0-alpha1';

/* ######################
 * Language Data        #
 * ###################### */

// list of pronouns
const coachPronouns = {
    'am': 'are',
    'your': 'my',
    'me': 'you',
    'myself': 'yourself',
    'yourself': 'myself',
    'my': 'your',
    'i\'m': 'you\'re',
    'mine': 'yours',
    'yours': 'mine',
    'you\'re': 'I\'m',
};

// @todo maybe move these to seperate file (e.g. coachdata.js)
const coachPrepositions = [
    'aboard', 'about', 'above', 'across', 'after', 'against', 'along',
    'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind',
    'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but',
    'by', 'concerning', 'considering', 'despite', 'down', 'during',
    'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in',
    'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto',
    'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding',
    'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards',
    'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via',
    'with', 'within', 'without',
];

// @todo add danger phrases, quit phrases,
// and closed loop phrases (e.g. yes/no/maybe)

// danger words
const coachDangerWords = [];
// quit words
const coachQuitWords = [];
// closed loop words
const coachClosedWords = [];

// stop words
const coachStopWords = [
    'a', 'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
    'between', 'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did',
    'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have',
    'her', 'here', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most',
    'much', 'must', 'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other',
    'our', 'out', 'over', 'said', 'same', 'see', 'should', 'since', 'some',
    'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then',
    'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
    'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what',
    'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your',
];

/*
* Clean Language Questions
* X / Y = Items
* Z = are / is
* Q = they / that
* T = them / that
* R = those / that
* H = happen / happens
* D = would / do
*/
const cleanQuestions = {
    // no matchable input found = no modifications needed
    NONES: [
        'and what would you like to have happen?',
        'and is there anything else?',
        'and what happens next?',
        'and then what happens?',
    ],
    // generic questions = previous match or modification required
    GENERIC_QS: [
        'and is there anything else about that?',
        'and whereabouts D you feel T?',
        'and what Z Q like?',
        'and what happens just before T?',
        'and where could Q come from?',
        'and where would Q come from?',
        'and if Q H, what would you like to happen now?',
        'and what needs to happen for R?',
    ],
    // questions with space for 1 item (X) and subsequent mods
    X_QS: [
        'and what kind of X Z Q?',
        'and what kind of X Z R X?',
        'and is there anything else about X?',
        'and where Z X?',
        'and whereabouts Z X?',
        'and X Z like what?',
        'and that\'s X like what?',
        'and when X H, what happens next?',
        'and what happens after X?',
        'and what happens just before X?',
        'and where could X come from?',
        'and what needs to happen for X?',
        'and can X happen?',
    ],
    // questions with space for 2 items (X, Y) and mods
    XY_QS: [
        'and what is the relationship between X and Y?',
        'and what is the relationship between Y and X?',
        'and when X H, what happens to Y?',
        'and when Y happens, what happens to X?',
    ],
    // questions with space for 1 named entitiy
    NE_QS: [
        'and what would X like to have happen?',
    ],
};


/* ######################
 * Functions            #
 * ###################### */

/**
 * Get random question from array of possible categories
 * @function getQuestion
 * @param  {array} arr array of possible categories
 * @return {string} selected question
 */
function getQuestion(arr) {
    let i = 0;
    const category = arr[Math.floor(Math.random() * arr.length)];
    let question = cleanQuestions[category][Math.floor(Math.random() *
        cleanQuestions[category].length)];
    while (question === this.previousQuestion ||
        (category === this.previousCategory && i < 2)) {
        i = i + 1;
        question = cleanQuestions[category][Math.floor(Math.random() *
            cleanQuestions[category].length)];
    }
    this.previousQuestion = question;
    this.previousCategory = category;
    return question;
}

/**
 * Choose between string modifiers (i.e. singular / plural forms)
 * @function getMods
 * @param  {string} str
 * @return {array}
 */
function getMods(str) {
    // @todo better way of finding plurals
    if (str && window.nlp(str).nouns().isPlural().out().length > 0) {
        return ['are', 'they', 'them', 'those', 'happen'];
    } else {
        return ['is', 'that', 'that', 'that', 'happens'];
    }
}

/**
 * Make a clean reflection from the user's text
 * @function constructReflection
 * @param  {array} arr tokenised input
 * @param  {object} opts options object
 * @return {string} reflective statement
 */
function constructReflection(arr, opts) {
    // handle output option
    let reflection = 'and ';
    if (opts.trimFirstAnd) reflection = '';
    // previous word storage
    let prev = '';
    // main loop
    for (let word of arr) {
        // if not a word, skip
        if (!word.match(/\b\w+\b/gi)) {
            reflection = reflection.trim() + word + ' ';
            continue;
        }
        // handle 'I'
        let x = 0;
        if (word === 'i') {
            word = 'you';
            x = 1;
        } else
        // handle you = I or me
        if (word === 'you' && x === 0) {
            if (coachPrepositions.indexOf(prev) >= 0) {
                word = 'I';
            } else {
                word = 'me';
            }
        } else
        // handle 'us'
        if (word === 'us' && coachPrepositions.indexOf(prev) >= 0) {
            word = 'you';
        } else {
            // handle other pronouns
            for (let p in coachPronouns) {
                if (coachPronouns.hasOwnProperty(p) && word === p) {
                    word = coachPronouns[p];
                }
            }
        }
        x = 0;
        prev = word;
        reflection = reflection + word + ' ';
    }
    return reflection.trim();
}

/**
 * Modify the chosen Clean Language question to include user's input
 * @function modifyQuestion
 * @param  {string} X        input item 1 (e.g. a noun)
 * @param  {string} Y        input item 2 (e.g. a verb)
 * @param  {string} question the chosen clean language question
 * @param  {string} str      original user input
 * @param  {object} opts options object
 * @return {string} modified question
 */
function modifyQuestion(X, Y, question, str, opts) {    
    const a = /X/g;
    const b = /Y/g;
    const c = /Z/g;
    const d = /Q/g;
    const e = /T/g;
    const g = /R/g;
    const h = /H/g;
    const j = /D/g;
    // replace placeholders with user's input
    if (opts.quoteUser) X = '\'' + X + '\'';
    if (opts.quoteUser) Y = '\'' + Y + '\'';
    question = question.replace(a, X);
    question = question.replace(b, Y);
    // replace remaining placeholders based on plurality of input
    const Z = getMods(X);
    question = question.replace(c, Z[0]);
    question = question.replace(d, Z[1]);
    question = question.replace(e, Z[2]);
    question = question.replace(g, Z[3]);
    question = question.replace(h, Z[4]);
    // handle past, present, future tense
    if (str === window.nlp(str).sentences().toFutureTense().out()) {
        let terms = ['could', 'would'];
        let term = terms[Math.floor(Math.random() * terms)];
        question = question.replace(j, term);
    } else if (str === window.nlp(str).sentences().toPastTense().out()) {
        let terms = ['did', 'do', 'can'];
        let term = terms[Math.floor(Math.random() * terms)];
        question = question.replace(j, term);
    } else {
        question = question.replace(j, 'do');
    }
    // handle output options
    if (opts.trimSecondAnd) {
        question = question.slice(4);
    }
    return question;
}

/**
 * Create a Clean Language question
 * @function constructQuestion
 * @param  {array} tokens tokenised input
 * @param  {string} str original user input
 * @param  {object} opts options object
 * @return {string} question
 */
function constructQuestion(tokens, str, opts) {
    // default response question
    let question = 'and what would you like to have happen?';

    // remove stop words
    const s = [];
    for (let word of tokens) {
        if (coachStopWords.indexOf(word) >= 0) {
            s.push(word);
            tokens.splice(word, 1);
        }
    }

    // @todo need to replace compromise.js with native solution
    const msg = window.nlp(tokens.join(' '));

    // sort nouns 
    const nouns = [];
    msg.nouns().data().forEach(function(noun) {
        nouns.push(noun.normal);
    });
    const nl = nouns.length;

    // sort verbs
    const verbs = [];
    msg.verbs().data().forEach(function(verb) {
        verbs.push(verb.normal);
    });
    const vl = verbs.length;

    // sort named entities
    const people = [];
    msg.people().data().forEach(function(person) {
        people.push(person.normal);
    });
    const pl = people.length;

    // question selection and modification
    // @todo this is ugly as sin
    let X;
    let Y;
    if (nl > 0 && vl > 0) {
        // 1 or more nouns AND verbs
        question = getQuestion(['NONES', 'GENERIC_QS', 'X_QS', 'XY_QS',
                'X_QS', 'XY_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
        Y = verbs[Math.floor(Math.random() * vl)];
    } else if (nl > 0) {
        // 1 or more nouns only
        question = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
    } else if (vl > 0) {
        // 1 or more verbs only
        question = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X= verbs[Math.floor(Math.random() * vl)];
    } else if (pl > 0) {
        // 1 or more named entity only
        question = getQuestion(['NONES', 'GENERIC_QS', 'NE_QS']);
        X = people[Math.floor(Math.random() * pl)];
    } else {
        // none of the above
        question = getQuestion(['NONES']);
    }

    // debug
    if (opts.debug) {
        console.log('Stop words removed: ' + s.length + ': (' + s + ')');
        console.log('Modified string: ' + msg.out('text'));
        console.log(nl + ' noun(s): ' + nouns);
        console.log(vl + ' verb(s): ' + verbs);
        console.log(pl + ' person(s): ' + people);
        console.log('Topic data: ', msg.topics().data());
    }

    // Return modified question
    return modifyQuestion(X, Y, question, str, opts);
}

/**
 * Tokenise the input
 * from https://github.com/phugh/happynodetokenizer
 * @function tokenise
 * @param  {string} str user input
 * @return {array} array of tokens
 */
function tokenise(str) {
    if (typeof str !== 'string') str = str.toString();
    const r = new RegExp(/(?:(?:\+?[01][\-\s.]*)?(?:[\(]?\d{3}[\-\s.\)]*)?\d{3}[\-\s.]*\d{4})|(?:[<>]?[:;=8>][\-o\*\']?[\)\]\(\[dDpPxX\/\:\}\{@\|\\]|[\)\]\(\[dDpPxX\/\:\}\{@\|\\][\-o\*\']?[:;=8<][<>]?|<3|\(?\(?\#?\(?\(?\#?[>\-\^\*\+o\~][\_\.\|oO\,][<\-\^\*\+o\~][\#\;]?\)?\)?)|(?:(?:http[s]?\:\/\/)?(?:[\w\_\-]+\.)+(?:com|net|gov|edu|info|org|ly|be|gl|co|gs|pr|me|cc|us|gd|nl|ws|am|im|fm|kr|to|jp|sg))|(?:http[s]?\:\/\/)|(?:\[[a-z_]+\])|(?:\/\w+\?(?:\;?\w+\=\w+)+)|<[^>]+>|(?:@[\w_]+)|(?:\#+[\w_]+[\w\'_\-]*[\w_]+)|(?:[a-z][a-z'\-_]+[a-z])|(?:[+\-]?\d+[,\/.:-]\d+[+\-]?)|(?:[\w_]+)|(?:\.(?:\s*\.){1,})|(?:\S)/, 'gi'); // eslint-disable-line
    return str.match(r);
}

/* #####################
* Coach                #
* ###################### */

/**
 * @function Coach
 * @param  {string} name coach's name
 */
function Coach(name) {
    if (!window.nlp) console.error('YOU NEED TO LOAD COMPROMISE FIRST');
    this.debug = false;
    this.name = name || null;
    this.quoteUser = true;
    this.trimFirstAnd = false;
    this.trimSecondAnd = false;
    this.version = version;
    this._initialised || this._init();
    this.reset();
}

Coach.prototype.reset = function() {
    this.iteration = 0;
    this.previousCategory = null;
    this.previousQuestion = null;
};

/** @private */
Coach.prototype._initialised = false;

/** @private */
Coach.prototype._init = function() {
    Coach.prototype._initialised = true;
};

Coach.prototype.getResponse = function(str) {
    const that = this;
    // @todo this is where to handle danger / closing statements
    return new Promise(function(resolve, reject) {
        const response = that.respond(str);
        if (response) {
            resolve({reply: response});
        } else {
            reject(new Error('No response found! ', response));
        }
    });
};

Coach.prototype.respond = function(str) {
    // bump iteration
    this.iteration = this.iteration + 1;

    // capture options to pass to functions
    const opts = {
        debug: this.debug,
        quoteUser: this.quoteUser,
        trimFirstAnd: this.trimFirstAnd,
        trimSecondAnd: this.trimSecondAnd,
    };

    // opening debug comments
    if (opts.debug) {
        console.log('-------------');
        console.log('Iteration: ' + this.iteration);
        console.log('Original string: ' + str);
    }

    // string transformation and tokenisation
    str = str.toLowerCase().trim();
    const tokens = tokenise(str);
    if (opts.debug) console.log('Tokens: ' + tokens.length);

    // create reflective statement
    const reflection = constructReflection(tokens, opts);
    if (opts.debug) console.log('Reflective statement: ' + reflection);

    // create response question
    const question = constructQuestion(tokens, str, opts);
    
    // closing debug comments
    if (opts.debug) {
        console.log('Selected response: ' + question);
        console.log('-------------');
    }
    
    // combine reflection and question into one string
    return reflection + ', ' + question;
};

