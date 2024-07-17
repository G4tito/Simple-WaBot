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

const owner = [
    ['51906956256', '「gatitoツ」']
    // ['number', 'name']
];

const prefixList = ['/', '!', '#', '-', 's!', ' ', '🪶'];

module.exports = { timeZone, owner, prefixList };
