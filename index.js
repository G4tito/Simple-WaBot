console.log('☕ Starting..');

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let isRunning = false;

function start(file) {
    if (isRunning) return;
    isRunning = true;

    const args = [path.join(__dirname, file), ...process.argv.slice(2)];
    const p = spawn(process.argv[0], args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    p.on('message', (data) => {
        if (data === 'restart') {
            console.log('🍃 Restarting..');
            p.kill();
            isRunning = false;
            start.apply(this, arguments);
        }
    });

    p.on('exit', (code) => {
        isRunning = false;
        if (code) {
            console.error('Exited with code:', code);
        }
        if (code === 0) return;
        
        fs.watchFile(args[0], () => {
            fs.unwatchFile(args[0]);
            start(file);
        });
    });
}

start('main.js');
