var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var fileupload=require("express-fileupload");
var session=require("express-session");
var request=require("request-promise");
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
// let unix_timestamp =1613974745;
// // Create a new JavaScript Date object based on the timestamp
// // multiplied by 1000 so that the argument is in milliseconds, not seconds.
// var date = new Date(unix_timestamp * 1000);
// // Hours part from the timestamp
// var hours = date.getHours();
// // Minutes part from the timestamp
// var minutes = "0" + date.getMinutes();
// // Seconds part from the timestamp
// var seconds = "0" + date.getSeconds();
// // Will display time in 10:30:23 format
// var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
// console.log("date..",date," time..",formattedTime);
 app.post('/data', (req, res) => {
  var dataToSend="";
  var link=req.body.link;
  const python2 = spawn('python', ['summary.py',link]);
  python2.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend+=data.toString();
  });
  python2.on('close', (code) => {
    console.log("dataToSend..",dataToSend);
    if(dataToSend==undefined || dataToSend=="\r\n"){
      res.status(400).json({status:0,msg:"Cannot retrieve data from the website due to security issues.Please copy/paste or write the text"});
    }
    else{
      var obj=JSON.parse(dataToSend);
    res.status(200).json({status:1,result:obj});
    }
  });
 })
 app.post('/multimedia',function(req,res){
  var API_KEY = '18525176-9375201fa157d3b13491d8253';
  var summary=req.body.summary;
  var dataSent;
  var urls=[];
  var urls2=[];
  var imgurls=[];
  const python2 = spawn('python', ['model.py',summary]);
  python2.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataSent=data.toString();
  });
  python2.on('close', (code) => {
    if(dataSent==undefined){
      res.status(400).json({status:0,msg:"Cannot retrieve data from the website due to security issues.Please copy/paste or write the text"});
    }
    else{
      var obj=JSON.parse(dataSent);
      var search;
      for(var i=0;i<obj.keywords.length;i+=1){
        search=obj.keywords[i].join(' ');
        urls.push("https://pixabay.com/api/videos/?key="+API_KEY+"&q="+encodeURIComponent(search))
        urls2.push("https://pixabay.com/api/videos/?key="+API_KEY+"&q="+encodeURIComponent(obj.keywords[i][0]))
        imgurls.push("https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(obj.keywords[i][0]))
      }
      imgurls.push("https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(obj.freq[0]))
      var requestAsync = function(url) {
        return new Promise((resolve, reject) => {
            var req = request(url, (err, response, body) => {
                if (err) return reject(err, response, body);
                resolve(JSON.parse(body));
            });
        });
    };
    var getParallel = async function(obj) {
      //transform requests into Promises, await all
      try {
          var data = await Promise.all(urls.map(requestAsync));
          var data2= await Promise.all(urls2.map(requestAsync));
          var imgdata= await Promise.all(imgurls.map(requestAsync));
      } catch (err) {
          console.error(err);
      }
      console.log("data.length..",data.length);
      var imglength=imgdata.length;
      console.log("imgdata.length..",imglength);
      var ob;
      var multimedia=[];
      var arr=[];
      var url;
      for(var k=0;k<data.length;k+=1){
        if(data[k].hits.length>0){
          //console.log("inside if data..")
          url=data[k].hits[Math.floor((Math.random()*data[k].hits.length))].videos.medium.url;
          if(arr.indexOf(url)==-1){
            ob={[k]:url}
          console.log("data ob..",ob);
          multimedia.push(ob);
          arr.push(url)
          }
          else if(arr.indexOf(url)!=-1 && imgdata[k].hits.length>0 ){
            //console.log("duplicate!!")
            ob={[k]:imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL}
          console.log("img ob...",ob)
          multimedia.push(ob)
          arr.push(imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL)
          }
          else if(arr.indexOf(url)!=-1 && imgdata[imglength-1].hits.length>0){
            ob={[k]:imgdata[imglength-1].hits[Math.floor((Math.random()*imgdata[imglength-1].hits.length))].previewURL}
          console.log("img2 ob...",ob)
          multimedia.push(ob)
          arr.push(imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL)
          }
        }
        else if(data2[k].hits.length>0){
          //console.log("inside else if data2..")
          url=data2[k].hits[Math.floor((Math.random()*data2[k].hits.length))].videos.medium.url;
          if(arr.indexOf(url)==-1){
            ob={[k]:url}
          console.log("data2 ob..",ob);
          multimedia.push(ob);
          arr.push(url)
          }
          else if(arr.indexOf(url)!=-1 && imgdata[k].hits.length>0 ){
            //console.log("duplicate!!")
            ob={[k]:imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL}
          console.log("img ob...",ob)
          multimedia.push(ob)
          arr.push(imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL)
          }
          else if(arr.indexOf(url)!=-1 && imgdata[imglength-1].hits.length>0){
            ob={[k]:imgdata[imglength-1].hits[Math.floor((Math.random()*imgdata[imglength-1].hits.length))].previewURL}
          console.log("img2 ob...",ob)
          multimedia.push(ob)
          arr.push(imgdata[k].hits[Math.floor((Math.random()*imgdata[k].hits.length))].previewURL)
          }
        }
        else if(imgdata[imglength-1].hits.length>0){
          ob={[k]:imgdata[imglength-1].hits[Math.floor((Math.random()*imgdata[imglength-1].hits.length))].previewURL}
          console.log("ob..",ob);
          multimedia.push(ob);
          arr.push(imgdata[imglength-1].hits[Math.floor((Math.random()*imgdata[imglength-1].hits.length))].previewURL)
        }
        else{
          ob={[k]:"No image/video available"}
          multimedia.push(ob);
          arr.push("No image/video available")
        }
      }
      console.log("array..",arr);
      obj.multimedia=multimedia;
      res.status(200).json({status:1,result:obj});
  }
  getParallel(obj);
    }
  })
 })
app.use(require("./controller/default"));
app.listen(process.env.PORT || 5000,function(){
      console.log("server started at port 5000");
  });