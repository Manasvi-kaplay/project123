var express=require("express");
var router=express.Router();
const stripe = require('stripe')('sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr');
  
router.get('/get',function(req,res){
    stripe.charges.retrieve('ch_1HqejzJag2Djgj0uj1Or5b9u', {
        api_key: 'sk_test_51HqeWpJag2Djgj0ucTIInopI9lQKekdORucuXNfmhHcJZpDSYrU5Ohpejj5PsllaerHP6gfRdVaQroxH6yzg91lq001Zgp2EWr'
      });
})
router.post('/create',function(req,res){
    stripe.customers.create({
        email: req.body.email,
      })
        .then(customer => console.log(customer.id))
        .catch(error => console.error(error));
})
module.exports=router;