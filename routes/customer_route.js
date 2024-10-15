const express = require('express');
const { addCustomer, deleteCustomer, getCustomers, searchCustomers, getDebtProductsByCustomer, updateCustomer } = require('../controllers/customer_controller');
const router=express.Router();


router.post('/add/:id',addCustomer);
router.delete('/delete/:id',deleteCustomer);
router.get('/getall/:id',getCustomers);
router.get('/search', searchCustomers);
router.get('/debt_history/:userId/:customerId', getDebtProductsByCustomer);
router.put('/UpdateCustomer/:id',updateCustomer);
module.exports = router;