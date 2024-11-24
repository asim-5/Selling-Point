const db = require("../config/db");


const getCustomers= async (req,res) => {
    try{
        const userId = req.params.id;
        const data=await db.query('SELECT * FROM customers WHERE user_id = ?', [userId])
        console.log(userId);
        if(!data){
            return res.status(404).send({
                success: false,
                message: 'No records',
                data,
            })
        }
        res.status(200).send({
            success: true,
            message: "All Customer Records",
            totalProduct: data[0].length,
            data:data[0],
        }
        );
    }catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get all customer api'
        })
    }

};

const addCustomer=async(req,res)=>{
    try{
        const userId=req.params.id;
        const {name, phone, email, address, last_update}=req.body;
        if(!name || !phone || !email|| !address|| !last_update){
            // console.log(name, price, description, vendor, quantity, category, arrival_date, selling_date,cost);
            res.status(500).send({
                success: false,
                message: 'Please provide all fields'
            })

        }
        const data=await db.query(`INSERT INTO customers (  name, phone, email, address, last_update,user_id)VALUES(?,?,?,?,?,?) `,[name, phone, email, address, last_update,userId])
            console.log(name)
            if(!data){
                res.status(404).send({
                    success: false,
                    message: 'Error in the insert query'
                })
            }
            res.status(201).send({
                success: true,
                message: 'New Customer added'


            })

    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            message: error
        })
    }
};

const deleteCustomer=async(req,res)=>{
    try{
        const id=req.params.id
        const {customer_id}=req.body;
        if(!id){
            res.status(500).send({
                success: false,
                message: 'invalid id'
            })
        }
     console.log(customer_id,id);
        const data=await db.query(`DELETE FROM customers WHERE customer_id = ? and user_id = ?;`,[customer_id,id])

            if(!data){
                res.status(404).send({
                    success: false,
                    message: 'Error in the delete query'
                })
            }
            res.status(201).send({
                success: true,
                message: 'Customer deleted'


            })

    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            message: error
        })
    }
};
const searchCustomers = async (req, res) => {
    try {
        const searchTerm = req.query.name;
        const userId = req.query.user_id;

        if (!searchTerm) {
            return res.status(400).send({
                success: false,
                message: 'Search term is required'
            });
        }

        if (!userId) {
            return res.status(400).send({
                success: false,
                message: 'User ID is required'
            });
        }

        const query = `
            SELECT * FROM customers 
            WHERE name LIKE ? AND user_id = ?
        `;
        const values = [`%${searchTerm}%`, userId];
        const [results] = await db.query(query, values);

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No customers found'
            });
        }
        res.status(200).send({
            success: true,
            data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error searching for customers'
        });
    }
};
const updateCustomer = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming userId is passed as a URL parameter
        const {customer_id, name, phone, email, address, total_debt, last_update } = req.body; // Destructuring req.body
   
        if(!name || !phone || !email|| !address||!total_debt|| !last_update){
            // console.log(name, price, description, vendor, quantity, category, arrival_date, selling_date,cost);
            res.status(500).send({
                success: false,
                message: 'Please provide all fields'
            })

        }
    

        if (!userId) {
            return res.status(500).send({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // console.log("Updating product with ID:", id);
        
        const data = await db.query('UPDATE customers SET  name=?, phone=?, email=?, address=?, total_debt=?, last_update=? WHERE customer_id=? AND user_id=?', [ name, phone, email, address, total_debt, last_update, customer_id, userId]);

        if (data.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Error in the update query or no matching record found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Customer updated successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating the customer'
        });
    }
};



const getDebtProductsByCustomer = async (req, res) => {
    try {
        const userId=req.params.userId;
        const  customerId  = req.params.customerId;
        console.log(customerId,userId);
        if (!customerId || !userId) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID and User ID are required'
            });
        }

        const query = `
 SELECT 
                pur.purchase_id, 
                pur.total_price, 
                pur.purchase_date, 
                pur.payment_status,
                pur.payment_option,
                pur.discount,
                GROUP_CONCAT(p.name ORDER BY p.product_id SEPARATOR ', ') AS name, 
                GROUP_CONCAT(pi.quantity ORDER BY p.product_id SEPARATOR ', ') AS quantity,
                GROUP_CONCAT(pi.price ORDER BY p.product_id SEPARATOR ', ') AS price
            FROM 
                purchases pur
            JOIN 
                purchase_items pi ON pur.purchase_id = pi.purchase_id
            JOIN 
                products p ON pi.product_id = p.product_id
            WHERE 
                pur.customer_id = ? 
                AND pur.user_id = ? 
                AND pur.payment_status = FALSE
            GROUP BY 
                pur.purchase_id, pur.total_price, pur.purchase_date, pur.payment_status
    `;
    const values = [customerId, userId];
    const [results] = await db.query(query, values);
    // console.log(results);

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No products found on debt for the specified customer and user'
            });
        }

        res.status(200).send({
            success: true,
             data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching products on debt'
        });
    }
};
const getProductsByCustomer = async (req, res) => {
    try {
        const userId=req.params.userId;
        const  customerId  = req.params.customerId;
        console.log(customerId,userId);
        if (!customerId || !userId) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID and User ID are required'
            });
        }

        const query = `
            SELECT 
                pur.purchase_id, 
                pur.total_price, 
                pur.purchase_date, 
                pur.payment_status,
                pur.payment_option,
                pur.discount,
                GROUP_CONCAT(p.name ORDER BY p.product_id SEPARATOR ', ') AS name, 
                GROUP_CONCAT(pi.quantity ORDER BY p.product_id SEPARATOR ', ') AS quantity,
                GROUP_CONCAT(pi.price ORDER BY p.product_id SEPARATOR ', ') AS price
            FROM 
                purchases pur
            JOIN 
                purchase_items pi ON pur.purchase_id = pi.purchase_id
            JOIN 
                products p ON pi.product_id = p.product_id
            WHERE 
                pur.customer_id = ? 
                AND pur.user_id = ? 
                AND pur.payment_status = TRUE
            GROUP BY 
                pur.purchase_id, pur.total_price, pur.purchase_date, pur.payment_status
    `;
    const values = [customerId, userId];
    const [results] = await db.query(query, values);
    // console.log(results);

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No products found on debt for the specified customer and user'
            });
        }

        res.status(200).send({
            success: true,
             data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching products on debt'
        });
    }
};
const deletePurchase = async (req, res) => {
    let connection; // Declare the connection variable outside the try block

    try {
        const { userId, customerId, purchaseId } = req.params;

        // Check if all required fields are provided
        if (!userId || !customerId || !purchaseId) {
            return res.status(400).send({
                success: false,
                message: 'User ID, Customer ID, and Purchase ID are required'
            });
        }

        // Begin transaction to ensure both tables are updated
        connection = await db.getConnection(); // Initialize connection
        await connection.beginTransaction();

        // First, delete items from the purchase_items table associated with the purchase
        const [deleteItems] = await connection.query(
            `DELETE FROM purchase_items WHERE purchase_id = ?`,
            [purchaseId]
        );

        // Then, delete the purchase record from the purchases table
        const [deletePurchase] = await connection.query(
            `DELETE FROM purchases WHERE purchase_id = ? AND user_id = ? AND customer_id = ?`,
            [purchaseId, userId, customerId]
        );

        // Check if a record was deleted
        if (deletePurchase.affectedRows === 0) {
            await connection.rollback(); // Rollback only if connection exists
            return res.status(404).send({
                success: false,
                message: 'No purchase found with the provided details'
            });
        }

        // Commit the transaction if both deletions succeed
        await connection.commit();

        // Send a success response
        return res.status(200).send({
            success: true,
            message: 'Purchase record successfully deleted'
        });

    } catch (error) {
        // Rollback transaction if an error occurs and connection is established
        if (connection) {
            await connection.rollback(); // Rollback only if connection exists
        }
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'An error occurred while deleting the purchase record',
            error: error.message
        });
    } finally {
        // Release the connection back to the pool if it was created
        if (connection) {
            connection.release();
        }
    }
};
const deleteDebtPurchase = async (req, res) => {
    let connection; // Declare the connection variable outside the try block

    try {
        const { userId, customerId, purchaseId } = req.params;

        // Check if all required fields are provided
        if (!userId || !customerId || !purchaseId) {
            return res.status(400).send({
                success: false,
                message: 'User ID, Customer ID, and Purchase ID are required'
            });
        }

        // Begin transaction to ensure atomic operations
        connection = await db.getConnection(); // Initialize connection
        await connection.beginTransaction();

        // Retrieve the purchase amount from the purchases table
        const [purchaseRecord] = await connection.query(
            `SELECT total_price FROM purchases WHERE purchase_id = ? AND user_id = ? AND customer_id = ?`,
            [purchaseId, userId, customerId]
        );

        // Check if the purchase exists
        if (purchaseRecord.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'No purchase found with the provided details'
            });
        }

        const purchaseAmount = purchaseRecord[0].total_price;

        // Retrieve the customer's current total_debt
        const [customerRecord] = await connection.query(
            `SELECT total_debt FROM customers WHERE customer_id = ?`,
            [customerId]
        );

        // Check if the customer exists
        if (customerRecord.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        const currentDebt = customerRecord[0].total_debt;
        const newDebt = currentDebt - purchaseAmount;

        // Check if the new debt would be negative
        if (newDebt < 0) {
            await connection.rollback();
            return res.status(400).send({
                success: false,
                message: 'Total debt cannot go negative'
            });
        }

        // Update the total_debt in the customers table
        await connection.query(
            `UPDATE customers SET total_debt = ? WHERE customer_id = ?`,
            [newDebt, customerId]
        );

        // Delete items from the purchase_items table associated with the purchase
        await connection.query(
            `DELETE FROM purchase_items WHERE purchase_id = ?`,
            [purchaseId]
        );

        // Delete the purchase record from the purchases table
        const [deletePurchase] = await connection.query(
            `DELETE FROM purchases WHERE purchase_id = ? AND user_id = ? AND customer_id = ?`,
            [purchaseId, userId, customerId]
        );

        // Confirm deletion was successful
        if (deletePurchase.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Failed to delete the purchase record'
            });
        }

        // Commit the transaction if all operations succeed
        await connection.commit();

        // Send a success response
        return res.status(200).send({
            success: true,
            message: 'Purchase record successfully deleted and total debt updated'
        });

    } catch (error) {
        // Rollback transaction if an error occurs and connection is established
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'An error occurred while deleting the purchase record',
            error: error.message
        });
    } finally {
        // Release the connection back to the pool if it was created
        if (connection) {
            connection.release();
        }
    }
};


module.exports={addCustomer,deleteCustomer,getCustomers,searchCustomers,getDebtProductsByCustomer,updateCustomer,getProductsByCustomer,deletePurchase,deleteDebtPurchase}