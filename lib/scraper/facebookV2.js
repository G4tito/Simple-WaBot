const axios = require('axios');
const cheerio = require('cheerio');

async function download(url) {
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
}

module.exports = { download };
