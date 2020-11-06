var express=require("express");
var router=express.Router();
var passport=require("passport");
var google_auth=require("passport-google-oauth20");
var strategy=google_auth.Strategy;
var allQueries=require("../model/allQueries");
router.use(passport.initialize());
router.use(passport.session())
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
passport.use(new strategy({
    clientID: '208845307038-1ae361qvejtgg1ik84piadi95l8dsgp9.apps.googleusercontent.com',
    clientSecret: 'ILCvB7zMnPRb3rK1BzdXKack',
    callbackURL: 'http://localhost:5000/google_login/googleAuth/success'
},
function (accessToken, refreshToken,profile, email,done) {
    // if user already exist in your dataabse login otherwise
    // save data and signup
    allQueries.find("users",{email:email._json.email},function(err,result){
        if(err){
            console.log("err..",err)
        }
        if(result.length==0){
            var info={name:email._json.name,email:email._json.email};
            console.log("info..",info);
            allQueries.insert("users",info,function(err2,result2){
                if(result2){
                    console.log("inserted..",result2);
                }
            })
        }
    })
    done(null, {profile:profile,email:email,accessToken:accessToken});
}
));
router.get('/googleAuth',passport.authenticate('google',{scope:['profile','email']}))
router.get('/googleAuth/success', passport.authenticate('google', {failureRedirect: '/googleAuth/failure'}),
    (req, res, next) => {
        console.log("auth success....",req.user, req.isAuthenticated());
        res.send('user is logged in');
    })
router.get('/googleAuth/failure', (req, res, next) => {
        res.send('user logged in failed');
    });
module.exports=router;