const express = require('express');
const { registerUser, loginUser, checkAdmin } = require('../controllers/user_controller');
const router=express.Router();

//register the user
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/admin',checkAdmin);
module.exports=router;