var express=require("express");
var router=express.Router();
const {Storage} = require('@google-cloud/storage');
var path=require("path");
const storage = new Storage({
  keyFilename:path.join(__dirname,"../serviceAccount/gcpKey.json"),
  projectId:'quantavid-web-de'
});
router.get('/genre',function(req,res){
    async function listFilesByPrefix() {
        const options = {
          prefix: 'Audios',
        };
        const [files] = await storage.bucket("quantavid-web-de.appspot.com").getFiles(options);
        var genre;
        var genres=[];
        files.forEach(file => {
          genre=file.name.split("/");
          if(genre[1]!='' && genres.indexOf(genre[1])==-1){
            genres.push(genre[1]);
          }
        });
        console.log("all genres..",genres);
        //res.status(200).json({status:1,result:genres});
        var pagedata={"title":"Audio search","pagename":"audios",genres:genres};
        res.render("layout",pagedata);
      }
      listFilesByPrefix().catch(console.error);
})
router.get('/search',function(req,res){
  var genre=req.query.genre;
  async function listFilesByGenre() {
    const options = {
      prefix: 'Audios/'+genre,
    };
    const [files] = await storage.bucket("quantavid-web-de.appspot.com").getFiles(options);
    var audioUrls=[];
    const config = {
      action: 'read',
      expires: '03-17-2025'
    };
     for(var i=0;i<files.length;i+=1){
      files[i].getSignedUrl(config,function(err,url){
        if(url.search(".mp3")!=-1){
          audioUrls.push(url)
        }
        if(audioUrls.length==files.length-1){
          console.log("all audios..",audioUrls);
    //res.status(200).json({status:1,result:audioUrls,total:audioUrls.length});
    res.json({result:audioUrls,total:audioUrls.length})
        }
      })
     }
  }
  listFilesByGenre().catch(console.error);
})
module.exports=router;