const https = require('https');
const http = require('http');
const { URL } = require('url');

const ufs = (url, timeout = 10000, maxRedirects = 5) => {
    return new Promise((resolve, reject) => {
        if (url instanceof URL) {
            url = url.toString();
        }
        if (typeof url !== 'string') {
            reject(new TypeError('url must be a string or instance of URL'));
        }
        if (typeof timeout !== 'number') {
            reject(new TypeError('timeout must be a number'));
        }
        if (typeof maxRedirects !== 'number') {
            reject(new TypeError('maxRedirects must be a number'));
        }
        if (maxRedirects < 0) {
            reject(new Error('maxRedirects must be greater than 0'));
        }

        let req = url.startsWith('https://') ? https.get(url, { timeout }) : http.get(url, { timeout });

        req.once("response", res => {
            req.destroy();
    
            const { statusCode, headers } = res;
            const { location } = headers;

            if (statusCode >= 300 && statusCode < 400 && location) {
                if (maxRedirects === 0) {
                    return reject(new Error('Too many redirects.'));
                } else {
                    return resolve(ufs(location, timeout, maxRedirects - 1));
                }
            }

            const contentLength = parseInt(headers['content-length'], 10);
            if (!isNaN(contentLength)) {
                return resolve(contentLength);
            }

            const contentRange = headers['content-range'];
            if (contentRange) {
                const totalSize = parseInt(contentRange.split('/')[1], 10);
                return resolve(totalSize);
            }

            return reject(new Error("Couldn't get file size."));
        });

        req.once("error", error => {
            req.destroy();
            reject(new Error(error));
        });

        req.once("timeout", () => {
            req.destroy();
            reject(new Error("Request timed out."));
        });
    });
};

module.exports = ufs;
