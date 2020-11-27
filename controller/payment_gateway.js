var express=require("express");
var router=express.Router();
const stripe = require('stripe')('sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr');
var allQueries=require("../model/allQueries");
router.get('/pay',function(req,res){
  var pagedata={"title":"Payments","pagename":"payments"}
  res.render("layout",pagedata);
})
router.get('/get',function(req,res){
    stripe.charges.retrieve('ch_1HqejzJag2Djgj0uj1Or5b9u', {
        api_key: 'sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr'
      });
})
router.post('/create',function(req,res){
  console.log("req.body..",req.body);
  var email="manasvi111.kaplay@gmail.com";
  stripe.charges.create({
    customer:email,
     amount: 8000,
     currency: "inr",
     source: req.body.stripeToken, // obtained with Stripe.js
     receipt_email:email,
     description: "For testing"
   }, function(err, charge) {
     // asynchronously called
     if(err){
       console.log("err..*",err);
       res.status(400).json({status:0,error:err})
     }
     if(charge){
       allQueries.update("users",{email:email},{plan:"Premium"},function(error,result){
         if(error){
          res.status(400).json({status:0,error:error})
         }
         if(result){
      var pagedata={"title":"Success!",pagename:"payment_success",receipt_url:charge.receipt_url};
      res.render("layout",pagedata);
         }
       })
     }
   });
})
router.get('/:email',function(req,res){
  var email=req.params.email;

})
module.exports=router;