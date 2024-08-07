const express = require('express');
const { makeDebtPayment, debtRecordByCustomer } = require('../controllers/debt_controller');
const router=express.Router();

router.post('/makepayment',makeDebtPayment );

//this is the payment record made by customer
router.get('/debtCustomer/:id',debtRecordByCustomer);

module.exports=router;