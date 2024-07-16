const PhoneNumber = require('awesome-phonenumber');
const moment = require('moment-timezone');
const chalk = require('chalk');
const pino = require('pino');
const pretty = require('pino-pretty');
const cfonts = require('cfonts');

const { getName } = require('./func.js');
const { timeZone } = require('../setting.js');

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

    cfonts.say('Designed by: G4tito|--- ### ---', {
        align: 'center',
        colors: ['candy'],
        font: 'console',
        space: true
    });
}

async function printLog(context) {
    const { msg, sock, args, command, groupName, isGroup, isCommand } = context;

    let number = (await PhoneNumber('+' + msg.sender.split('@')[0])).getNumber('international');
    let text = msg.text
        .replace(/\*(.*?)\*/g, (match, p1) => chalk.bold(p1))
        .replace(/_(.*?)_/g, (match, p1) => chalk.italic(p1))
        .replace(/~(.*?)~/g, (match, p1) => chalk.strikethrough(p1))
        .replace(/```([^`]*)```/g, (match, p1) => chalk.whiteBright(p1.split('').join(' ')))
        .replace(/@(\d+)/g, (match, p1) => chalk.green(
            msg.mentions.includes(p1 + '@s.whatsapp.net') 
            ? '@' + getName(p1 + '@s.whatsapp.net') 
            : '@' + p1
        ))
        .replace(/(https?:\/\/[^\s]+)/g, (match, p1) => chalk.blue.underline(p1));

    let header = chalk.bold.bgGreen.hex('#000000')(` ${isGroup ? groupName : 'Private Message'} `);
    let userInfo = `${chalk.bold.rgb(255, 153, 0)('@' + (sock.user.jid === msg.sender ? (sock.user?.name || 'bot') : msg.pushName))} (${chalk.green.bold(number)})`;
    let commandInfo = `${chalk.magenta.bold(command)} [${chalk.yellow.bold(args.length)}]`;
    let separator = chalk.gray('-'.repeat(50));

    let log = '\n'
        + `${header} ${chalk.dim(moment().tz(timeZone).format('YYYY-MM-DD HH:mm') + ` (${timeZone})`)}` + '\n'
        + `${userInfo} ${chalk.white.bold('›')} ${chalk.blue.bold(msg.from)}` + '\n' 
        + separator + '\n' 
        + ` 🍟 ${chalk.green.bold('Command :')} ${isCommand ? commandInfo : chalk.yellow('false')}` + '\n' 
        + ` 💬 ${chalk.green.bold('Text :')} ${chalk.whiteBright(text)}` + '\n' 
        + ` 🧩 ${chalk.green.bold('Message Type :')} ${chalk.black(chalk.bgYellow(msg.type))}` + '\n' 
        + separator;

    console.log(log);
}

module.exports = { logger, displayTitle, printLog };
