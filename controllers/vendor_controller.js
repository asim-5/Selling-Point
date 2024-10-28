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
        const { vendor_id, purchase_date, total_price, payment_status, user_id, items  } = req.body;
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
            'INSERT INTO vendor_supply ( purchase_date, total_price, payment_status, user_id, vendor_id) VALUES (?, ? ,?, ?, ?)',
            [ purchase_date, total_price, payment_status, user_id, vendor_id]
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
module.exports={getVendors,addVendor,addSupply,getDebtProductsByVendor,getProductsByVendor}