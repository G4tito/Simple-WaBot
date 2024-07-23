const axios = require('axios');

async function download(url) {
    try {
        let data = [];

        let domain = 'https://www.tikwm.com/api/';
        let res = await axios.post(domain, {}, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://www.tikwm.com',
                'Referer': 'https://www.tikwm.com/',
                'Sec-Ch-Ua': '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': 'Android',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            params: {
                url: url,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1
            }
        });

        let responseData = res.data.data;

        if (!responseData.size) {
            responseData.images.forEach(v => {
                data.push({ type: 'photo', url: v });
            });
        } else {
            data.push(
                { type: 'wm', url: 'https://www.tikwm.com' + responseData.wmplay },
                { type: 'nwm', url: 'https://www.tikwm.com' + responseData.play },
                { type: 'nwm_hd', url: 'https://www.tikwm.com' + responseData.hdplay }
            );
        }

        if (data.length === 0) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        return {
            status: true,
            result: {
                title: responseData.title,
                media: data
            }
        };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download };
