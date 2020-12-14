var express=require("express");
var router=express.Router();
const stripe = require('stripe')('sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr');
var allQueries=require("../model/allQueries");
router.get('/pay',function(req,res){
  var pagedata={"title":"Payments","pagename":"payments"}
  res.render("layout",pagedata);
})
router.get('/get',function(req,res){
    var ret=stripe.charges.retrieve('ch_1HtbrEJag2Djgj0uUO0OSFO8', {
        api_key: 'sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr'
      })
      console.log("ret..",ret);
})
router.post('/create',function(req,res){
  console.log("req.body..",req.body);
  // Elements to be sent by the front end:
  var email=req.body.email;
  var plan=req.body.plan;
  var stripeToken=req.body.stripeToken;
  var priceId="plan_IYFGga7k78qpwc";
  let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
var date_time=year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
console.log(date_time);
allQueries.find("plans",{planName:plan},function(err0,result){
  if(err0){
    res.status(400).json({status:0,error:err0})
  }
  if(result){
    console.log("selected plan is..",result[0])
  stripe.customers.create({email:email,description:plan,source:stripeToken},function(err,customer){
    if(err){
      res.status(400).json({status:0,error:err})
    }
    if(customer){
          stripe.subscriptions.create({customer: customer.id,items: [{plan:result[0].planId}]},function(err2,subscription){
            if(err2){
              res.status(400).json({status:0,error:err2});
            }
            if(subscription){
              console.log("subscription...",subscription);
              allQueries.update("users",{email:email},{plan:plan},{payment_date:date_time,customer_id:customer.id},function(err3,output){
                if(err3){
                  res.status(400).json({status:0,error:err3});
                }
                if(output){
                  //res.status(200).json({status:1,subscription:subscription,result:output});
                  var pagedata={"title":"Successful payment","pagename":"payment_success"};
                  res.render("layout",pagedata);
                }
              })
            }
          })
    }
  })
}
})
})
router.get('/:email',function(req,res){
  var email=req.params.email;
  allQueries.find("users",{email:email},function(err,result){
if(err){
  res.status(400).json({status:0,error:err});
}
if(result){
res.status(200).json({status:1,result:result[0]})
var details=[];
var detailsObj;
async function retrieve(){
  for(var i=0;i<result[0].charge_ids.length;i+=1){
    await stripe.charges.retrieve(result[0].charge_ids[i], {
      api_key: 'sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr'
    },function(err2,stripeResult){
if(stripeResult){
//res.status(200).json({status:1,result:result})
console.log("stripe charge obj..",stripeResult);
detailsObj={"charge_id":stripeResult.id,"amount":stripeResult.amount,"receipt_url":stripeResult.receipt_url,"payment_method":stripeResult.payment_method}
details.push(detailsObj);
console.log("details array..",details);
}
    });
  }
}
retrieve();
}

  })
})
module.exports=router;