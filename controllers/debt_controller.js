const db = require("../config/db");

const makeDebtPayment = async (req, res) => {
    try {
        const { customerId, userId, paymentAmount } = req.body;

        if (!customerId || !userId || !paymentAmount) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID, User ID, and Payment Amount are required'
            });
        }

        // Start a transaction
        await db.query('START TRANSACTION');

        // Check the current total debt for the customer
        const [customer] = await db.query(
            'SELECT total_debt FROM Customers WHERE customer_id = ? AND user_id = ?',
            [customerId, userId]
        );

        if (customer.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        const currentTotalDebt = customer[0].total_debt;

        if (paymentAmount > currentTotalDebt) {
            await db.query('ROLLBACK');
            return res.status(400).send({
                success: false,
                message: 'Payment amount exceeds total debt'
            });
        }

        // Insert the payment record
        const insertPaymentQuery = `
            INSERT INTO DebtPayments (customer_id, payment_date, payment_amount, user_id)
            VALUES (?, CURDATE(), ?, ?)
        `;
        const insertPaymentValues = [customerId, paymentAmount, userId];
        await db.query(insertPaymentQuery, insertPaymentValues);

        // Update the total debt for the customer
        const updateDebtQuery = `
            UPDATE Customers 
            SET total_debt = total_debt - ?, last_update = CURDATE() 
            WHERE customer_id = ? AND user_id = ?
        `;
        const updateDebtValues = [paymentAmount, customerId, userId];
        await db.query(updateDebtQuery, updateDebtValues);

        // Commit the transaction
        await db.query('COMMIT');

        res.status(200).send({
            success: true,
            message: 'Debt payment successful'
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error processing debt payment'
        });
    }
};

// this is the payment record
const debtRecordByCustomer = async (req,res)=>{
    try{
    const userId=req.params.id;
    const {custId}=req.body;
    if(!userId||!custId){
        res.status(500).send({
            success: false,
            message: 'Please provide all fields'})  
    }
    const [data]= await db.query(`Select * from debtpayments where customer_id = ? and user_id = ?`,[custId,userId]);
    if (data.length === 0) {
        return res.status(404).send({
            success: false,
            message: 'No record found'
        });
    }
    res.status(200).send({
        success: true,
        data: data
    });

    }
    catch(error){
        res.status(500).send({
            success: false,
            message: error
        })
    }

}

module.exports = { makeDebtPayment,debtRecordByCustomer };
