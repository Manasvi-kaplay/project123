var express=require("express");
var router=express.Router();
var Excel=require("exceljs");
var firebase=require("firebase");
var admin=require("firebase-admin");
var serviceAccount=require("../serviceAccount/serviceAccountKey2.json");
/*admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:"quantavid-web-de.appspot.com",
 // databaseURL: "https://aesthetic-nova-242210.firebaseio.com"
 //databaseURL: "https://quantavid-web-de.firebaseio.com",
 storageBucket: "quantavid-web-de.appspot.com"



 208845307038-3c1ufoe1t7dqrkkvmi9kuv9spq6ogujp.apps.googleusercontent.com     client id
 TYX8Pc1sPgLAw74bKN6WI8gH        client secret
});*/
router.get('/',function(req,res){
    var pagedata={"title":"Image and video search","pagename":"Image-video-search"}
    res.render("layout",pagedata);
})
router.get('/results',function(req,res){
  console.log("req.query....",req.query);
    if(req.query.term!=undefined){
        var term=req.query.term
        var tags=req.query.tags;
        //var tag_array= tags.split(',');
        console.log("tag array...",tags)
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