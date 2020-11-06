var express=require("express");
var router=express.Router();
var allQueries=require("../model/allQueries");
var nodemailer=require("nodemailer");
//API for signup using mongodb:
router.post('/signup',function(req,res){
    var obj=req.body;
    obj.plan="Free";
    allQueries.createIndex("users",function(err0,result0){
    allQueries.insertUser("users",obj,function(err,result){
        if(err0){
            //res.status(400).json({status:0,error:err0});
            console.log("err0...",err0)
        }
        if(err){
            res.status(400).json({status:0,error:err});
            console.log("err...",err)
        }
        if(result){
            res.status(200).json({status:1,result:"signup successful!!"})
        }
    })
})
})

//API for signin using mongodb:
router.post('/signin',function(req,res){
    var email=req.body.email;
    var password=req.body.password;
allQueries.find("users",{email:email},function(err,result){
    if(err){
        res.status(400).json({status:0,error:err})
    }
    if(result.length>0){
        if(result[0].password==password){
            res.status(200).json({status:1,result:"signin successfull!!"})
        }
        else{
            res.status(400).json({status:0,error:"Incorrect password!!"})
        }
    }
    else if(result.length==0){
        res.status(400).json({status:0,error:"Email id does not exist!"})
    }
})
})

//API to send OTP through email:
router.post('/sendOTP',function(req,res){
    var email=req.body.email;
        var random=Math.floor(Math.random() * (99999 - 10000) + 10000);      
          allQueries.update("users",{ email:email },{otp:random},function(err,result){
            if(err){
                res.status(400).json({status:0,err:"err"})
            }
            if(result){
            //Code for sending otp to mentioned email id for resetting password:
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'manasvi111.kaplay@gmail.com',
                  pass: '100Scholars@iips'
                }
              });
              var mailOptions = {
                from: 'manasvi111.kaplay@gmail.com',
                to: email,
                subject: 'Your password',
                html:'<h1>Your otp to reset password is:</h1>'+random
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log("error here......",error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
                res.status(200).json({status:1,result:"successful update"})
            }
        });
})

//API to verify OTP sent:
router.post('/checkOTP',function(req,res){
    var email=req.body.email;
    var otp=req.body.otp;
    allQueries.find("users",{email:email},function(err,result){
      if(err){
        console.log(err);
        res.status(400).json({status:0,err:err})
      }
      if(result.length==0){
        res.status(400).json({status:0,err:"No such email found!!"})
      }
      else{
        var data=result[0];
        if(data.otp==otp){
          res.status(200).json({status:1,result:"Correct otp entered"})
        }
        else{
          res.status(400).json({status:0,err:"Otp invalid!"})
        }
      }
    })
})

//API to update password:
router.post('/updatePassword',function(req,res){
  var email=req.body.email;
    var password=req.body.password;
    allQueries.update("users",{ email:email},{password:password},function(err,result){
      if(err){
          res.status(400).json({status:0,err:"err"})
      }
      if(result){
          res.status(200).json({status:1,result:"successful update"})
      }
  });
})
//API to save msgs sent through the contact us page:
router.post('/saveMsg',function(req,res){
    var email=req.body.email;
    var msg=req.body.msg;
    var msgs=[];
    msgs.push(msg);
    var obj={email:email,msgs:msgs};
    allQueries.find("contacts",{email:email},function(err,result){
        if(result.length==0){
            allQueries.insert("contacts",obj,function(err2,result2){
                if(result2){
                    res.status(200).json({status:1,result:"Message sent!!"})
                }
            })
        }
        else if(result.length>0){
            console.log("result[0]....",result[0]);
            result[0].msgs.push(msg);
            var obj_new={email:email,msgs:result[0].msgs};
            allQueries.update("contacts",{email:email},obj_new,function(err3,result3){
                if(result3){
                    res.status(200).json({status:1,result:"This message also sent!!"});
                }
            })
        }
    })
})
module.exports=router;