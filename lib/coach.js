/* @preserve
 * Coach.js by P. Hughes (www.phugh.es)
 * @license Open source under the AGPLv3 license.
 * @copy Copyright 2018 P. Hughes. All rights reserved.
 * see LICENSE file for further details.
 */
(function() {
  'use strict';
  const pkg = require('../package.json');
  const version = pkg.version;
  const functions = require('./functions.js');
  const language = require('./language.js');

  /* ######################
   * Coach                #
   * ###################### */

  /**
   * @function Coach
   * @param  {string} name Coach's name
   */
  function Coach(name) {
    // set initial options
    this.name = name ? name : 'Clive';
    this.options = {
      debug: false, // print debug info to the console?
      maxDepth: 3, // maxmimum iterations to hold on to a topic
      quoteUser: true, // put quotes around the users input?
      removeSW: false, // remove stop words when tokenising?
      translate: false, // set to true if using anything but en_US
      trimFirstAnd: false, // trim 'and' from reflective statemnt?
      trimSecondAnd: false, // trim 'and' from question?
    };
    this.version = version;
    this.reset();
  }

  Coach.prototype.reset = function() {
    this.info = {
      depth: 0, // current topic depth (0 - maxDepth)
      depthTopic: null, // current topic being held onto until maxDepth is reached
      firstTopic: null, // user's very first topic
      iteration: 0, // current response loop
      lastCategory: null, // previously selected response category
      lastTopic: null, // user's previous item
      lastQuestion: null, // previously selected question
      lastResponse: null, // previous response object
      sessions: 0,
      sessionStartTime: new Date(),
      sessionRunTime: 0,
    };
    this.profile = {
      age: [],
      gender: [],
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
      firstTopic: this.info.firstTopic,
      lastTopic: this.info.lastTopic,
      depthTopic: this.info.depthTopic,
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
    const nowTime = new Date();
    this.info.sessionRunTime = (nowTime - this.info.sessionStartTime) / 1000;
    this.userJSON.push(data);
    for (let i in data.stats) {
      if (!data.stats.hasOwnProperty(i)) continue;
      this.profile[i].push(data.stats[i]);
    }
  };

  /**
   * @function newSession
   * @param  {boolean} prompt run getResponse to print intro statement?
   */
  Coach.prototype.newSession = function(prompt) {
    // reset info but don't reset profile
    let s = (this.info.sessions += 1);
    delete this.info;
    this.info = {
      depth: 0, // current issue depth
      depthTopic: null, // current 'deep' issue
      firstTopic: null, // user's first response to 'WWYLTHH'
      iteration: 0, // current response loop
      lastCategory: null, // previously selected response category
      lastTopic: null, // user's previous item
      lastQuestion: null, // previously selected question
      sessions: s,
      sessionStartTime: new Date(),
      sessionRunTime: 0,
    };
    if (prompt) this.getResponse();
  };

  Coach.prototype.getResponse = function(str, sel) {
    const that = this;
    return new Promise(function(res, rej) {
      const response = that.respond(str, sel);
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
   * @param  {string} sel user's selected section of input
   * @return {object} response object
   */
  Coach.prototype.respond = function(str, sel) {
    // depth control
    this.info.depth += 1;
    if (this.info.depth > this.options.maxDepth) {
      this.info.depth = 0;
      this.info.depthTopic = null;
    }

    // if there is no input...
    if (!str) {
      if (this.info.iteration <= 1) {
        // ... and we're at the start of a conversation,
        // prompt with welcome statement
        const welcome = functions.chooseRandom(language.welcomes);
        this.info.lastCategory = 'welcome';
        this.info.lastQuestion = welcome;
        return { reply: welcome };
      } else {
        // ... and we're NOT at the start of a conversation,
        // prompt with confusion
        const unk = functions.chooseRandom(language.unknowns);
        this.info.lastCategory = 'unknown';
        this.info.lastQuestion = unk;
        return { reply: unk };
      }
    }

    // bump iteration
    this.info.iteration += 1;

    // string transformation and tokenisation
    const cleanStr = functions.cleanTxt(str);
    const tokens = functions.tokenise(cleanStr, this.options.removeSW);

    // get string info
    const strData = functions.getStrData(
      this.info.sessions,
      this.info.iteration,
      this.info.depth,
      str,
      cleanStr,
      sel,
      tokens,
      this.info.lastCategory,
      this.info.lastQuestion,
      this.info.lastResponse,
      this.options.translate
    );

    // detect special circumstances (i.e. danger / finals)
    const specials = functions.detectSpecial(tokens);

    // create reflective statement
    let reflection;
    if (tokens.length > 2) reflection = functions.getReflection(tokens);

    // create response question
    const qReply = functions.getQuestion(
      cleanStr,
      strData,
      sel,
      this.info.depthTopic,
      this.info.lastQuestion,
      this.options
    );
    let question = qReply[0];

    // update conversation profile
    this.info.lastQuestion = qReply[1][0];
    this.info.lastCategory = qReply[2];
    this.info.lastTopic = [qReply[3], qReply[4]];
    // @todo improve this
    if (!this.info.firstTopic) {
      this.info.firstTopic = this.info.lastTopic;
    }
    if (this.info.depth === 0 || !this.info.depthTopic) {
      this.info.depthTopic = this.info.lastTopic;
    }
    // this is ugly, do it above instead
    this.info.lastTopic = functions.filterFalsey(this.info.lastTopic);
    this.info.firstTopic = functions.filterFalsey(this.info.firstTopic);
    this.info.depthTopic = functions.filterFalsey(this.info.depthTopic);
    this.updateProfile(strData);

    // modify based on coach options
    if (reflection && this.options.trimFirstAnd) {
      reflection = reflection.substr(4);
    }
    if (this.options.trimSecondAnd) question = question.substr(4);

    // combine reflection and question into one string
    let reply = question;
    if (reflection) reply = reflection + ', ' + question;
    const response = {
      data: strData,
      danger: specials.danger,
      final: specials.final,
      reflection: reflection,
      question: question,
      reply: reply,
    };
    this.info.lastResponse = response;
    return response;
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
