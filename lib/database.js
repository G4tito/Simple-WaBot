const { defaultPrefix } = require('../setting.js');
const fs = require('fs');

function DB() {
    const dbPath = './database.json';
    let db = readDB();

    function readDB() {
        const defaultData = {
            users: [],
            groups: [],
            settings: [],
            stickers: [],
            others: []
        };

        try {
            if (fs.existsSync(dbPath)) {
                const dbContent = fs.readFileSync(dbPath, 'utf-8');
                return JSON.parse(dbContent);
            } else {
                return defaultData;
            }
        } catch (e) {
            console.error(e);
            return defaultData;
        }
    }

    function writeDB() {
        try {
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), 'utf-8');
        } catch (e) {
            console.error(e);
        }
    }

    return {
        groups: {
            add: function(jid) {
                if (this.exist(jid))
                    return false;
                const group = {
                    jid,
                    setting: {
                        banned: false,
                        detect: false,
                        nsfw: false,
                        antilink: false,
                        antiraid: false,
                        antivo: false,
                        welcome: {
                            status: false,
                            msg: ''
                        }
                    },
                    users: []
                };
                db.groups.push(group);
                return group;
            },
            get: function(jid) {
                const group = db.groups.find(c => c.jid === jid);
                return {
                    ...group,
                    users: {
                        add: function(userJid) {
                            if (this.exist(userJid))
                                return false;
                            const user = {
                                jid: userJid,
                                level: 1,
                                exp: 0,
                                money: 0,
                                limit: 7,
                                cooldown: {
                                    work: 0,
                                    daily: 0
                                }
                            };
                            group.users.push(user);
                            return user;
                        },
                        get: function(userJid) {
                            return group.users.find(c => c.jid === userJid);
                        },
                        list: function() {
                            return group.users;
                        },
                        exist: function(userJid) {
                            return group.users.some(u => u.jid === userJid);
                        },
                        del: function(userJid) {
                            const users = group.users.filter(u => u.jid !== userJid);
                            if (users.length === group.users.length) {
                                return null;
                            } else {
                                group.users = users;
                                return true;
                            }
                        }
                    }
                };
            },
            list: function() {
                return db.groups;
            },
            exist: function(jid) {
                return db.groups.some(group => group.jid === jid);
            },
            del: function(jid) {
                const groups = db.groups.filter(group => group.jid !== jid);
                if (groups.length === db.groups.length) {
                    return null;
                } else {
                    db.groups = groups;
                    return true;
                }
            }
        },
        users: {
            add: function(jid, { name = '', id = '', time = 0 } = {}) {
                if (this.exist(jid))
                    return false;
                const user = {
                    jid,
                    name,
                    id,
                    time,
                    banned: {
                        status: false,
                        time: 0
                    },
                    premium: {
                        status: false,
                        time: 0
                    },
                    sticker: {
                        author: false,
                        name: false
                    }
                };
                db.users.push(user);
                return user;
            },
            get: function(jid) {
                return db.users.find(c => c.jid === jid);
            },
            list: function() {
                return db.users;
            },
            exist: function(jid) {
                return db.users.some(u => u.jid === jid);
            },
            del: function(jid) {
                const users = db.users.filter(u => u.jid !== jid);
                if (users.length === db.users.length) {
                    return null;
                } else {
                    db.users = users;
                    return true;
                }
            }
        },
        settings: {
            add: function(jid) {
                if (this.exist(jid))
                    return false;
                const data = {
                    jid,
                    mode: 'public',
                    cover: '',
                    prefix: defaultPrefix,
                    autojoin: false
                }
                db.settings.push(data);
                return data;
            },
            get: function(jid) {
                return db.settings.find(c => c.jid === jid);
            },
            list: function() {
                return db.settings;
            },
            exist: function(jid) {
                return db.settings.some(u => u.jid === jid);
            },
            del: function(jid) {
                const settings = db.settings.filter(u => u.jid !== jid);
                if (settings.length === db.settings.length) {
                    return null;
                } else {
                    db.settings = settings;
                    return true;
                }
            }
        },
        stickers: {
            add: function(data) {
                if (this.exist(data.string))
                    return false;
                db.stickers.push(data);
                return data;
            },
            get: function(string) {
                return db.stickers.find(s => s.string === string);
            },
            list: function() {
                return db.stickers;
            },
            exist: function(string) {
                return db.stickers.some(s => s.string === string);
            },
            del: function(string) {
                const stickers = db.stickers.filter(s => s.string !== string);
                if (stickers.length === db.stickers.length) {
                    return null;
                } else {
                    db.stickers = stickers;
                    return true;
                }
            }
        },
        save: function() {
            writeDB();
            return true;
        }
    };
}

module.exports = DB();
