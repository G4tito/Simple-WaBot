const axios = require('axios');
const { getRandom } = require('../func.js');

let flags = [];
const sessions = [];

function guessFlag() {
    async function loadFlags() {
        if (flags.length === 0) {
            const response = await axios.get('https://raw.githubusercontent.com/G4tito/storage/main/game/guess-flag.json');
            flags = response.data;
        }
    }
    return {
        flag: async function() {
            await loadFlags();
            return getRandom(flags);
        },
        save: function(id, from, flag) {
            const session = {
                id,
                from,
                flag,
                attempts: 0
            };
            sessions.push(session);
        },
        get: function(from, id) {
            return sessions.find(s => s.from === from && s.id === id);
        },
        exist: function(from) {
            return sessions.some(s => s.from === from);
        },
        del: function(from) {
            const sessionIndex = sessions.findIndex(s => s.from === from);
            if (sessionIndex !== -1) {
                sessions.splice(sessionIndex, 1);
            }
        }
    };
}

module.exports = guessFlag();
