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

## CLI
```bash
npm install -g
```
will install a command-line interface called 'cleancoach' which can be used in your terminal.

## Browser Usage
You can browserify the node module by doing:
```bash
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