var express=require("express");
var router=express.Router();
const stripe = require('stripe')('sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr');
var allQueries=require("../model/allQueries");
router.post('/create',function(req,res){
    var planName=req.body.planName;
    var amount=req.body.amount;
    var interval=req.body.interval;
    stripe.products.create({name: planName},function(err0,product){
          if(err0){
              res.status(400).json({status:0,error:err0});
          }
          if(product){
              console.log("created product id..",product.id);
stripe.plans.create({amount: amount,currency: 'inr',interval: interval,product: product.id},function(err,plan){
          if(err){
              res.status(400).json({status:0,err:err});
          }
          if(plan){
              allQueries.insert("plans",{planName:planName,planId:plan.id},function(err2,result){
                  if(err2){
                    res.status(400).json({status:0,err:err2});
                  }
                  if(result){
                    res.status(200).json({status:1,plan:plan,result:result});
                  }
              })
          }
      });
          }
      });
})
router.get('/all',function(req,res){
    allQueries.find("plans",{},function(err,result){
        if(err){
            res.status(400).json({status:0,error:err})
        }
        if(result){
            async function fetch(){
                var plan_month;
                var plan_year;
                var obj={};
                var plans=[];
                for(var i=0;i<result.length;i+=1){
                    plan_month=await stripe.plans.retrieve(result[i].planId);
                    plan_year=await stripe.prices.retrieve(result[i].planIdYear);
                    obj={"planName":result[i].planName,"month":{"price":plan_month.amount/100},"year":{"price":plan_year.unit_amount/100}}
                    console.log("obj..",obj);
                    plans.push(obj)
                }
                res.status(200).json({status:1,plans:plans})
            }
            fetch();
        }
    })
})
module.exports=router;