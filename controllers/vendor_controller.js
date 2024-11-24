const db = require("../config/db");

const getVendors= async (req,res) => {
    try{
        const userId = req.params.id;
        const data=await db.query('SELECT * FROM vendor WHERE user_id = ?', [userId])
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
const addVendor=async(req,res)=>{
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
        const data=await db.query(`INSERT INTO vendor (  name, phone, email, location, last_update,user_id)VALUES(?,?,?,?,?,?) `,[name, phone, email, address, last_update,userId])
            console.log(name)
            if(!data){
                res.status(404).send({
                    success: false,
                    message: 'Error in the insert query'
                })
            }
            res.status(201).send({
                success: true,
                message: 'New Vendor added'


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
const addSupply = async (req, res) => {
    const connection = await db.getConnection(); // To handle the transaction
    try {
        const { vendor_id, purchase_date, total_price, payment_status, user_id, items,discount,payment_details  } = req.body;
        console.log(vendor_id, purchase_date, total_price, payment_status, items, user_id);

        // Validate request body
        if (!vendor_id || !purchase_date || !total_price || !items || !user_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        // Begin transaction
        await connection.beginTransaction();
        const quantity=1;
        const product_id=1;
        // Insert into the `purchases` table
        const [purchaseResult] = await connection.query(
            'INSERT INTO vendor_supply ( purchase_date, total_price, payment_status, user_id, vendor_id,payment_option,discount) VALUES (?, ? ,?, ?, ?,?,?)',
            [ purchase_date, total_price, payment_status, user_id, vendor_id,payment_details,discount]
        );

        const purchase_id = purchaseResult.insertId; // Get the generated purchase_id
        console.log("hello");
        console.log(purchase_id);
        if (!purchase_id) {
            return res.status(400).json({
                success: false,
                message: "Purchase id error."
            });
        }

        // Iterate through the items to check quantities and update product quantities
        for (const item of items) {
            const { product_id, quantity, price } = item;

            // Check available quantity in `products` table
            const [productResult] = await connection.query(
                'SELECT quantity FROM products WHERE product_id = ?',
                [product_id]
            );
            const availableQuantity = productResult[0]?.quantity;

            // if (!availableQuantity || availableQuantity < quantity) {
            //     console.log("hello");
            //     await connection.rollback(); // Rollback transaction
            //     return res.status(400).json({
            //         success: false,
            //         message: `Insufficient stock for product ID ${product_id}. Available quantity: ${availableQuantity}, requested: ${quantity}`
            //     });
            // }

            // Insert into `purchase_items` table
            await connection.query(
                'INSERT INTO supply_items (supply_id, product_id, user_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [purchase_id, product_id,  user_id, quantity, price]
            );

            // Subtract the purchased quantity from the `products` table
            await connection.query(
                'UPDATE products SET quantity = quantity + ? WHERE product_id = ?',
                [quantity, product_id]
            );
        }

        // Step to update total_debt and last_update if payment_status is 0
        if (payment_status == 0) {
            await connection.query(
                'UPDATE vendor SET total_debt = total_debt + ?, last_update = NOW() WHERE vendor_id = ? AND user_id = ?',
                [total_price, vendor_id, user_id]
            );
        }

        // Commit the transaction
        await connection.commit();

        // Success response
        res.status(201).json({
            success: true,
            message: "Transaction completed successfully",
            purchase_id
        });

    } catch (error) {
        // Rollback the transaction in case of error
        await connection.rollback();
        console.error('Error during transaction:', error);

        // Error response
        res.status(500).json({
            success: false,
            message: "Error completing the transaction"
        });
    } finally {
        connection.release(); // Release the connection
    }
};
const getDebtProductsByVendor = async (req, res) => {
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
                pur.supply_id, 
                pur.total_price, 
                pur.purchase_date, 
                pur.payment_status,
                pur.payment_option,
                pur.discount,
                GROUP_CONCAT(p.name ORDER BY p.product_id SEPARATOR ', ') AS name, 
                GROUP_CONCAT(pi.quantity ORDER BY p.product_id SEPARATOR ', ') AS quantity,
                GROUP_CONCAT(pi.price ORDER BY p.product_id SEPARATOR ', ') AS price
            FROM 
                vendor_supply pur
            JOIN 
                supply_items pi ON pur.supply_id = pi.supply_id
            JOIN 
                products p ON pi.product_id = p.product_id
            WHERE 
                pur.vendor_id = ? 
                AND pur.user_id = ? 
                AND pur.payment_status = FALSE
            GROUP BY 
                pur.supply_id, pur.total_price, pur.purchase_date, pur.payment_status
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
const getProductsByVendor = async (req, res) => {
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
                pur.supply_id, 
                pur.total_price, 
                pur.purchase_date, 
                pur.payment_status,
                pur.payment_option,
                pur.discount,
                GROUP_CONCAT(p.name ORDER BY p.product_id SEPARATOR ', ') AS name, 
                GROUP_CONCAT(pi.quantity ORDER BY p.product_id SEPARATOR ', ') AS quantity,
                GROUP_CONCAT(pi.price ORDER BY p.product_id SEPARATOR ', ') AS price
            FROM 
                vendor_supply pur
            JOIN 
                supply_items pi ON pur.supply_id = pi.supply_id
            JOIN 
                products p ON pi.product_id = p.product_id
            WHERE 
                pur.vendor_id = ? 
                AND pur.user_id = ? 
                AND pur.payment_status = TRUE
            GROUP BY 
                pur.supply_id, pur.total_price, pur.purchase_date, pur.payment_status
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

const debtRecordByVendor = async (req,res)=>{
    try{
    const userId=req.params.userId;
    const vendorId=req.params.vendorId;
    console.log(vendorId,userId);
    if(!userId||!vendorId){
        res.status(500).send({
            success: false,
            message: 'Please provide all fields'})  
    }
  
    const [data]= await db.query(`Select * from vendorDebtpayments where vendor_id = ? and user_id = ?`,[vendorId,userId]);
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
const removeVendorDebt = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection(); // Get a connection to start the transaction

        const userId = req.params.userId;
        const vendorId = req.params.vendorId;
        const debtId = req.params.debtId;

        // Check if all required fields are provided
        if (!userId || !vendorId || !debtId) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields: userId, vendorId, and debtId.'
            });
        }

        // Start transaction
        await connection.beginTransaction();

        // Retrieve payment amount to add back to vendor debt
        const [debtRecord] = await connection.query(
            `SELECT payment_amount FROM vendorDebtpayments WHERE vendor_id = ? AND user_id = ? AND payment_id = ?`,
            [vendorId, userId, debtId]
        );

        if (debtRecord.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'No record found with the provided details.'
            });
        }

        const paymentAmount = debtRecord[0].payment_amount;

        // Update the debt amount in the vendors table
        const [updateResult] = await connection.query(
            `UPDATE vendor SET total_debt = total_debt + ? WHERE vendor_id = ? AND user_id = ?`,
            [paymentAmount, vendorId, userId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Vendor record not found for updating debt.'
            });
        }

        // Execute the delete query in the vendorDebtpayments table
        const [deleteResult] = await connection.query(
            `DELETE FROM vendorDebtpayments WHERE vendor_id = ? AND user_id = ? AND payment_id = ?`,
            [vendorId, userId, debtId]
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
            message: 'Debt record successfully removed, and amount added back to vendor debt.'
        });

    } catch (err) {
        // Rollback transaction if an error occurs
        if (connection) await connection.rollback();
        return res.status(500).send({
            success: false,
            message: 'An error occurred while removing the debt record.',
            error: err.message
        });
    } finally {
        // Release the connection back to the pool if it was created
        if (connection) connection.release();
    }
};
const deleteSupply = async (req, res) => {
    let connection;

    try {
        const { userId, vendorId, supplyId } = req.params;

        // Check if all required fields are provided
        if (!userId || !vendorId || !supplyId) {
            return res.status(400).send({
                success: false,
                message: 'User ID, Vendor ID, and Supply ID are required'
            });
        }

        // Begin transaction to ensure both tables are updated
        connection = await db.getConnection(); // Initialize connection
        await connection.beginTransaction();

        // First, delete items from the supply_items table associated with the supply
        const [deleteItems] = await connection.query(
            `DELETE FROM supply_items WHERE supply_id = ?`,
            [supplyId]
        );

        // Then, delete the supply record from the vendor_supply table
        const [deleteSupply] = await connection.query(
            `DELETE FROM vendor_supply WHERE supply_id = ? AND user_id = ? AND vendor_id = ?`,
            [supplyId, userId, vendorId]
        );

        // Check if a record was deleted
        if (deleteSupply.affectedRows === 0) {
            await connection.rollback(); // Rollback only if connection exists
            return res.status(404).send({
                success: false,
                message: 'No supply found with the provided details'
            });
        }

        // Commit the transaction if both deletions succeed
        await connection.commit();

        // Send a success response
        return res.status(200).send({
            success: true,
            message: 'Supply record successfully deleted'
        });

    } catch (error) {
        // Rollback transaction if an error occurs and connection is established
        if (connection) {
            await connection.rollback(); // Rollback only if connection exists
        }
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'An error occurred while deleting the supply record',
            error: error.message
        });
    } finally {
        // Release the connection back to the pool if it was created
        if (connection) {
            connection.release();
        }
    }
};
const deleteVendorDebtPurchase = async (req, res) => {
    let connection;

    try {
        const { userId, vendorId, purchaseId } = req.params;
        console.log(userId, vendorId, purchaseId);
        // Check if all required fields are provided
        if (!userId || !vendorId || !purchaseId) {
            return res.status(400).send({
                success: false,
                message: 'User ID, Vendor ID, and Purchase ID are required'
            });
        }

        // Begin transaction to ensure atomic operations
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Retrieve the purchase amount from the vendor_purchases table
        const [purchaseRecord] = await connection.query(
            `SELECT total_price FROM vendor_supply WHERE supply_id = ? AND user_id = ? AND vendor_id = ?`,
            [purchaseId, userId, vendorId]
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

        // Retrieve the vendor's current total_debt
        const [vendorRecord] = await connection.query(
            `SELECT total_debt FROM vendor WHERE vendor_id = ?`,
            [vendorId]
        );

        // Check if the vendor exists
        if (vendorRecord.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Vendor not found'
            });
        }

        const currentDebt = vendorRecord[0].total_debt;
        const newDebt = currentDebt - purchaseAmount;

        // Check if the new debt would be negative
        if (newDebt < 0) {
            await connection.rollback();
            return res.status(400).send({
                success: false,
                message: 'Total debt cannot go negative'
            });
        }

        // Update the total_debt in the vendors table
        await connection.query(
            `UPDATE vendor SET total_debt = ? WHERE vendor_id = ?`,
            [newDebt, vendorId]
        );

        // Delete items from the supply_items table associated with the purchase
        await connection.query(
            `DELETE FROM supply_items WHERE supply_id = ?`,
            [purchaseId]
        );

        // Delete the purchase record from the vendor_purchases table
        const [deletePurchase] = await connection.query(
            `DELETE FROM vendor_supply WHERE supply_id = ? AND user_id = ? AND vendor_id = ?`,
            [purchaseId, userId, vendorId]
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
            message: 'Vendor purchase record successfully deleted and total debt updated'
        });

    } catch (error) {
        // Rollback transaction if an error occurs
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'An error occurred while deleting the vendor purchase record',
            error: error.message
        });
    } finally {
        // Release the connection back to the pool if it was created
        if (connection) {
            connection.release();
        }
    }
};

module.exports={getVendors,addVendor,addSupply,getDebtProductsByVendor,getProductsByVendor,debtRecordByVendor,removeVendorDebt,deleteSupply,deleteVendorDebtPurchase}