const process = require('process');

function getInputFilePath() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        return args[0];
    }
    throw new Error('Input file path is missing.');
}

function getOutputFilePath() {
    const args = process.argv.slice(2);
    if (args.length > 1) {
        return args[1];
    }
    throw new Error('Output file path is missing.');
}

module.exports = {
    getInputFilePath,
    getOutputFilePath
};
