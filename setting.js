const { watchFile, unwatchFile, readFileSync } = require('fs');
const moment = require('moment-timezone');
const path = require('path');

global.img = {
    avatar: readFileSync('./media/image/avatar.jpg'),
    logo: readFileSync('./media/image/logo.jpg'),
    cover: readFileSync('./media/image/cover.jpg')
}

const timeZone = 'America/Mexico_City';
moment.locale('es');

const tempName = 'temp';
global.tempDir = path.resolve(__dirname, tempName);

const social = {
    whatsapp: 'https://whatsapp.com/channel/0029Va9awpk2Jl8AQ3oiww3A',
    github: 'https://github.com/G4tito/'
}

const owner = [
    ['51940617554', '「gatitoツ」'],
    ['51906956256']
];

const sticker = {
    author: '© simple-bot.js',
    name: 'Sticker by'
}

const defaultPrefix = ['/', '!', '#', '.', '-', 's!', '', '🪶'];

module.exports = { timeZone, social, owner, defaultPrefix, sticker };
