const fakeQuoted = require('../fakeQuoted.js');
const db = require('../database.js');
const { formatTime } = require('../func.js');

const avatar = 'https://i.ibb.co/fp6t21w/avatar.jpg';

async function groupParticipantsUpdate(data, sock) {
    const { id, author = null, participants, action, simulate = null } = data;
    const group = db.groups.get(id).setting || {};
    const groupMetadata = await sock.groupMetadata(id);

    switch (action) {
        case 'add':
            if (simulate || group.welcome.status) {

            const teks = (group.welcome.msg === '' 
                ? `*Hola, bienvenid@'s al grupo @group.*\n\n@users` 
                : group.welcome.msg)
                .replace('@users', participants.map(user => `\t🥢. @${user.split('@')[0]}`).join('\n'))
                .replace('@group', groupMetadata.subject)
                .replace('@desc', groupMetadata.desc);

            let pp = await sock.profilePictureUrl(id, 'image').catch(() => avatar);

            await sock.sendMessage(id, {
                image: { url: pp },
                caption: teks,
                mentions: participants
            }, {
                ephemeralExpiration: groupMetadata.ephemeralDuration || 0,
                quoted: await fakeQuoted('poll', { text: 'Date · ' + formatTime('date') })
            });
            }
            break;

        case 'promote':
        case 'demote':
            if (!group.antiraid) return;

            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
            const actionText = action === 'promote'
                ? `*🚩 Anti - Raid.*\n\n*@${author.split('@')[0]}* le dio admin a *@${participants[0].split('@')[0]}*. Para evitar *raid* este mensaje ha mencionado a todos los *admins*.`
                : `*🚩 Anti - Raid.*\n\n*@${author.split('@')[0]}* le quitó admin a *@${participants[0].split('@')[0]}*. Para evitar *raid* este mensaje ha mencionado a todos los *admins*.`;

            await sock.sendMessage(id, {
                text: actionText,
                mentions: [author, ...participants, ...admins]
            }, {
                ephemeralExpiration: groupMetadata.ephemeralDuration || 0,
                quoted: await fakeQuoted('poll', { text: 'Date · ' + formatTime('date') })
            });
            break;
    }
}

module.exports = {
    groupParticipantsUpdate
};