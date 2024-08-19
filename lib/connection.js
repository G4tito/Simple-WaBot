const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    Browsers,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');
const chalk = require('chalk');

const { logger } = require('./print.js');
const { decodeJid } = require('./func.js');
const store = require('./store.js');
const serialize = require('./serialize.js');
const handler = require('../handler.js');
const db = require('./database.js');

const processedMessages = new Set();
const usePairingCode = process.argv.includes('--use-pairing-code');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function connectSock() {
    const { state, saveCreds } = await useMultiFileAuthState('session', pino({ level: 'fatal' }));
    const { version, isLatest } = await fetchLatestBaileysVersion();
    logger.info(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
        version,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: 'fatal' }),
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 0,
        markOnlineOnConnect: true,
        getMessage: async (key) =>
            (await store.loadMessage(key.remoteJid, key.id) ||
                (await store.loadMessage(key.id)) || {}).message || undefined,
    });

    if (usePairingCode && !sock.authState.creds.registered) {
        setTimeout(async () => {
            rl.question(
                `${chalk.bold.whiteBright('\nIngresa el número de teléfono de WhatsApp donde estará el bot.')}\n${chalk.bold.whiteBright('Nro')}: `,
                async function (phoneNumber) {
                    await sock.waitForConnectionUpdate((update) => !!update.qr);
                    let code = await sock.requestPairingCode(phoneNumber.replace(/\D/g, ''));
                    console.log(`\n${chalk.bold.greenBright('🟢 Código')} : ${code.match(/.{1,4}/g)?.join('-')}\n`);
                    rl.close();
                }
            );
        }, 3000);
    }

    sock.ev.on('creds.update', await saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        let m = messages[messages.length - 1];
        if (!m.message) return;

        try {
            if (processedMessages.has(m.key.id)) return;
            processedMessages.add(m.key.id);

            const msg = serialize(m, sock);
            handler(msg, sock);

            setTimeout(() => processedMessages.delete(m.key.id), 420000);
        } catch (e) {
            console.error(e);
        }
    });

    store.bind(sock.ev);

    sock.ev.on('connection.update', async (update) => {
        const { lastDisconnect, connection } = update;

        if (!usePairingCode && update.qr) {
            logger.info('Escanea el QR, expira en 60 segundos.');
        }

        if (connection === 'connecting') {
            logger.info('🕓 Conectando..');
        }

        if (connection === 'open') {
            logger.info('✅ Conectado');
            sock.user.jid = decodeJid(sock.user.id);

            if (!db.settings.exist(sock.user.jid)) {
                await db.settings.add(sock.user.jid);
                await db.save();
            }
        }

        if (connection === 'close') {
            logger.warn({ error: update }, '🔌 Desconectado');
            const shouldReconnect =
                lastDisconnect.error instanceof Boom
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;

            if (shouldReconnect) {
                logger.info('🔄 Reconectando..');
                connectSock();
            }
        }
    });

    sock.ev.on('group-participants.update', (data) => groupParticipantsUpdate(data, sock));
    return sock;
}

module.exports = connectSock;