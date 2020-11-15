var express=require("express");
var router=express.Router();
const {all}=require("firebase")
var firebase=require("firebase");
var admin=require("firebase-admin");
var serviceAccount=require("../serviceAccount/quantavid-web-de-b67d8122f58d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:"https://quantavid-web-de.firebaseio.com",
 // databaseURL: "https://aesthetic-nova-242210.firebaseio.com"
 //databaseURL: "https://quantavid-web-de.firebaseio.com",
 storageBucket: "quantavid-web-de.appspot.com"
});
router.get('/',function(req,res){
    var pagedata={"title":"Upload image/video","pagename":"user_uploads"}
    res.render("layout",pagedata);
});
router.get('/viewAll',function(req,res){
  var email="manasvi111.kaplay@gmail.com";
    var bucket = admin.storage().bucket();
    var signedUrlConfig = { action: 'read', expires: '03-17-2025' }; // this is a signed url configuration object
    // this is just for the sake of this example. Ideally you should get the path from the object that is uploaded :)
    var folderPath = email;
    var total_size=0;
    bucket.getFiles({ prefix: folderPath }, function(err, files) {
      if(err){
        console.log("Error..",err);
      }
      var fileURLs = [] // array to hold all file urls 
      // files = array of file objects
      // not the contents of these files, we're not downloading the files. 
      //console.log("files",files);
      for(var i=0;i<files.length;i+=1){
        total_size=total_size+Number(files[i].metadata.size)
        files[i].getSignedUrl(signedUrlConfig, function(err, fileURL) {
          fileURLs.push(fileURL);
        if(fileURLs.length==files.length){
         //console.log("fileURLs..",fileURLs);
          //res.status(200).json({status:1,urls:fileURLs,total_size:total_size})
          res.json({urls:fileURLs,total_size:total_size})
        }
        });
      };
  console.log("file size..",total_size);
    });
})
router.get('/save',function(req,res){
var email="manasvi111.kaplay@gmail.com";
var config={
    apiKey: "AIzaSyBb7WBShTspeZkDX42Bb-J_U4VFtTc_Nvk",
    authDomain:"quantavid-web-de.firebaseapp.com",
    databaseURL: "https://quantavid-web-de.firebaseio.com",
    storageBucket: "quantavid-web-de.appspot.com"
  }
  var bucket = admin.storage().bucket();
  var folderPath = email;
    var total_size=0;
    bucket.getFiles({ prefix: folderPath }, function(err, files) {
      for(var i=0;i<files.length;i+=1){
        total_size=total_size+Number(files[i].metadata.size)
      };
  console.log("file size..",total_size);
  res.json({email:email,config:config,total_size:total_size});
    });
});
router.get('/delete',function(req,res){
  var url=req.query.url;
  var splitted=url.split("/");
  //console.log("splitted..",splitted);
  var folderOld=splitted[4];
  var folder=folderOld.replace('%40','@');
  //console.log("folder..",folder);
  var filePath=splitted[5].split("?");
  var file=filePath[0];
  //console.log("fileold..",file);
  var fileNew=file.replace(/%20/g, ' ')
  //console.log("file..",fileNew);
  var bucket=admin.storage().bucket();
  var path=folder+"/"+fileNew;
  bucket.file(path).delete().then(function(){
    //res.json("file deleted..")
    var signedUrlConfig = { action: 'read', expires: '03-17-2025' }; 
    var total_size=0;
    bucket.getFiles({ prefix: folder }, function(err, files) {
      var fileURLs = [] 
      console.log("files.length...",files.length);
      for(var i=0;i<files.length;i+=1){
        total_size=total_size+Number(files[i].metadata.size)
        files[i].getSignedUrl(signedUrlConfig, function(err, fileURL) {
          fileURLs.push(fileURL);
        if(fileURLs.length==files.length){
          res.json({urls:fileURLs,total_size:total_size})
        }
        });
      };
  console.log("file size..",total_size);
    });
   // res.json("File deleted successfully!");
  })
  .catch(function(err){
    console.log("Error..",err);
    res.json("File could not be deleted.Try again!");
  })
})
router.get('/deleteAll',function(req,res){
  var email=req.query.email;
  var bucket=admin.storage().bucket();
  var folder=email;
  bucket.getFiles({prefix:folder},function(err,files){
    console.log("files..",files);
    for(var i=0;i<files.length;i+=1){
      bucket.file(files[i].name).delete().then(function(){
        console.log("deleted!")
      })
    }
  })
  res.json("All files deleted!")
})
module.exports=router;