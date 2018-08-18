/* @preserve
 * questions.js by P. Hughes (www.phugh.es)
 * @license Open source under the AGPLv3 license.
 * @copy Copyright 2018 P. Hughes. All rights reserved.
 * see LICENSE file for further details.
 */


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
exports.cleanQuestions = {
    // no matchable input found = no modifications needed
    NONES: [
        ['and what would you like to have happen?', 'intention'],
        ['and is there anything else?', 'attributes'],
        ['and what happens next?', 'sequence'],
        ['and then what happens?', 'sequence'],
        ['and what needs to happen?', 'necessary conditions'],
        ['and is there anything else that needs to happen?', 
                'necessary conditions'],
    ],
    // generic questions = previous match or modification required
    GENERIC_QS: [
        ['and is there anything else about that?', 'attributes'],
        ['and whereabouts D you feel T?', 'location'],
        ['and what Z Q like?', 'metaphor'],
        ['and what happens just before T?', 'sequence'],
        ['and where could Q come from?', 'source'],
        ['and where would Q come from?', 'source'],
        ['and if Q H, what would you like to happen now?', 'intention'],
        ['and what needs to happen for R?', 'necessary conditions'],
        ['and R Z like what?', 'metaphor'],
    ],
    // questions with space for 1 item (X) and subsequent mods
    X_QS: [
        ['and what kind of X Z Q?', 'attributes'],
        ['and what kind of X Z R X?', 'attributes'],
        ['and what kind of X?', 'attributes'],
        ['and is there anything else about X?', 'attributes'],
        ['and where Z X?', 'location'],
        ['and whereabouts Z X?', 'location'],
        ['and X Z like what?', 'metaphor'],
        ['and that\'s X like what?', 'metaphor'],
        ['and when X H, what happens next?', 'sequence'],
        ['and what happens after X?', 'sequence'],
        ['and what happens just before X?', 'sequence'],
        ['and where could X come from?', 'source'],
        ['and what needs to happen for X?', 'necessary conditions'],
        ['and can X happen?', 'necessary conditions'],
        ['and when X, R Z like what?', 'metaphor'],
    ],
    // questions with space for 2 items (X, Y) and mods
    XY_QS: [
        ['and what is the relationship between X and Y?', 'relationship'],
        ['and what is the relationship between Y and X?', 'relationship'],
        ['and when X H, what happens to Y?', 'relationship'],
        ['and when Y H, what happens to X?', 'relationship'],
        ['and when X, what happens to Y?', 'relationship'],
    ],
    // questions with space for 1 named entitiy
    NE_QS: [
        ['and what would X like to have happen?', 'intention'],
    ],
};
