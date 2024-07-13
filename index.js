process.on('uncaughtException', console.error);

const { logger, displayTitle } = require('./lib/print.js');
const { loadPlugins } = require('./lib/plugins.js');
const connectSock = require('./lib/connection.js');

displayTitle();

async function start() {
    logger.info('Cargando plugins..');
    await loadPlugins({ table: true });
    
    await connectSock()
        .catch(e => console.log(e));
}

start();
