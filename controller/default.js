var express=require("express");
var router=express.Router();
router.use("/audios",require("./audios"))
router.use("/google_login",require("./google_login"))
router.use("/img_video_search",require("./img_video_search"))
router.use("/payment_gateway",require("./payment_gateway"))
router.use("/users",require("./users"))
router.use("/user_uploads",require("./user_uploads"))
router.use("/videoEditting",require("./videoEditting"))
router.use("/plans",require("./plans"))
module.exports=router;