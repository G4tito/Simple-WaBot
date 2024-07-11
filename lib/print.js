const pino = require('pino');
const pretty = require('pino-pretty');

const stream = pretty({
    colorize: true
});

const logger = pino({ level: 'trace' }, stream);

module.exports = { logger }
