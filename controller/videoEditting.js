var express=require("express");
var router=express.Router();
var fs = require('fs');
var path = require('path');
var allQueries=require("../model/allQueries")
router.post('/post',function(req,res){
    if(req.files){
        var file = req.files.video;
        console.log("file.....",file);
        var newname = file.name;
        var filepath = path.resolve("public/videos/"+newname);
        file.mv(filepath, function(err){
            if(err){
                console.log(err);
                return;
            }
            req.body.video=newname;
            console.log("newname...",newname);
            console.log("req.body.video...",req.body.video);
        });
    }   
    console.log("newname again...",newname);
    req.body.video=newname;
    console.log("req.body.video again...",req.body.video);
    allQueries.insertVideo("videos",req.body);
    res.status(200).json({status:1,result:"data inserted!!"});
})
module.exports=router;