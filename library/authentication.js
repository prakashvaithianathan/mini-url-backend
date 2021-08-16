const jwt = require('jsonwebtoken');

const authentication = async(req,res,next)=>{
    try {
        const token = req.headers['authorization'];
        await jwt.verify(token,process.env.SECRET_KEY,(err,data)=>{
            if(err){
                return res.json({message:err.message})
            }else{
                req.userId=data.userId;
                next()
            }
        })
    } catch (error) {
        return res.json({message:error.message})
    }
}

module.exports = authentication;