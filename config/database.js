const mongoose = require('mongoose');

const url = process.env.MONGO_URL
const mongoDB = async()=>{
    try {
        const data = await mongoose.connect(url,{
            useNewUrlParser:true,
            useCreateIndex:true,
            useUnifiedTopology:true,
            useFindAndModify:false
        })
        console.log('database successfully connected in '+data.connection.host);
    } catch (error) {
        console.log('error in connect to database');
    }
}

module.exports=mongoDB