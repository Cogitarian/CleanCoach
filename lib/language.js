/* ######################
 * Language Data        #
 * ###################### */

exports.coachPronouns = {
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

exports.coachPrepositions = [
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
exports.coachDangerWords = [
    'suicide',
];
// quit words
exports.coachQuitWords = [
    'goodbye',
];
// closed loop words
exports.coachClosedWords = [];

// stop words
exports.coachStopWords = [
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

// welcome statements
exports.welcomes = [
    'Hello there, and what would you like to have happen?',
    'Welcome to the session. What would you like to have happen?',
];

// unknown statements
exports.unknowns = [
    'I didn\'t quite understand that, try rewording it.',
    'I\'m sorry, I didn\'t understand that. Please try again.',
];

exports.finals = [
    'Goodbye.  It was nice talking to you.',
    'Goodbye.  This was really a nice talk.',
    'Goodbye.  I\'m looking forward to our next session.',
    'This was a good session, wasn\'t it -- but time is over now. Goodbye.',
    'Maybe we could discuss this further in our next session ? Goodbye.',
];
