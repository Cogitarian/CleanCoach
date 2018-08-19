/* @preserve
 * Coach.js by P. Hughes (www.phugh.es)
 * @license Open source under the AGPLv3 license.
 * @copy Copyright 2018 P. Hughes. All rights reserved.
 * see LICENSE file for further details.
 */

(function() {
    'use strict';
    const version = '0.1.3';
    const functions = require('./functions.js');
    const language = require('./language.js');
    const moment = require('moment');

    /* ######################
     * Coach                #
     * ###################### */

    /**
     * @function Coach
     * @param  {string} name Coach's name
     */
    function Coach(name) {
        // set initial options
        this.name = name || 'Clive',
        this.options = {
            debug: false,           // print debug info to the console?
            maxDepth: 3,            // maxmimum iterations to hold on to an item
            quoteUser: true,        // put quotes around the users input?
            removeSW: false,        // remove stop words when tokenising?
            trimFirstAnd: false,    // trim 'and' from reflective statemnt?
            trimSecondAnd: false,   // trim 'and' from question?
        };
        this.version = version;
        // reset to clean state
        this.reset();
    }

    Coach.prototype.reset = function() {
        this.info = {
            depth: 0,           // current issue depth (0-3)
            depthIssue: null,   // current 'deep' issue
            firstIssue: null,   // user's first response to 'WWYLTHH'
            iteration: 0,       // current response loop    
            lastCategory: null, // previously selected response category   
            lastIssue: null,    // user's previous item
            lastQuestion: null, // previously selected question
            sessions: 0,
            sessionStartTime: moment().format('HH:mm:ss'),  
            sessionRunTime: 0,
        };
        this.profile = {
            age: [],
            gender: [],
            darktriad: [],
            psychopathy: [],
            narcissism: [],
            machiavellianism: [],
            past: [],
            present: [],
            future: [],
            optimism: [],
            affect: [],
            intensity: [],
            POS_P: [],
            POS_E: [],
            POS_R: [],
            POS_M: [],
            POS_A: [],
            NEG_P: [],
            NEG_E: [],
            NEG_R: [],
            NEG_M: [],
            NEG_A: [],
        };
        this.userJSON = [];
    };

    Coach.prototype.getProfile = function() {
        const profile = {
            sessions: this.info.sessions,
            iterations: this.info.iteration,
            sessionStartTime: this.info.sessionStartTime,
            sessionRunTime: this.info.sessionRunTime,
            firstIssue: this.info.firstIssue,
            lastIssue: this.info.lastIssue,
            depthIssue: this.info.depthIssue,
            json: this.userJSON,
        };
        const data = this.profile;
        for (let i in data) {
            if (!data.hasOwnProperty(i)) continue;
            profile[i] = functions.averageArr(data[i]);
        }
        return profile;
    };

    Coach.prototype.updateProfile = function(data) {
        this.info.sessionRunTime = 
                moment.duration(moment().diff(
                    moment(this.info.sessionStartTime, 'HH:mm:ss')
                )).asSeconds();
        this.userJSON.push(data);

        for (let i in data.stats) {
            if (!data.stats.hasOwnProperty(i)) continue;
            this.profile[i].push(data.stats[i]);
        }
    };

    /**
     * @function newSession
     * @param  {boolean} print run getResponse to print intro statement
     */
    Coach.prototype.newSession = function(print) {
        // reset info but don't reset profile
        let s = this.info.sessions += 1;
        delete this.info;
        this.info = {
            depth: 0,           // current issue depth
            depthIssue: null,   // current 'deep' issue
            firstIssue: null,   // user's first response to 'WWYLTHH'
            iteration: 0,       // current response loop    
            lastCategory: null, // previously selected response category   
            lastIssue: null,    // user's previous item
            lastQuestion: null, // previously selected question
            sessions: s,
            sessionStartTime: moment().format('HH:mm:ss'),  
            sessionRunTime: 0,
        };
        if (print) this.getResponse();
    };

    Coach.prototype.getResponse = function(str) {
        const that = this;
        return new Promise(function(res, rej) {
            const response = that.respond(str);
            if (response) {
                res(response);
            } else {
                rej(new Error('No response found! ', response));
            }
        });
    };

    /**
     * @function respond
     * @param  {string} str user's input
     * @return {object} response object
     */
    Coach.prototype.respond = function(str) {
        // depth control
        this.info.depth += 1;
        if (this.info.depth > this.options.maxDepth) {
            this.info.depth = 0;
            this.info.depthIssue = null;
        }

        // if there is no input...
        if (!str) {
            if (this.info.iteration <= 1) {
                // ... and we're at the start of a conversation, 
                // prompt with welcome statement
                const welcome = functions.chooseRandom(language.welcomes);
                this.info.lastCategory = 'welcome';
                this.info.lastQuestion = welcome;
                return {reply: welcome};
            } else {
                // ... and we're NOT at the start of a conversation, 
                // prompt with confusion
                const unk = functions.chooseRandom(language.unknowns);
                this.info.lastCategory = 'unknown';
                this.info.lastQuestion = unk;
                return {reply: unk}; 
            }
        }

        // bump iteration
        this.info.iteration += 1;

        // string transformation and tokenisation
        const cleanStr = functions.cleanTxt(str);
        const tokens = functions.tokenise(cleanStr, this.options.removeSW);

        // get string info
        const strData = functions.getStrData(this.info.sessions, 
                this.info.iteration, this.info.depth, str, cleanStr, tokens,
                this.info.lastCategory, this.info.lastQuestion);

        // detect special circumstances (i.e. danger / finals)
        const specials = functions.detectSpecial(tokens);
        
        // create reflective statement
        let reflection;
        if (tokens.length > 2) reflection = functions.getReflection(tokens);
       
        // create response question
        const qReply = functions.getQuestion(tokens, cleanStr, strData, 
                this.info.depth, this.info.depthIssue, this.info.lastQuestion, 
                this.options);
        let question = qReply[0];

        // update conversation profile
        this.info.lastQuestion = qReply[1][0];
        this.info.lastCategory = qReply[2];
        this.info.lastIssue = [qReply[3], qReply[4]];
        // @todo improve this
        if (!this.info.firstIssue) {
            this.info.firstIssue = this.info.lastIssue;
        }
        if (this.info.depth === 0 || !this.info.depthIssue) {
            this.info.depthIssue = this.info.lastIssue;
        }
        // this is ugly, do it above instead
        this.info.lastIssue = functions.filterFalsey(this.info.lastIssue);
        this.info.firstIssue = functions.filterFalsey(this.info.firstIssue);
        this.info.depthIssue = functions.filterFalsey(this.info.depthIssue);
        this.updateProfile(strData);

        // modify based on coach options
        if (reflection && this.options.trimFirstAnd) {
            reflection = reflection.substr(4);
        }
        if (this.options.trimSecondAnd) question = question.substr(4);
        
        // combine reflection and question into one string
        let reply = question;
        if (reflection) reply = reflection + ', ' + question;
        return {
            data: strData,
            danger: specials.danger,
            final: specials.final,
            reflection: reflection,
            question: question,
            reply: reply,
        };
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Coach;
        }
        exports.Coach = Coach;
    } else {
        global.Coach = Coach;
    }
})();
