const { watchFile, unwatchFile, readFileSync } = require('fs');

global.img = {
    avatar: readFileSync('./media/image/avatar.jpg'),
    logo: readFileSync('./media/image/logo.jpg')
}

const owner = [
    ['51906956256', '「gatitoツ」']
    // ['number', 'name']
];

const prefixList = ['/', '!', '#', 's!', '', '🍢'];

module.exports = { owner, prefixList };
