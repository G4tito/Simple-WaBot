const pino = require('pino');
const pretty = require('pino-pretty');
const cfonts = require('cfonts');

const stream = pretty({
    colorize: true
});

const logger = pino({ level: 'trace' }, stream);

function displayTitle() {
    cfonts.say('Wa-Bot', {
        align: 'center',
        colors: ['#DC143C', 'gray'],
        font: 'pallet',
        letterSpacing: 2,
        space: true
    });

    cfonts.say(`Designed by: G4tito|${'-'.repeat(11)}|###`, {
        align: 'center',
        colors: ['#FFA500'],
        font: 'console',
        space: true
    });
}

module.exports = { logger, displayTitle };
