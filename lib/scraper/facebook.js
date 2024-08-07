const axios = require('axios');
const cheerio = require('cheerio');

const download = {
    V1: async function V1(url) {
        try {
            const { data } = await axios.post(
                'https://getmyfb.com/process',
                new URLSearchParams({
                    id: decodeURIComponent(url),
                    locale: 'en',
                }),
                {
                    headers: {
                        'hx-current-url': 'https://getmyfb.com/',
                        'hx-request': 'true',
                        'hx-target': url.includes('share') ? '#private-video-downloader' : '#target',
                        'hx-trigger': 'form',
                        'hx-post': '/process',
                        'hx-swap': 'innerHTML',
                    }
                }
            );

            const $ = cheerio.load(data);

            const title = $('.results-item-text').text().trim() || '';
            const media = $('.results-list-item').map((i, el) => {
                const text = $(el).text().trim();
                return {
                    quality: (parseInt(text) + ` (${text.includes('HD') ? 'HD' : 'SD'})`) || '',
                    url: $(el).find('a').attr('href') || ''
                };
            }).get();

            if (media.length === 0) {
                return {
                    status: false,
                    msg: 'No results found.'
                };
            }

            return {
                status: true,
                result: {
                    title,
                    media
                }
            };

        } catch (e) {
            console.error(e);
            return {
                status: false,
                msg: e.message
            };
        }
    },

    V2: async function V2(url) {
        try {
            const { data } = await axios.post(
                'https://www.getfvid.com/downloader',
                new URLSearchParams({ url }),
                {
                    headers: {
				        "content-type": "application/x-www-form-urlencoded",
				        "user-agent":  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				        "cookie": "_ga=GA1.2.1310699039.1624884412; _pbjs_userid_consent_data=3524755945110770; cto_bidid=rQH5Tl9NNm5IWFZsem00SVVuZGpEd21sWnp0WmhUeTZpRXdkWlRUOSUyQkYlMkJQQnJRSHVPZ3Fhb1R2UUFiTWJuVGlhVkN1TGM2anhDT1M1Qk0ydHlBb21LJTJGNkdCOWtZalRtZFlxJTJGa3FVTG1TaHlzdDRvJTNE; cto_bundle=g1Ka319NaThuSmh6UklyWm5vV2pkb3NYaUZMeWlHVUtDbVBmeldhNm5qVGVwWnJzSUElMkJXVDdORmU5VElvV2pXUTJhQ3owVWI5enE1WjJ4ZHR5NDZqd1hCZnVHVGZmOEd0eURzcSUyQkNDcHZsR0xJcTZaRFZEMDkzUk1xSmhYMlY0TTdUY0hpZm9NTk5GYXVxWjBJZTR0dE9rQmZ3JTNEJTNE; _gid=GA1.2.908874955.1625126838; __gads=ID=5be9d413ff899546-22e04a9e18ca0046:T=1625126836:RT=1625126836:S=ALNI_Ma0axY94aSdwMIg95hxZVZ-JGNT2w; cookieconsent_status=dismiss"
			        }
                }
            );

            const $ = cheerio.load(data);

            const title = $('div.col-md-5.no-padd .card-block .card-title a').text().trim();

            const media = [];
            $('div.col-md-4.btns-download p a').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();

                if (href) {
                    if (text.includes('HD Quality')) {
                        media.push({ quality: 'HD', url: href });
                    } else if (text.includes('Normal Quality')) {
                        media.push({ quality: 'SD', url: href });
                    } else if (text.includes('Audio Only')) {
                        media.push({ type: 'audio', url: href });
                    }
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
                    title,
                    media
                }
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                msg: e.message
            };
        }
    },

    V3: async function V3(url) {
        try {
            const response = await axios.get('https://fdownloader.net/id', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                },
            });

            const a = response.data;
            const k_exp = (a.match(/k_exp ?= ?"(\d+)"/i) || [])[1];
            const k_token = (a.match(/k_token ?= ?"([a-f0-9]+)"/i) || [])[1];

            if (!k_exp || !k_token) {
                return {
                    status: false,
                    msg: 'Error Extracting Exp/Token.'
                }
            }

            const postResponse = await axios.post('https://v3.fdownloader.net/api/ajaxSearch?lang=id', new URLSearchParams({
                k_exp,
                k_token,
                q: url,
                lang: 'id',
                web: 'fdownloader.net',
                v: 'v2',
                w: '',
            }), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    origin: 'https://fdownloader.net',
                },
            });

            const b = postResponse.data;

            if (b.status !== 'ok') {
                return {
                    status: false,
                    msg: 'Failed Doing Ajax Search.'
                }
            };

            const _$ = cheerio.load(b.data);
            const $ = cheerio.load(_$('.detail').html());
            const title = $('.thumbnail > .content > .clearfix > h3').text().trim();
            const thumb = $('.thumbnail > .image-fb > img').attr('src') || '';
        
            const media = $('#fbdownloader').find('.tab__content').eq(0).find('tr').map((i, el) => {
                const quality = $(el).find('.video-quality').text().trim();
                const url = $(el).find('a').attr('href') || $(el).find('button').attr('data-videourl') || '';
                if (url !== '#note_convert') {
                    return {
                        quality,
                        url
                    };
                }
            }).get();

            return {
                status: true,
                result: {
                    title,
                    thumb,
                    media
                }
            }
        } catch (e) {
            console.error(e);
            return {
                status: false,
                msg: e.message
            }
        }
    }
}

module.exports = { download };
