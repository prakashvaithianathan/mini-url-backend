const mongoose= require('mongoose')

const userSchema = mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        dropdups:true
    },
    password:{
        type: String,
        required: true,
    },
    processedURL:[{
        type:mongoose.Types.ObjectId,
        ref:'urls'
    }],
    verified:{
        type:Boolean,
        default:false,
    }
},{
    timestamps:true
})

const userModel = mongoose.model('users',userSchema)

module.exports=userModel