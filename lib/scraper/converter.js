const { spawn } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');
const Jimp = require('jimp');

function WebpToImg(inputBuffer, outputFormat = 'png') {
    return new Promise((resolve, reject) => {
        let ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-c:v', outputFormat,
            '-f', 'image2pipe',
            'pipe:1'
        ]);
        let chunks = [];

        ffmpeg.stdout.on('data', (chunk) => {
            chunks.push(chunk);
        });

        ffmpeg.stderr.on('data', (data) => {
            //console.error(data);
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                let resultBuffer = Buffer.concat(chunks);
                resolve(resultBuffer);
            } else {
                console.error(code);
                reject(new Error(`ffmpeg process exited with code ${code}.`));
            }
        });

        ffmpeg.stdin.write(inputBuffer);
        ffmpeg.stdin.end();
    });
}

function WebpToVideo(imageBuffer, outputPath = 'v.mp4', duration = 10, framerate = 24) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-loop', '1',
            '-i', 'pipe:0',
            '-t', duration.toString(),
            '-framerate', framerate.toString(),
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-analyzeduration', '100M',
            '-probesize', '500M',
            outputPath
        ]);

        ffmpeg.stdin.write(imageBuffer);
        ffmpeg.stdin.end();

        ffmpeg.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg process exited with code ${code}.`));
            }
        });
    });
}

async function GifToMp4(gifBuffer) {
    const filename = `Converter-${Date.now()}-Ffmpeg`;
    const gifPath = path.join(global.tempDir, `${filename}.gif`);
    const mp4Path = path.join(global.tempDir, `${filename}.mp4`);
    
    return new Promise(async (resolve, reject) => {
        try {
            await writeFileSync(gifPath, gifBuffer);
            const spawnArgs = [
                'ffmpeg',
                '-i', gifPath,
                '-movflags', 'faststart',
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                mp4Path,
            ];
            const ffmpegProcess = spawn(spawnArgs[0], spawnArgs.slice(1));
            let bufs = [];

            ffmpegProcess.on('error', reject);
            ffmpegProcess.stdout.on('data', (chunk) => bufs.push(chunk));

            ffmpegProcess.on('close', async (code) => {
                if (code === 0) {
                    const mp4Buffer = await readFileSync(mp4Path);
                    resolve(mp4Buffer);
                } else {
                    console.error(code);
                    reject(new Error(`ffmpeg process exited with code ${code}`));
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

module.exports = {
    WebpToImg,
    WebpToVideo,
    GifToMp4
};
