var express=require("express");
var router=express.Router();
var allQueries=require("../model/allQueries");
//API to upgrade plan:
router.post('/upgrade',function(req,res){
    var date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// current year
let year = date_ob.getFullYear();
var date_upgraded=year + "-" + month + "-" + date;
console.log("date....",date_upgraded);
var date2 = new Date();
var last = new Date(date2.getTime() + (20 * 24 * 60 * 60 * 1000));
var day =last.getDate();
var month2=last.getMonth()+1;
var year2=last.getFullYear();
var expiry_date=day+"-"+month2+"-"+year2;
console.log("expiry_date..",expiry_date);
    var plan=req.body.plan;
    var obj={};
    var id;
    var upgrade;
    var getDoc=allQueries.searchByField("users",req.body);
    getDoc.then(function(snapshot){
        snapshot.forEach(function(doc){
        id=doc.id;
        obj={email:doc.data().email,username:doc.data().username,password:doc.data().password,
        type:doc.data().type,organisation:doc.data().organisation,
        referral_code:doc.data().referral_code,plan:plan,date_upgraded:date_upgraded,expiry_date:expiry_date};
        })
        console.log("updated obj..",obj);
        upgrade=allQueries.upgradePlan("users",obj,id);
        upgrade.then(function(){
            res.status(200).json({status:1,result:"Plan upgraded!!"});
        })
    })
    getDoc.catch(function(err){
        res.status(400).json({status:0,result:err});
    })
})
module.exports=router;