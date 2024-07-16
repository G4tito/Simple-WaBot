const fs = require('fs');

function DB() {
    const dbPath = './database.json';
    let data = readDB();

    function readDB() {
        const db = {
            users: [],
            groups: [],
            settings: [],
            stickers: [],
            others: []
        };

        try {
            if (fs.existsSync(dbPath)) {
                const data = fs.readFileSync(dbPath, 'utf-8');
                return JSON.parse(data);
            } else {
                return db;
            }
        } catch (e) {
            console.error(e);
            return db;
        }
    }

    function writeDB() {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf-8');
        } catch (e) {
            console.error(e);
        }
    }

    return {
        users: {
            add: function(user_jid, user_data) {
                const new_user = {
                    jid: user_jid,
                    profile: user_data,
                };
                data.users.push(new_user);
                writeDB();
                return new_user;
            },
            get: function(user_jid) {
                const user_data = data.users.find(c => c.jid === user_jid);
                return {
                    ...user_data,
                    set: function(update_data) {
                        const index = data.users.findIndex(u => u.jid === user_jid);
                        if (index !== -1) {
                            data.users[index] = { ...data.users[index], ...update_data };
                            writeDB();
                            return data.users[index];
                        } else {
                            return null;
                        }
                    },
                    del: function(field) {
                        const index = data.users.findIndex(u => u.jid === user_jid);
                        if (index !== -1 && data.users[index][field] !== undefined) {
                            delete data.users[index][field];
                            writeDB();
                            return true;
                        } else {
                            return null;
                        }
                    }
                }
            },
            list: function() {
                return data.users;
            },
            exist: function(user_jid) {
                return data.users.some(u => u.jid === user_jid);
            },
            del: function(user_jid) {
                const users = data.users.filter(u => u.jid !== user_jid);
                if (users.length === data.users.length) {
                    return null;
                } else {
                    data.users = users;
                    writeDB();
                    return true;
                }
            }
        },
        stickers: {
            add: function(sticker_data) {
                data.stickers.push(sticker_data);
                writeDB();
                return sticker_data;
            },
            get: function(string) {
                return data.stickers.find(s => s.string === string);
            },
            list: function() {
                return data.stickers;
            },
            exist: function(string) {
                return data.stickers.some(s => s.string === string);
            },
            del: function(string) {
                const stickers = data.stickers.filter(s => s.string !== string);
                if (stickers.length === data.stickers.length) {
                    return null;
                } else {
                    data.stickers = stickers;
                    writeDB();
                    return true;
                }
            }
        }
    };
}

module.exports = DB();
