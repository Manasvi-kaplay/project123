var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var fileupload=require("express-fileupload");
var session=require("express-session")
var request=require("request");
app.use(bodyParser.urlencoded({
    extended:false,
    limit:'50mb'
  }));
app.use(bodyParser.json({
    limit: '50mb'
  }));
app.use(express.static(__dirname+"/public"));
app.use(fileupload());
app.set("view engine","ejs");
app.use(session({secret:"TSS",saveUninitialized:true}))
const {spawn} = require('child_process');
const { json } = require("body-parser");
 app.post('/data', (req, res) => {
  var dataToSend;
  var link=req.body.link;
  var videos=[];
  var images=[];
  var pexel_videos=[];
  var API_KEY = '18525176-9375201fa157d3b13491d8253';
  var api_key="563492ad6f917000010000019f0cccef39434e3d85e53bfa58896c18";
  const python2 = spawn('python', ['model.py',link]);
  python2.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend=data.toString();
  });
  python2.on('close', (code) => {
    if(dataToSend==undefined || dataToSend=='\r\n'){
      res.status(400).json({status:0,msg:"Cannot retrieve data from the website due to security issues.Please copy/paste or write the text"})
    }
    else{
      var obj=JSON.parse(dataToSend);
    var search=obj.freq[0].concat(" ").concat(obj.freq[1]);
    console.log("search..",search)
    var videoUrl = "https://pixabay.com/api/videos/?key="+API_KEY+"&q="+encodeURIComponent(search);
    var pixelVideoUrl=" https://api.pexels.com/videos/search?query="+search+"&per_page=40";
    var imgUrl="https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(obj.freq[0]);
    request(pixelVideoUrl,{headers:{Authorization:api_key},json:true},function(pixelErr,pixelResp,pixelBody){
      if(pixelErr){ return console.log(pixelErr); }
      for(var k=0;k<pixelBody.videos.length;k+=1){
        pexel_videos.push(pixelBody.videos[k].video_files[0].link)
        pexel_videos.push(pixelBody.videos[k].video_files[1].link)
      }
      console.log("pexel videos array..",pexel_videos);
      obj.pexel_videos=pexel_videos
    })
    request(videoUrl,{json:true},function(err,resp,body){
      if (err) { return console.log(err); }
  if(body.hits.length>0){
    for(var i=0;i<body.hits.length;i+=1){
      videos.push(body.hits[i].videos.medium.url);
    }
    obj.videos=videos;
    res.status(200).json({status:1,result:obj});
  }
  else{
    console.log("irrelavant videos...")
    request(imgUrl,{json:true},function(err2,resp2,body2){
      if (err2) { return console.log(err); }
      if(body2.hits.length>0){
        for(var j=0;j<body2.hits.length;j+=1){
          images.push(body2.hits[j].previewURL);
        }
        obj.images=images;
        res.status(200).json({status:1,result:obj});
      }
    })
  }
    })
    }
  });
 })
app.use(require("./controller/default"));
app.listen(process.env.PORT || 5000,function(){
      console.log("server started at port 5000");
  });