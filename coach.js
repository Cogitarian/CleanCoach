/* @preserve
 * Coach.js by P. Hughes (www.phugh.es)
 * @licence Open source under the AGPLv3 license.
 * @copy Copyright 2018 P. Hughes. All rights reserved.
 * see LICENSE file for further details.
 * 
 * Currently requires compromise.js to be loaded BEFORE coach.js
 */

var version = '0.0.9';

/* ######################
 * Language Data        #
 * ###################### */

// @todo maybe move these to seperate file (e.g. coachdata.js)
var coachPronouns = {
    'am': 'are',
    'your': 'my',
    'me': 'you',
    'myself': 'yourself',
    'yourself': 'myself',
    'i': 'you',
    'you': 'I',
    'my': 'your',
    'i\'m': 'you are',
};

var coachPrepositions = [
    'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid',
    'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below',
    'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by',
    'concerning', 'considering', 'despite', 'down', 'during', 'except',
    'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside',
    'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite',
    'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save',
    'since', 'than', 'through', 'to', 'toward', 'towards', 'under',
    'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with',
    'within', 'without',
];

// @todo add danger phrases, quit phrases,
// and closed loop phrases (e.g. yes/no/maybe)

// danger words
var coachDangerWords = [];
// quit words
var coachQuitWords = [];
// closed loop words
var coachClosedWords = [];

// stop words
var coachStopWords = [
    'a', 'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any',
    'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between',
    'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each',
    'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here',
    'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my',
    'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such',
    'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
    'they', 'this', 'those', 'through', 'to', 'too', 'under', 'up',
    'very', 'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which',
    'while', 'who', 'with', 'would', 'you', 'your',
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
var cleanQuestions = {
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
 * @param  {Array} arr array of possible categories
 * @return {string} selected question
 */
function getQuestion(arr) {
    var i = 0;
    var category = arr[Math.floor(Math.random() * arr.length)];
    var question = cleanQuestions[category][Math.floor(Math.random() *
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
 * @return {string}
 */
function getMods(str) {
    // @todo better way of finding plurals
    if (str && window.nlp(str).nouns().isPlural().out().length > 0) {
        return ['are', 'they', 'them', 'those', 'happen'];
    } else {
        return ['is', 'that', 'that', 'that', 'happens'];
    }
}

/* ######################
 * Coach                #
 * ###################### */

/**
 * @function Coach
 * @param  {string} name coach's name
 */
function Coach(name) {
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
    this.iteration = 1;
    this.previousCategory = null;
    this.previousQuestion = null;
    if (this.keyItems) {
        this.keyItems = this.keyItems.splice(0, this.keyItems.length);
    } else {
        this.keyItems = [];
    }
};

/** @private */
Coach.prototype._initialised = false;

/** @private */
Coach.prototype._init = function() {
    Coach.prototype._initialised = true;
};

Coach.prototype.getResponse = function(str) {
    var that = this;
    // @todo this is where to handle danger / closing statements
    return new Promise(function(resolve, reject) {
        var response = that.respond(str);
        if (response) {
            resolve({reply: response});
        } else {
            reject(new Error('No response found! ', response));
        }
    });
};

Coach.prototype.respond = function(str) {
    // default response
    var response = 'and what would you like to have happen?';

    // string transformation
    var parts = str.toLowerCase().trim().split(' ');
    var i = 0;
    var s = [];

    // construct reflective statement
    var reflection = 'and ';
    parts.forEach(function(part, i) {
        var p = part;
        var w;
        for (w in coachPronouns) {
            if (coachPronouns.hasOwnProperty(w) && part === w) {
                p = coachPronouns[w];
                break;
            }
        }
        // handle 'us'
        if (part === 'us') {
            if (coachPrepositions.indexOf(parts[i - 1]) >= 0) {
                p = 'you';
            } else {
                p = '';
            }
        }
        reflection = reflection + p + ' ';
    });
    reflection = reflection.slice(0, -1).trim();

    // remove stop words
    parts.forEach(function(part) {
        if (coachStopWords.indexOf(part) >= 0) {
            s.push(part);
            parts.splice(i, part.length);
        }
    });

    // modified string
    var newStr = parts.join(' ');

    // @todo need to replace compromise.js with native solution
    var msg = window.nlp(newStr);

    // sort nouns, verbs, and named entities
    var nouns = [];
    var verbs = [];
    var people = [];

    var ns = msg.nouns().data();
    var vs = msg.verbs().data();
    var ps = msg.people().data();

    ns.forEach(function(noun) {
        nouns.push(noun.normal);
    });
    vs.forEach(function(verb) {
        verbs.push(verb.normal);
    });
    ps.forEach(function(person) {
        people.push(person.normal);
    });

    var nl = nouns.length;
    var vl = verbs.length;
    var pl = people.length;

    // question selection and modification
    // @todo this is ugly as sin
    var a = /X/g;
    var b = /Y/g;
    var c = /Z/g;
    var d = /Q/g;
    var e = /T/g;
    var g = /R/g;
    var h = /H/g;
    var j = /D/g;
    var X;
    var Y;

    if (nl > 0 && vl > 0) {
        // 1 or more nouns AND verbs
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS', 'XY_QS',
                'X_QS', 'XY_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
        Y = verbs[Math.floor(Math.random() * vl)];
        if (this.quoteUser) X = '\'' + X + '\'';
        if (this.quoteUser) Y = '\'' + Y + '\'';
        response = response.replace(a, X);
        response = response.replace(b, Y);
    } else if (nl > 0) {
        // 1 or more nouns only
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X = nouns[Math.floor(Math.random() * nl)];
        if (this.quoteUser) X = '\'' + X + '\'';
        response = response.replace(a, X);
    } else if (vl > 0) {
        // 1 or more verbs only
        response = getQuestion(['NONES', 'GENERIC_QS', 'X_QS']);
        X = verbs[Math.floor(Math.random() * vl)];
        if (this.quoteUser) X = '\'' + X + '\'';
        response = response.replace(a, X);
    } else if (pl > 0) {
        // 1 or more named entity only
        response = getQuestion(['NONES', 'GENERIC_QS', 'NE_QS']);
        X = people[Math.floor(Math.random() * pl)];
        if (this.quoteUser) X = '\'' + X + '\'';
        response = response.replace(a, X);
    } else {
        // none of the above
        response = getQuestion(['NONES']);
    }

    var Z = getMods(X);
    response = response.replace(c, Z[0]);
    response = response.replace(d, Z[1]);
    response = response.replace(e, Z[2]);
    response = response.replace(g, Z[3]);
    response = response.replace(h, Z[4]);

    // @todo figure out if we're talking about something actual
    // or something hypothetical
    var future = false;
    if (future) {
        response = response.replace(j, 'would');
    } else {
        response = response.replace(j, 'do');
    }

    // @todo this needs to be moved to Coach.prototype.getResponse
    if (this.debug) {
        console.log('-------------');
        console.log('Iteration: ' + this.iteration);
        console.log('Original string: ' + str);
        console.log('Reflection: ' + reflection);
        console.log('Stop words removed: ' + s.length + ': (' + s + ')');
        console.log('Modified string: ' + newStr);
        console.log('Compromise string: ' + msg.out('text'));
        console.log(nl + ' noun(s): ' + nouns);
        console.log(vl + ' verb(s): ' + verbs);
        console.log(pl + ' person(s): ' + people);
        console.log('Topic data: ', msg.topics().data());
        console.log('Selected response: ' + response);
        console.log('-------------');
    }

    // handle output options
    if (this.trimFirstAnd) {
        reflection = reflection.slice(4);
    }
    if (this.trimSecondAnd) {
        response = response.slice(4);
    }

    // bump iteration
    this.iteration = this.iteration + 1;

    // combine reflection and response into one string
    return reflection + ', ' + response;
};
