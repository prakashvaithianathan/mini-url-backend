const mongoose = require('mongoose');

const urlSchema = mongoose.Schema({
    shortCode:{
        type: String,
    },
    longUrl:{
        type: String,
    },
    shortUrl:{
        type: String,
    },
    date:{
        type:String,
        default:Date.now()
    }
})

const urlModel = mongoose.model('urls',urlSchema)

module.exports = urlModel