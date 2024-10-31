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

        return res.status(200).send({
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
    const userId=req.params.userId;
    const custId=req.params.custId;
    console.log(custId,userId);
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
const removeDebt = async (req, res) => {
    const connection = await db.getConnection(); // Get a connection to start the transaction

    try {
        const userId = req.params.userId;
        const customerId = req.params.custId;
        const debtId = req.params.debtId;

        // Check if all required fields are provided
        if (!userId || !customerId || !debtId) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields: userId, customerId, and debtId.'
            });
        }

        // Start transaction
        await connection.beginTransaction();

        // Retrieve payment amount to add back to customer debt
        const [debtRecord] = await connection.query(
            `SELECT payment_amount FROM debtpayments WHERE customer_id = ? AND user_id = ? AND payment_id = ?`,
            [customerId, userId, debtId]
        );

        if (debtRecord.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'No record found with the provided details.'
            });
        }

        const paymentAmount = debtRecord[0].payment_amount;

        // Update the debt amount in the customer table
        const [updateResult] = await connection.query(
            `UPDATE customers SET total_debt = total_debt + ? WHERE customer_id = ? AND user_id = ?`,
            [paymentAmount, customerId, userId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Customer record not found for updating debt.'
            });
        }

        // Execute the delete query
        const [deleteResult] = await connection.query(
            `DELETE FROM debtpayments WHERE customer_id = ? AND user_id = ? AND payment_id = ?`,
            [customerId, userId, debtId]
        );

        // Check if a record was deleted
        if (deleteResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'No record found to delete with the provided details.'
            });
        }

        // Commit the transaction if all queries succeed
        await connection.commit();

        // Send a success response
        return res.status(200).send({
            success: true,
            message: 'Debt record successfully removed, and amount added back to customer debt.'
        });

    } catch (err) {
        // Rollback transaction if an error occurs
        await connection.rollback();
        return res.status(500).send({
            success: false,
            message: 'An error occurred while removing the debt record.',
            error: err.message
        });
    } finally {
        // Release the connection back to the pool
        connection.release();
    }
};


module.exports = { makeDebtPayment,debtRecordByCustomer, removeDebt };
