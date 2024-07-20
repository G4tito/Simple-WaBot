process.on('uncaughtException', console.error);

const { logger, displayTitle } = require('./lib/print.js');
const { loadPlugins } = require('./lib/plugins.js');
const clearTmp = require('./lib/clearTmp.js');
const connectSock = require('./lib/connection.js');

displayTitle();

async function start() {
    logger.info('Cargando plugins..');
    await loadPlugins({ table: true });

    // Clear Tmp: 1 min.
    setInterval(async () => {
        await clearTmp();
    }, 1 * 60 * 1000);

    await connectSock()
        .catch(e => console.log(e));
}

start();
