const { xpRange } = require('../../lib/levelling.js');

exports.before = {
    async start({ msg, sock, isGroup, isRegistered, isBaileys, db }) {
        if (!isGroup || !isRegistered || isBaileys)
            return !0;

        let group = db.groups.get(msg.from);
        let user = group.users.get(msg.sender);

        if (103 <= user.level)
            return;

        let beforeLevel = user.level;

        while (canLevelUp(user)) {
            user.level++;
            let { xp } = xpRange(user.level);
            user.exp -= xp;
        }

        await db.save();

        if (beforeLevel !== user.level) {
            let teks = '*Felicidades* 🎉! Subiste de *nivel*.\n\n'
                + `- *Tag* ∙ @${msg.sender.split('@')[0]}\n`
                + `- *Nivel* ∙ [ *${beforeLevel}* ] ➠ [ *${user.level}* ]`;
            await msg.reply(teks, { mentions: [msg.sender] });
        }
    }
};

function canLevelUp(user) {
    let nextLevel = user.level + 1;
    let { xp } = xpRange(nextLevel);
    return user.exp >= xp;
}