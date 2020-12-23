var express=require("express");
var router=express.Router();
const stripe = require('stripe')('sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr');
var allQueries=require("../model/allQueries");
router.get('/pay',function(req,res){
  var pagedata={"title":"Payments","pagename":"payments"}
  res.render("layout",pagedata);
})

router.post('/refund',function(req,res){
  var email=req.body.email;
  allQueries.find("users",{email:email},function(err0,result0){
    if(err0){
      res.status(400).json({status:0,error:err0});
    }
    if(result0){
      var custArrLen=result0[0].customer_id.length;
      var custId=result0[0].customer_id[custArrLen-1];
      console.log("custId..",custId);
      stripe.invoices.list({customer:custId},function(err,result){
        if(err){
          res.status(400).json({status:0,error:err});
        }
        if(result){
//           let date_ob = new Date();
// let date = ("0" + date_ob.getDate()).slice(-2);
// let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// let year = date_ob.getFullYear();
// let hours = date_ob.getHours();
// let minutes = date_ob.getMinutes();
// let seconds = date_ob.getSeconds();
// var date_time=year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
// console.log("today's date...",date_time);
          // var pi=result.data[0].payment_intent;
          // console.log("pi..",pi);
          var subscriptionid=result.data[0].subscription;
          // var planStartDt=result0[0].payment_date[custArrLen-1];
          // console.log("planStartDt..",planStartDt);
          // const diffInMs   = new Date(date_time) - new Date(planStartDt);
          // const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          // console.log("diff in days..",diffInDays);
          stripe.subscriptions.del(subscriptionid,{prorate:true},function(err2,result2){
            if(err2){
              res.status(400).json({status:0,error:err2});
            }
            if(result2){
              res.status(200).json({status:1,result2:result2});
            }
          })
        }
      })
    }
  }) 
})
router.post('/create',function(req,res){
  console.log("req.body..",req.body);
  // Elements to be sent by the front end:
  var email=req.body.email;
  var plan=req.body.plan;
  var stripeToken=req.body.stripeToken;
  var interval=req.body.interval;
 // var priceId="plan_IYFGga7k78qpwc";
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
  stripe.customers.create({email:email,description:plan+" per "+interval,source:stripeToken},function(err,customer){
    if(err){
      res.status(400).json({status:0,error:err})
    }
    if(customer){
      if(interval=="month" || interval=="Month"){
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
                stripe.invoices.retrieve(subscription.latest_invoice,function(err4,receipt){
                  res.status(200).json({status:1,subscription:subscription,receipt:receipt.hosted_invoice_url});
                //var pagedata={"title":"Successful payment","pagename":"payment_success",receipt:receipt.hosted_invoice_url};
                //res.render("layout",pagedata);
                })
              }
            })
          }
        })
      }
        else if(interval=="year"||interval=="Year"){
          stripe.subscriptions.create({customer: customer.id,items: [{plan:result[0].planIdYear}]},function(err2,subscription){
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
                  stripe.invoices.retrieve(subscription.latest_invoice,function(err4,receipt){
                    res.status(200).json({status:1,subscription:subscription,receipt:receipt.hosted_invoice_url});
                  //var pagedata={"title":"Successful payment","pagename":"payment_success",receipt:receipt.hosted_invoice_url};
                  //res.render("layout",pagedata);
                  })
                }
              })
            }
          })
        }  
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
var details=[];
var detailsObj={};
var inv;
async function retrieve(){
  try{
  for(var i=0;i<result[0].customer_id.length;i+=1){
   inv= await stripe.invoices.retrieveUpcoming({customer:result[0].customer_id[i]})
    detailsObj={"amount":inv.lines.data[0].amount/100,"plan":inv.lines.data[0].description,"payment_date":result[0].payment_date[i]}
    console.log("inv..",inv);
    details.push(detailsObj);
  }
  res.status(200).json({status:1,payment_history:details});
}
catch(error){
  res.status(400).json({status:0,error:error});
}
}

retrieve();
}
  })
})
router.get('/rere',function(req,res){
  res.send("Hello world...");
})

module.exports=router;