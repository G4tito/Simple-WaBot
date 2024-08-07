const { logger } = require('./print.js');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let plugins = {};

function loadPlugins(opts = {}) {
    try {
        const dir = path.join(__dirname, '../plugins');
        const cmdFiles = [];

        const watcher = chokidar.watch(dir, {
            persistent: true,
            ignoreInitial: true,
            depth: 1,
            ignored: '*.!(js)',
        });

        watcher
            .on('add', filePath => handlePluginChange(filePath, 'added'))
            .on('change', filePath => handlePluginChange(filePath, 'changed'))
            .on('unlink', filePath => handlePluginChange(filePath, 'removed'));

        function handlePluginChange(filePath, eventType) {
            const file = path.basename(filePath);
            
            if (file.endsWith('.js')) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    
                    if (eventType === 'added' || eventType === 'changed') {
                        addPlugin(filePath, file);
                        logger.info(`Plugin '${file}' ${eventType}.`);
                    } else if (eventType === 'removed') {
                        delPlugin(file);
                        logger.warn(`Plugin '${file}' ${eventType}.`);
                    }
                } catch (e) {
                    logger.error(e, `Plugin '${file}' error.`);
                }
            }
        }

        function readDirectory(directory) {
            const files = fs.readdirSync(directory);
    
            for (const file of files) {
                let filePath = path.join(directory, file);

                if (fs.statSync(filePath).isDirectory()) {
                    readDirectory(filePath);
                } else if (file.endsWith('.js')) {
                    try {
                        addPlugin(filePath, file);
                        cmdFiles.push(file);
                    } catch (e) {
                        logger.error(e, `Plugin '${file}' error.`);
                    }
                }
            }
        }

        readDirectory(dir);
        if (opts.array) console.log(cmdFiles);
        if (opts.table) console.table(cmdFiles.map((value, index) => ({ plugins: value })));
    } catch (e) {
        logger.error(e);
    }
}

function addPlugin(filePath, file) {
    const cmd = require(filePath);
    
    Object.keys(cmd).forEach(type => {
        const setType = type === 'cmd' ? 'commands' :
            type === 'before' ? 'befores' :
            type === 'after' ? 'afters' :
            type;

        if (typeof cmd[type]?.start === 'function') {
            plugins[setType] = plugins[setType] || [];

            const existingIndex = plugins[setType].findIndex(existingCmd => Object.keys(existingCmd)[0] === file);

            if (existingIndex !== -1) {
                plugins[setType][existingIndex] = { [file]: cmd[type] };
            } else {
                plugins[setType].push({ [file]: cmd[type] });
            }
        }
    });
}

function delPlugin(file) {
    const type = Object.keys(plugins).find(v => plugins[v].some(c => Object.keys(c)[0] === file));

    if (plugins[type]) {
        const indexToRemove = plugins[type].findIndex(existingCmd => Object.keys(existingCmd)[0] === file);

        if (indexToRemove !== -1) {
            plugins[type].splice(indexToRemove, 1);
        }
    }
}

module.exports = {
    loadPlugins,
    plugins
};
