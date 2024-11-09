const { G4F } = require('g4f');
const g4f = new G4F();

const Messages = {};

exports.cmd = {
    name: ['chatgpt'],
    command: ['chatgpt', 'gpt', 'ia', 'ai'],
    category: ['other'],
    detail: {
        desc: 'Interactúa con la inteligencia artificial de OpenAI.',
        use: 'texto'
    },
    async start({ msg, sock, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa un texto para interactuar con la IA de OpenAI.*');
        }
        
        await sock.sendPresenceUpdate('composing', msg.from);

        const fromId = msg.from;
        const userId = msg.sender;

        if (!Messages[fromId]) {
            Messages[fromId] = {};
        }

        const fromMessages = Messages[fromId];
        if (!fromMessages[userId]) {
            fromMessages[userId] = [];
        }

        const userMsgs = fromMessages[userId];
        userMsgs.push({ role: 'user', content: text });

        const res = await g4f.chatCompletion(userMsgs);

        if (!res) {
            return msg.reply('*⚠️︱Se produjo un error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.*');
        }

        userMsgs.push({ role: 'assistant', content: res });
        fromMessages[userId] = userMsgs;
        Messages[fromId] = fromMessages;

        await msg.reply(res);
    }
};