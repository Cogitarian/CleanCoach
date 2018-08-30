# CleanCoach

CleanCoach is a clean language coaching bot written in ES6.

## Node Usage
CleanCoach can be required just like any other node module.

```javascript
const Coach = require('CleanCoach');
const clive = new Coach("Clive"); // you can give the coach a custom name here
let response = clive.getResponse("user input here");
console.log(response);
```

The primary ways of interacting with CleanCoach are:
```javascript
const clive = new Coach("Clive"); // initialise a new coach with a name
clive.getResponse(str, sel); // get a clean response to a users input string
clive.getProfile(); // returns an object with many psychometrics about the session so for
clive.newSession(false); // begins a new session
clive.reset(); // resets the coach to a brand new state
```

### getResponse(str, sel)

Takes an input string (str) and generates a response. getResponse is promise based so you can use .then and .catch etc.

getResponse can also take an optional 'sel' argument, which is another string. If the 'sel' string is present, the 'str' arugment will be used to formulate the reflective statement, and the 'sel' string will be used only to formulate the question. This can be useful for taking a user selected chunk of the 'str' string to use as focus for question creation.

The response is an object with the following structure:

```javascript
{
    data: {},  // {Object} psychometric and session data about the input
    danger: false,    // {boolean} did the input contain a 'danger' word (e.g. suicide)?
    final: false,  // {boolean} did the input contain a closing word (e.g. goodbye)?
    reflection: 'and you want to get better at programming.',   // {string} a reflective statement
    question: 'and what would you like to have happen?', // {string} a clean coaching question
    reply: 'and you want to get better at programming. and what would you like to have happen?',    // {string} reflection + question
};
```

### getProfile()

Dumps all the session data into an object which looks like this:

```javascript
{
    "sessions":0,   // total number of sessions
    "iterations":1, // total number of iterations in current sessions
    "sessionStartTime":"12:00:33",  // current session start time in HH:mm:ss
    "sessionRunTime":4.861, // current session run time in seconds
    "firstIssue":["moon"],  // the first item brought to the session
    "lastIssue":["moon"],   // the most recent item brought to the session
    "depthIssue":["moon"],  // the current 'depth' anchor item
    "json":
        [{
            "id":"0_1", // session_iteration
            "session":0,    // session number
            "iteration":1,  // iteration 
            "time":"12:00:37",  // timestamp
            "depth":1,  // depth at this point
            "category":null,    // question category
            "question":null,    // unedited question
            "originalStr":"I want to go to the moon",   // user's input
            "cleanedStr":"i want to go to the moon",    // cleaned input
            "tokens":["i","want","to","go","to","the","moon"],  // array of tokens
            "stats":{
                // !these stats are just for this one iteration!
                "age":92.2602,  // age characteristics of the string
                "gender":60.9501,   // gender characteristics of the string
                "past":-0.8187, // degree to which the string is past focused
                "present":-0.0608, // degree to which the string is present focused
                "future":-0.1899, // degree to which the string is future focused
                "optimism":4.90994586,  // optimism = positive sentiment + future focus
                "affect":5.0639,    // affect is degree of positive / negative sentiment...
                "intensity":2.5057, // ... intensity is the degree of exageration of that affect
                "POS_P":0.1926, // Seligman's PERMA theory
                "POS_E":0.5128,
                "POS_R":-0.0735,
                "POS_M":0.2261,
                "POS_A":0.1846,
                "NEG_P":0.1084,
                "NEG_E":0.3489,
                "NEG_R":0.1705,
                "NEG_M":0.1441,
                "NEG_A":0.2175
            },
            "pos":{
                "nouns":["moon"],
                "verbs":["want","go"],
                "entities":[],
                "sentences":["i want to go to the moon"],
                "adjectives":[]
            }
        }],
    // unlike the stats above, these below are averages for the entire session
    "age":92.2602,
    "gender":60.9501,
    "past":-0.8187,
    "present":-0.0608,
    "future":-0.1899,
    "optimism":4.90994586,
    "affect":5.0639,
    "intensity":2.5057,
    "POS_P":0.1926,
    "POS_E":0.5128,
    "POS_R":-0.0735,
    "POS_M":0.2261,
    "POS_A":0.1846,
    "NEG_P":0.1084,
    "NEG_E":0.3489,
    "NEG_R":0.1705,
    "NEG_M":0.1441,
    "NEG_A":0.2175
}
```

### newSession(false)

First look at the output of getProfile(). New session will bump the "sessions" number, and reset the following data to a blank state:
```javascript
clive.info: {
    "iterations":0, // total number of iterations in current sessions
    "sessionStartTime": null,  // current session start time
    "sessionRunTime": 0, // current session run time in seconds
    "firstIssue":[],  // the first item brought to the session
    "lastIssue":[],   // the most recent item brought to the session
    "depthIssue":[],  // the current 'depth' anchor item
}
```
newSession will not reset any other profile information. To completely wipe all other profile information, use Coach.reset();

newSession takes one argument, a boolean. If the boolean is true, newSession() will also call getResponse() which will return a response object with a generic clean language question to get the new session started.

## Options
CleanCoach has several options you can customise:
```javascript
const clive = new Coach("Clive"); // initialise a new coach with a name
clive.options = {
    debug: false,           // print debug info to the console?
    maxDepth: 3,            // maxmimum iterations to hold on to an item
    quoteUser: true,        // put quotes around the users input?
    removeSW: false,        // remove stop words when tokenising?
    trimFirstAnd: false,    // trim 'and' from reflective statemnt?
    trimSecondAnd: false,   // trim 'and' from question?
};
```

## CLI
```sh
npm install -g
```
will install a command-line interface called 'cleancoach' which can be used in your terminal.

## Browser Usage
You can browserify the node module by doing:
```sh
npm run build
```
which will create a standalone coach.js file in the 'dist' folder.

In your main.js:
```javascript
const coach = new Coach("Clive"); // You can give your coach a name here

// configurable options
coach.options.debug = false; // prints debug info to console
coach.options.maxDepth = 3; // maximum iterations to hold on to a topic
coach.options.quoteUser = true; // puts quote marks around user input
coach.options.removeSW = false; // remove stop-words when tokenising
coach.options.trimFirstAnd = false; // remove "and" from the reflective statement
coach.options.trimSecondAnd = false; // remove "and" from the response question

// define a standard response in case of error
let output = "Sorry, I didn't understand that. Try again."

// Give the coach some input text (string) and get a response
coach.getResponse(string)
    .then(response) {
        if (response.reply) {
            // standard response
            output = response.reply;
        } else if (response.danger) {
            // input contained a danger word (e.g. "suicide")
            // do some danger handling here (e.g. prompt with hotline number)
            output = response.reply;
        } else if (response.final) {
            // input contained a 'final' word (e.g. "goodbye")
            // do some final handling here (e.g. promt with save dialogue)
            coach.reset(); // resets the coach to new state
        }
    }
    .catch(error) {
        console.error(error);
        coach.reset(); // resets the coach to new state
    }
return output
```

## License
CleanCoach is made available under the [GNU AFFERO GENERAL PUBLIC LICENSE Version 3](https://www.gnu.org/licenses/agpl-3.0.en.html)

(C) [P. Hughes](https://www.phugh.es) 2017-18. All rights reserved.

See LICENSE file for full license text