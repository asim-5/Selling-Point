const express = require('express');
const { getTotalDebt, getTotal, getchartData } = require('../controllers/chart_controller');
const router=express.Router();

router.get('/totalDebt/:id',getTotalDebt);
router.get('/getTotal/:id',getTotal);
router.get('/getChart/:id',getchartData);
module.exports = router;