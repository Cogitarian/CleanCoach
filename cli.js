#!/usr/bin/env node
const readline = require('readline');
const Coach = require('./lib/coach.js');
const clive = new Coach();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * @function recursiveAsyncReadLine
 * @param  {string} q question
 */
function recursiveAsyncReadLine(q) {
    if (!q) q = 'and what would you like to have happen?';
    rl.question(`\n> ${q}\n`, function(answer) {
        clive.getResponse(answer)
            .then((response) => {
                if (response.reply) {
                    recursiveAsyncReadLine(response.reply);
                } else if (response.final) {
                    clive.reset();
                    console.log(response.reply);
                    return rl.close();
                } else if (response.danger) {
                    console.log('a list of crisis resources is available at https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines');
                    recursiveAsyncReadLine(response.reply);
                } else {
                    q = (`I'm sorry, I didn't understand that. Try again.`);
                    recursiveAsyncReadLine(q);
                }
            }).catch((err) => console.error(err));
    });
}

recursiveAsyncReadLine();
