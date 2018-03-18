# Coach.js

A clean language coach in ES6.

## Usage

Coach.js currently requires [Compromise](http://compromise.cool/) for PoS tagging.

In your HTML, scripts need to be loaded in this order:
```html
<script src="https://unpkg.com/compromise@latest/builds/compromise.min.js"></script>
<script src="js/coach.js"></script>
<script src="js/main.js"></script>
```

In your main.js:
```javascript
const coach = new Coach("Clive"); // You can give your coach a name here

// configurable options
coach.debug = false; // prints debug info to console
coach.quoteUser = true; // puts quote marks around user input
coach.trimFirstAnd = false; // remove the first "and" from the response
coach.trimSecondAnd = false; // remove the second "and" from the response

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
            output = response.danger;
            // do some danger handling here (e.g. prompt with hotline number)
        } else if (response.final) {
            // input contained a 'final' word (e.g. "goodbye")
            output = response.final;
            // do some final handling here (e.g. promt with save dialogue)
            coach.reset(); // resets the coach to new state
        }
    }
    .catch(error) {
        console.error(error);
    }
return output
```

## License
Coach.js is made available under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3

(C) P. Hughes 2017-18. All rights reserved.

See LICENSE file for full license text