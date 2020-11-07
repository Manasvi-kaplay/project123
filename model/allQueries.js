var connection = require("../config/connection");
var firebase=require("firebase");
var admin=require("firebase-admin");
var serviceAccount=require("../serviceAccount/serviceAccountKey2.json");
var path=require("path");
//new:
firebase.initializeApp({
    apiKey: "AIzaSyBb7WBShTspeZkDX42Bb-J_U4VFtTc_Nvk",
    authDomain:"quantavid-web-de.firebaseapp.com",
    databaseURL: "https://quantavid-web-de.firebaseio.com",
    storageBucket: "quantavid-web-de.appspot.com"
  });
  /*admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:"quantavid-web-de.appspot.com",
     // databaseURL: "https://aesthetic-nova-242210.firebaseio.com"
     //databaseURL: "https://quantavid-web-de.firebaseio.com",
     storageBucket: "quantavid-web-de.appspot.com"
    });*/
/*module.exports.saveFiles=function(folder,obj){
  var storage=admin.storage();
  var storageRef=storage.bucket();
  var dest;
  for(var i=0;i<obj.content.length;i+=1){
    dest=folder+'/'+obj.content[i].name;
    storageRef.upload(''+obj.content[i],{public:true,destination:dest},function(err, file) {
      if(err){
        console.log("err..",err)
      }
      if(file){
        console.log("file..****");
      }
    })
  }
}*/

module.exports.insert=function(collection_name,obj,cb){
  connection.init(function(err,client){
    var db = client.db("Quantavid");
db.collection(collection_name).insert(obj,cb)
});
}
  module.exports.insertUser=function(collection_name,obj,cb){
    connection.init(function(err,client){
      var db = client.db("Quantavid");
  db.collection(collection_name).insert(obj,{upsert:true},cb)
  });
  }
  module.exports.createIndex=function(collection_name,cb){
    connection.init(function(err,client){
      var db=client.db("Quantavid");
      db.collection(collection_name).createIndex({"email":1},{unique:true},cb);
    })
  }
  module.exports.find=function(collection_name,obj,cb){
    connection.init(function(err,client){
      var db = client.db("Quantavid");
  db.collection(collection_name).find(obj).toArray(cb);
  });
  }
  module.exports.update=function(collection_name,where,obj,cb){
    connection.init(function(err,client){
      var db=client.db("Quantavid");
    db.collection(collection_name).updateOne(where,{$set:obj},cb);
  });
  }
  module.exports.increament=function(collection_name,where,obj,cb){
    connection.init(function(err,client){
      var db=client.db("Quantavid");
      db.collection(collection_name).updateOne(where,{$inc:obj},cb);
    })
  }