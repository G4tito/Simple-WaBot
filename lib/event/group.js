const db = require('../database.js');

const avatar = 'https://i.ibb.co/fp6t21w/avatar.jpg';

async function groupParticipantsUpdate(data, sock) {
    const { id, author = null, participants, action } = data;
    const group = db.groups.get(id).setting || {};
    const groupMetadata = await sock.groupMetadata(id);

    switch (action) {
        case 'add':
            if (!group.welcome.status) return;

            if (participants.length > 1) {
                let pp = await sock.profilePictureUrl(id, 'image').catch(() => avatar);
                const userList = participants.map(user => `- @${user.split('@')[0]}`).join('\n');
                const teks = `Hola, bienvenid@s al grupo *@${groupMetadata.subject}*.\n\n${userList}`;

                await sock.sendMessage(id, {
                    image: { url: pp },
                    caption: teks,
                    mentions: participants
                }, {
                    ephemeralExpiration: groupMetadata.ephemeralDuration || 0
                });
            } else {
                let user = participants[0];
                let pp = await sock.profilePictureUrl(user, 'image').catch(() => avatar);

                const teks = `Hola *@${user.split('@')[0]}*, bienvenid@ al grupo *@${groupMetadata.subject}*.`;

                await sock.sendMessage(id, {
                    image: { url: pp },
                    caption: teks,
                    mentions: [user]
                }, {
                    ephemeralExpiration: groupMetadata.ephemeralDuration || 0
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
                ephemeralExpiration: groupMetadata.ephemeralDuration || 0
            });
            break;
    }
}

module.exports = {
    groupParticipantsUpdate
};
