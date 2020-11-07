var express=require("express");
var router=express.Router();
var allQueries=require("../model/allQueries");
var Excel=require("exceljs");
var firebase=require("firebase");
var admin=require("firebase-admin");
var serviceAccount=require("../serviceAccount/serviceAccountKey2.json");
const { all } = require("./google_login");
router.get('/',function(req,res){
    var pagedata={"title":"Image and video search","pagename":"Image-video-search"}
    res.render("layout",pagedata);
})
router.get('/results',function(req,res){
  console.log("req.query....",req.query);
    if(req.query.term!=undefined){
        var term=req.query.term
        var tags=req.query.tags;
        allQueries.find("keywords",{keyword:term},function(err,result){
          if(err){
            console.log("error..",err);
          }
          if(result.length==0){
            var obj={keyword:term,count:1};
            allQueries.insert("keywords",obj,function(err2,result2){
              if(result2){
                console.log("inserted!!");
              }
            })
          }
          else if(result.length>0){
            allQueries.increament("keywords",{keyword:term},{count:1},function(err3,result3){
              if(result3){
                console.log("count value increamented!!");
              }
            })
          }
        })
    }
})
router.get('/result',function(req,res){
  var pagedata={"title":"Image and video search","pagename":"Image-search"}
    res.render("layout",pagedata);
})
router.get('/searchBy',function(req,res){
  console.log("req.query...",req.query);
  //var pagedata={"title":"search by tags","pagename":"searchByTags"}
    //res.render("layout",pagedata);
})
module.exports=router;