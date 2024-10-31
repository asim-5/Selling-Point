const express = require('express');
const { makeDebtPayment, debtRecordByCustomer, removeDebt } = require('../controllers/debt_controller');
const router=express.Router();

router.post('/makepayment',makeDebtPayment );

//this is the payment record made by customer
router.get('/debtCustomer/:custId/:userId',debtRecordByCustomer);

router.delete('/debtRemove/:custId/:debtId/:userId',removeDebt);

module.exports=router;