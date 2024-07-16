const { readdir, stat, unlink, open } = require('fs').promises;
const { tmpdir } = require('os');
const { join } = require('path');
const { platform } = require('process');
const fs = require('fs');

const TIME = 1000 * 60 * 3; // 3 min.

async function clearTmp() {
    if (!fs.existsSync(global.tempDir)) {
        fs.mkdirSync(global.tempDir);
    }

    const tmpDirs = [tmpdir(), global.tempDir];

    const promises = tmpDirs.map(async (dir) => {
        try {
            const files = await readdir(dir);
            const currentTime = Date.now();

            await Promise.all(files.map(async (file) => {
                const filePath = join(dir, file);
                const fileStat = await stat(filePath);

                if (fileStat.isFile() && (currentTime - fileStat.mtimeMs >= TIME)) {
                    if (platform === 'win32') {
                        let fileHandle;
                        try {
                            fileHandle = await open(filePath, 'r+');
                        } catch (e) {
                            console.error('[clearTmp]', e, 'Skipping', filePath);
                            return e;
                        } finally {
                            await fileHandle?.close();
                        }
                    }

                    await unlink(filePath);
                }
            }));
        } catch (e) {
            console.error('[clearTmp]', e, 'Skipping', dir);
            return e;
        }
    });

    return await Promise.allSettled(promises);
}

module.exports = clearTmp;
