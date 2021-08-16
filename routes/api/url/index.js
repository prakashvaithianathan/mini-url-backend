const router = require('express').Router()
const validUrl = require('valid-url')
const shortId = require('shortid')
const {urlModel} = require('../../../models')
const {userModel} = require('../../../models')
const jwt = require('jsonwebtoken')


router.get('/',(req, res) => {
    res.send('this is url route')
})

const baseUrl = 'http://localhost:5000'

router.post('/shorten',async(req, res) => {
      
    try {
        const {longUrl} = req.body
        if(!validUrl.isUri(baseUrl)){
            return res.json(401).json('Invalid base URL')
        }

        //check the user today limit finished or not
        // const dates =new Date().setDate(new Date().getDate()- 1)
        const dates = new Date().toDateString()
        const find = await urlModel.find({})
       
        const check = find.filter(item=>{
            
            if(new Date(parseInt(item.date)).toDateString()=== dates){
                return item
            }
        })
        // console.log(check);
       if(check.length<10){
        const urlCode = shortId.generate()

        if(validUrl.isUri(longUrl)){
            try {
                const token = req.headers['authorization']
                const {userId} = jwt.verify(token,process.env.SECRET_KEY)
                
                const url = await urlModel.findOne({longUrl})
                if(url){
                    const sendUrl = await userModel.findByIdAndUpdate({_id:userId},{$addToSet:{processedURL:url._id}},{new:true})
                    
                    return res.json(url)
                }else{
                    const shortUrl = baseUrl + '/api/url/'+urlCode

                    const url = await urlModel.create({
                        shortCode:urlCode,
                        longUrl:longUrl,
                        shortUrl:shortUrl
                    })
                    const sendUrl = await userModel.findByIdAndUpdate({_id:userId},{$addToSet:{processedURL:url}},{new:true})
                    // console.log(sendUrl);
                    // const sendData = await userModel.find
                    res.json(url)
                }
            } catch (error) {
                res.status(500).json({message:error.message})
            }
        }else{
            res.status(401).json({message: error.message})
        }}else{
            return res.json({message:'Your short url request exceeded today.'})
        }
    } catch (error) {
        return res.json({message: error.message})
    }
})

router.get('/:code',async(req,res)=>{
    
    try {
        const url = await urlModel.findOne({shortCode:req.params.code})
        if(url){
            return res.redirect(url.longUrl)
        }else{
            return res.status(404).json('no url found')
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})


router.get('/find/data',async(req,res)=>{
    try {
        
        const token = req.headers['authorization']
        const {userId} = jwt.verify(token,process.env.SECRET_KEY)
        const getUser = await userModel.findById({_id:userId})
        const getID = getUser.processedURL
         const data = await urlModel.find({_id:getID})
         const month = data.filter(item=>new Date(parseInt(item.date)).getMonth()===new Date().getMonth())
         const getResult = month.map((item,i)=>new Date(parseInt(item.date)).getDate())
        
        
         const result = data.filter(item=>new Date(parseInt(item.date)).toDateString()===new Date().toDateString())
        //  const remaining = 10 - result.length

       const value={ dailyValue:result.length,monthValue:getResult.length}
         res.json(value)
       
    } catch (error) {
        res.json({message: error.message})
    }
})

router.get('/find/report',async(req,res)=>{
    try {
        const token = req.headers['authorization']
        const {userId} = jwt.verify(token,process.env.SECRET_KEY)
        const {processedURL} = await userModel.findById({_id:userId}).populate('processedURL').select('processedURL -_id')
        const ans = processedURL.map(item=> {
            return{
                date:new Date(parseInt(item.date)).toDateString(),
                shortUrl:item.shortUrl,
                longUrl:item.longUrl
            }})
        res.send(ans)
       
    } catch (error) {
        return res.json({message: error.message})
    }
})


module.exports = router