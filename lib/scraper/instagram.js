const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function download(url) {
    try {
        const res = await fetch("https://indown.io/es", {
            headers: {
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "upgrade-insecure-requests": "1",
                "Referer": "https://indown.io/es",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        });

        const cookies = res.headers.raw()['set-cookie'] || [];
        const cleanedCookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        const html = await res.text();
        const $ = cheerio.load(html);
        const _token = $('input[name="_token"]').val();
        const p = $('input[name="p"]').val();

        const dlres = await fetch("https://indown.io/download", {
            method: "POST",
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Content-Type": "application/x-www-form-urlencoded",
                "cookie": cleanedCookies,
                "Referer": "https://indown.io/es"
            },
            body: new URLSearchParams({
                referer: "https://indown.io/es",
                locale: "es",
                p,
                _token,
                link: url
            }).toString()
        });

        const dlhtml = await dlres.text();
        const $$ = cheerio.load(dlhtml);
        const media = [];

        $$('div.mt-2.mb-2, div.mt-3').each((index, element) => {
            const buttonTitle = $$(element).find('.btn.btn-outline-primary').first().text().trim().replace(/\s+/g, ' ');
            const type = buttonTitle === 'Descargar' ? 'image' : buttonTitle === 'Servidor de descarga 1' ? 'video' : '';
            const href = $$(element).find('a').first().attr('href');
            if (href) {
                media.push({ type, url: href });
            }
        });

        if (media.length === 0) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        return {
            status: true,
            result: {
                media
            }
        };
    } catch (e) {
        console.error(e);
        return { status: false, msg: e.message };
    }
}

module.exports = { download };
