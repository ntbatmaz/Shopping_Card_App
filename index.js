const fs = require('fs');
const { getInputFilePath, getOutputFilePath } = require('./fileUtils');
const Cart = require('./cart');

function processInputFile() {
    const inputFilePath = getInputFilePath();
    const outputFilePath = getOutputFilePath();
    const cart = new Cart();

    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading input file:', err);
            return;
        }

        try {
            const commands = JSON.parse(data);
            const results = [];

            for (const command of commands) {
                const result = cart.processCommand(command.command, command.payload);
                results.push(result);
            }

            const outputData = results.map(result => JSON.stringify(result)).join('\n');

            fs.writeFile(outputFilePath, outputData, 'utf8', err => {
                if (err) {
                    console.error('Error writing output file:', err);
                } else {
                    console.log('Output file written successfully:', outputFilePath);
                }
            });
        } catch (err) {
            console.error('Error processing input file:', err);
        }
    });
}

processInputFile();
