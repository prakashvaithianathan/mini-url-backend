const router = require('express').Router();
const {userModel} = require('../../../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const {authentication} = require('../../../library')

router.get('/',(req, res) => {
    res.send('this is user route')
})

const sender = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    },
    secure:true,
    tls:{
        rejectUnauthorized:false
    }
})

router.post('/signup',async(req, res) => {
 try {
     const hash = await bcrypt.hash(req.body.password,10);
     req.body.password = hash;
     const user = await userModel.create(req.body)
     
     const token = jwt.sign({userId:user.id},process.env.SECRET_KEY)
     const composeMail = {
         from:process.env.USER_EMAIL,
         to:req.body.email,
         subject:'Mail from Mini Url',
         html: `
         <div>
         <p><b>Hi, ${
           req.body.firstName + " " + req.body.lastName
         }</b>. We welcome to our platform</p>
         <p>To verify your account, click below</p>
         <a href="http://localhost:3000/verify/${token}">Click Here</a>
         </div>
         `,
     }
sender.sendMail(composeMail,(err,data)=>{
    if(err){
        console.log(err);
    }else{
        console.log('mail sended successfuly' + data.response);
    }
})
return res.status(200).json({message:'Account successfully created. Please check you mail'})
  
 } catch (error) {
     if(error.code===11000){
         return res.status(500).json({message:'Email already exists...'})
     }
     return res.status(500).json({message: error.message})
 }
})


router.get("/verify", async (req, res) => {
    try {
      const token = req.headers["authorization"];
      
      const data = await jwt.verify(token, process.env.SECRET_KEY);
  
      const user = await userModel.findByIdAndUpdate(
        { _id: data.userId },
        { verified: true }
      );
      res.json({ message: "User verified successfully. Now, you can Login" });
    } catch (error) {
      res.json(error.message);
    }
  });

  router.post("/login", async (req, res) => {
      
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.verified) {
        return res.status(401).json({ message: "User not Verified" });
      }
      if (user) {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
          return res.status(200).json({ token });
        } else {
          return res.status(403).json({ message: "Wrong Password" });
        }
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  });

  router.get("/data", authentication, async (req, res) => {
    try {
      const data = await userModel
        .findById({ _id: req.userId })
        .select("firstName lastName email processedURL -_id");
      res.json({ data });
    } catch (error) {
      return res.json({ message: "Something went wrong" });
    }
  });

  router.put("/update", async (req, res) => {
    try {
        const token = req.headers['authorization']
        const {userId} = await jwt.verify(token,process.env.SECRET_KEY)
        const update = await userModel.findByIdAndUpdate({_id:userId},{$set:req.body},{new:true})
        
        res.json({message:'Successfully updated'})
    } catch (error) {
      return res.json({ message: 'Timed out (or) This Email already exists'});
    }
  });

module.exports = router;