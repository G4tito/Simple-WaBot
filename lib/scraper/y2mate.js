const axios = require('axios');

function download(url, type) {
    const getAxiosConfig = (url, data) => ({
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
            "X-Requested-With": "XMLHttpRequest",
        },
        url,
        data: new URLSearchParams(Object.entries(data)),
    });

    const Y2mateDownload = (vid, k, size) =>
        new Promise((resolve, reject) => {
            axios(getAxiosConfig('https://tomp3.cc/api/ajax/convert?hl=en', { vid, k }))
                .then(({ data }) => {
                    if (data.status !== 'ok') {
                        return reject(new Error(data.mess));
                    }
                    resolve({
                        quality: data.fquality,
                        size,
                        url: data.dlink,
                    });
                })
                .catch(reject);
        });

    return new Promise((resolve, reject) => {
        axios(getAxiosConfig('https://tomp3.cc/api/ajax/search?hl=en', { query: url, vt: 'downloader' }))
            .then(({ data }) => {
                if (data.status !== 'ok') {
                    return reject(new Error(data.mess));
                }
                const { vid, title, links } = data;
                const downloadLinks = links[type === 'video' ? 'mp4' : 'mp3'];
                const keys = Object.values(downloadLinks).map((item) => item);

                Promise.all(keys.map((item) => Y2mateDownload(vid, item.k, item.size)))
                    .then((results) => {
                        const filteredResults = results.filter((v) => type === 'video' ? v.type !== '3gp' : v.url);
                        resolve({
                            status: true,
                            result: {
                                title,
                                thumbnail: 'https://i.ytimg.com/vi/' + vid + '/0.jpg',
                                [type]: filteredResults,
                            },
                        });
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};

module.exports = {
    download
};
