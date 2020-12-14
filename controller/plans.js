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
    stripe.plans.list(function(err,result){
        if(err){
            res.status(400).json({status:0,error:err});
        }
        if(result){
            var plans=[];
            var ob;
            var fetchData = function (obj) {
                 return new Promise(function (resolve, reject) {
                    allQueries.find("plans",{planId:obj.id},function(err2,result2){
                        if(err2){
                            console.log("err2..",err2);
                        }
                        if(result2){
                            resolve(result2);
                            //console.log("result2...",result2);
                        }
                    })
                  });
                };
            async function join(){
                var call;
            for(var i=0;i<result.data.length;i+=1){
                call=await fetchData(result.data[i]);
                ob={"plan":call[0].planName,"amount":result.data[i].amount,"currency":result.data[i].currency,"interval":result.data[i].interval}
                plans.push(ob)
            }
            res.status(200).json({status:1,result:plans});
        }
        join()
        }
    })
})
module.exports=router;