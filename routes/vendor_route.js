const express = require('express');
const { getVendors, addVendor, addSupply, getDebtProductsByVendor, getProductsByVendor } = require('../controllers/vendor_controller');
const router=express.Router();

router.get('/getVendors/:id',getVendors);
router.post('/addVendor/:id',addVendor);
router.post('/addSupply',addSupply);
router.get('/debt_history/:userId/:customerId', getDebtProductsByVendor);
router.get('/supply_history/:userId/:customerId', getProductsByVendor);
module.exports=router;