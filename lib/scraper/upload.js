const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

async function image(buffer) {
    try {
        const { ext, mime } = await fromBuffer(buffer) || {};
        
        const form = new FormData();
        form.append("files[]", buffer, { 
            filename: `tmp.${ext}`, 
            contentType: mime 
        });

        const response = await axios.post(
            "https://pomf.lain.la/upload.php", 
            form, { headers: form.getHeaders() }
        );
        
        const file = response.data.files[0];
        
        return {
            status: true,
            result: {
                url: file.url,
                size: file.size,
            }
        };
    } catch (e) {
        return { 
            status: false, 
            msg: e.message 
        };
    }
}

module.exports = { image }