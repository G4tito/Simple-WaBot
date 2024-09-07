const yts = require('yt-search');
const axios = require('axios');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const download = {
    V1: async function dl(url, opts = {}) {
        try {
            const { type = 'video', quality = 360 } = opts;
            const format = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : null;

            if (!format) {
                return {
                    status: false,
                    msg: 'Invalid type specified.'
                };
            }

            const defaultHeaders = {
                "accept-language": "es-419,es-US;q=0.9,es;q=0.8",
                "Referer": "https://savefrom.fun/",
            };

            const initialResponse = await fetch("https://savefrom.fun/", {
                headers: {
                    ...defaultHeaders,
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                },
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET"
            });

            const cookies = initialResponse.headers.raw()['set-cookie'] || [];
            const cleanedCookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');

            const $pageContent = cheerio.load(await initialResponse.text());
            const csrfToken = $pageContent('meta[name="csrf-token"]').attr('content');

            const analysisResponse = await fetch("https://savefrom.fun/analyze", {
                headers: {
                    ...defaultHeaders,
                    "accept": "*/*",
                    "content-type": "application/json",
                    "x-csrf-token": csrfToken,
                    "cookie": cleanedCookies
                },
                body: JSON.stringify({ url }),
                method: "POST"
            });

            const analysisResult = await analysisResponse.json();
            const selectedFormat = analysisResult.formats[type].find(v => parseInt(v.quality) === quality);
    
            if (!selectedFormat) {
                return {
                    status: false,
                    msg: 'No matching quality found.'
                };
            }

            const conversionResponse = await fetch("https://savefrom.fun/mp3convert", {
                headers: {
                    ...defaultHeaders,
                    "accept": "*/*",
                    "content-type": "application/json",
                    "x-csrf-token": csrfToken,
                    "cookie": cleanedCookies
                },
                body: JSON.stringify({ hash: selectedFormat.hash }),
                method: "POST"
            });

            const conversionData = await conversionResponse.json();

            let finalResult;
            const maxAttempts = 15;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const statusResponse = await fetch("https://savefrom.fun/task", {
                    headers: {
                        ...defaultHeaders,
                        "accept": "*/*",
                        "content-type": "application/json",
                        "x-csrf-token": csrfToken,
                        "cookie": cleanedCookies
                    },
                    body: JSON.stringify({ taskId: conversionData.taskId }),
                    method: "POST"
                });

                const statusData = await statusResponse.json();
                if (statusData.status === 'finished') {
                    finalResult = statusData;
                    break;
                }

                if (attempt < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            const downloadPage = await fetch(finalResult.download, {
                headers: {
                    ...defaultHeaders,
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "cookie": cleanedCookies
                },
                method: "GET"
            });

            const downloadHtml = await downloadPage.text();
            const $downloadPage = cheerio.load(downloadHtml);
            const downloadUrl = $downloadPage('#btn320').attr('data-con');

            if (!downloadUrl) {
                return {
                    status: false,
                    msg: 'No download link found.'
                };
            }

            return {
                status: true,
                result: {
                    title: finalResult.title,
                    [type]: {
                        quality: parseInt(finalResult.quality),
                        url: downloadUrl
                    }
                }
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                msg: e.message
            }
        }
    },
    V2: async function dl(url, opts = {}) {
        const { type = 'video', quality = 360 } = opts;
        const format = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : null;

        if (!format) {
            return { status: false, msg: 'Invalid type specified.' };
        }

        const headers = {
            "accept": "*/*",
            "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
            "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://downloaderto.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };

        try {
            const res = await fetch(`https://ab.cococococ.com/ajax/download.php?copyright=0&format=${type === 'audio' ? 'mp3' : quality}&url=${url}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, {
                headers
            });

            const data = await res.json();

            const maxAttempts = 10;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const progressRes = await fetch(`https://p.oceansaver.in/ajax/progress.php?id=${data.id}`, {
                    headers
                });

                const progressData = await progressRes.json();

                if (progressData.download_url) {
                    return {
                        status: true,
                        result: {
                           title: data.title,
                          [type]: {
                                quality: parseInt(quality, 10),
                              url: progressData.download_url
                            }
                        }
                    };
                }

                if ((progressData?.text || '').startsWith('No Files')) {
                    return { status: false, msg: 'An error occurred during the download process.' };
                }

                await new Promise(resolve => setTimeout(resolve, 4000));
            }

            return { status: false, msg: 'Download did not complete within the expected time.' };

        } catch (e) {
            console.error(e);
            return { status: false, msg: e.message };
        }
    }
};

async function search(query) {
    try {
        const getData = await yts(query);
        if (getData.videos.length > 0) {
            return {
                status: true,
                result: getData.videos
            };
        } else {
            return {
                status: false,
                msg: 'No results found.'
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

async function play(query) {
    try {
        const getData = await yts(query);
        if (getData.videos.length > 0) {
            return {
                status: true,
                result: getData.videos[0]
            };
        } else {
            return {
                status: false,
                msg: 'No results found.'
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download, search, play };