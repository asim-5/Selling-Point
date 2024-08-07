const express = require('express');
const { registerUser } = require('../controllers/user_controller');
const router=express.Router();

//register the user
router.post('/register',registerUser);

module.exports=router;