var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var fileupload=require("express-fileupload");
var session=require("express-session")
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
/*app.get('/enterLink',function(req,res){
  var pagedata={"title":"Enter blog link","pagename":"blogs"}
  res.render("layout",pagedata);
})
app.get('/blogs',function(req,res){
  var link=req.query.link;
  console.log("link....",link);
  global.link=link;
})*/
const {spawn} = require('child_process');
/*app.get('/data', (req, res) => {
  var dataToSend;
  console.log("link in /data method..",link)
  const python2 = spawn('python', ['model.py',link]);
  python2.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend=data.toString();
  });
  python2.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  console.log("dataToSend.....",dataToSend);
  res.json(dataToSend);
  });
 })*/
 app.post('/data', (req, res) => {
  var dataToSend;
  var link=req.body.link;
  console.log("link in post /data method..",link)
  const python2 = spawn('python', ['model.py',link]);
  var count=0;
  if(count==0){
  python2.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend=data.toString();
  });
}
  python2.on('close', (code) => {
  console.log(`child process close all stdio with code`,code);
  console.log("dataToSend.....",dataToSend);
  res.status(200).json({status:1,result:dataToSend});
  });
 })
app.use(require("./controller/default"));
app.listen(process.env.PORT || 5000,function(){
      console.log("server started at port 5000");
  });