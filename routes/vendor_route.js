const express = require('express');
const { getVendors, addVendor, addSupply, getDebtProductsByVendor, getProductsByVendor, debtRecordByVendor, removeVendorDebt, deleteSupply, deleteVendorDebtPurchase, makeVendorDebtPayment } = require('../controllers/vendor_controller');
const router=express.Router();

router.get('/getVendors/:id',getVendors);
router.post('/addVendor/:id',addVendor);
router.post('/addSupply',addSupply);
router.get('/debt_history/:userId/:customerId', getDebtProductsByVendor);
router.get('/supply_history/:userId/:customerId', getProductsByVendor);
router.get('/debtVendor/:vendorId/:userId',debtRecordByVendor);
router.delete('/vendorDebtRemove/:vendorId/:debtId/:userId',removeVendorDebt);
router.delete('/deleteSupply/:userId/:vendorId/:supplyId',deleteSupply);
router.delete('/deleteVendorDebtPurchase/:userId/:vendorId/:purchaseId',deleteVendorDebtPurchase);
router.post('/makeDebtPayment',makeVendorDebtPayment);
module.exports=router;