var MongoClients=require("mongodb").MongoClient;
var url="mongodb+srv://manasvi:100Scholars@cluster0.xxvm0.mongodb.net/Quantavid?retryWrites=true&w=majority";
module.exports.init=function(cb){
    MongoClients.connect(url,{ useNewUrlParser: true },{ useUnifiedTopology: true }, cb);
}  