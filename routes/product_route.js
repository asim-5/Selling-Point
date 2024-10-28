const express = require('express');
const {getProduct, addProduct, updateProduct, deleteProduct,updateProductQuantity, getProductByCategory, getCategories, updateDebtPurchaseProducts, makeTransaction }= require('../controllers/product_controller');
const {getProductByName}= require('../controllers/product_controller');
const router=express.Router();


router.get('/getall/:id',getProduct);

//get product by name
router.get('/get/:id',getProductByName);

//add product
router.post('/add/:id',addProduct);

//update
router.put('/update/:id',updateProduct);

//delete
router.delete('/delete/:id',deleteProduct);

//update quantity
router.post('/update-quantity', updateProductQuantity);

//get products by category
router.get('/ProductByCategory/:id',getProductByCategory);

//get categories
router.get('/categories/:id',getCategories);


router.put('/updateDebtPurchase/:purchase_id/:customer_id/:user_id',updateDebtPurchaseProducts);

//make transaction without debt
router.post('/makeTransaction',makeTransaction);

module.exports=router;