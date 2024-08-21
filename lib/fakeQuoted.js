const { resizeImage } = require('./func.js');

module.exports = async (type, opts = {}) => {
    let text = opts.text || null
    let img = opts.img ? await resizeImage(opts.img, 300) : null
    let vo = opts.vo || opts.viewOnce || null
    let count = opts.count || null
    let key = {
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false
    }
    let fake = {
        gif: { key, message: { videoMessage: { title: null, h: null, seconds: 999999999, gifPlayback: true, caption: text, jpegThumbnail: img }}},
        image: { key, message: { imageMessage: { mimetype: 'image/jpeg', caption: text, jpegThumbnail: img, viewOnce: vo }}},
        video: { key, message: { videoMessage: { mimetype: 'video/mp4', caption: text, jpegThumbnail: img, viewOnce: vo }}},
        liveloc: { key, message: { liveLocationMessage: { caption: text, h: null, jpegThumbnail: null }}},
        poll: { key, message: { pollCreationMessage: { name: text, selectableOptionsCount: 0 }}},
        product: { key, message: { productMessage: { product: { productImage: { mimetype: 'image/jpeg', jpegThumbnail: img }, title: text, currencyCode: (count !== null) ? 'USD' : null, priceAmount1000: count }, businessOwnerJid: '0@s.whatsapp.net' }}},
        order: { key, message: { orderMessage: { thumbnail: img, itemCount: count, message: text }}},
    }[type]
    if (fake) return fake
}
