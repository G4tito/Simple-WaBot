const fetch = require('node-fetch');

async function download(url) {
    try {
        const res = await fetch("https://pinmate.online/analyze.php", {
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ url }),
            method: "POST"
        });

        const { title, medias, error } = await res.json();
    
        if (error || medias.length === 0) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        const { url: mediaUrl, quality, type } = medias[0];

        return {
            status: true,
            result: {
                title,
                [type]: {
                    quality: parseInt(quality, 10),
                    url: mediaUrl
                }
            }
        };
    } catch (e) {
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download }