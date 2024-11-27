const db = require("../config/db");

const getProduct= async (req,res) => {
    try{
        const userId = req.params.id;
        const data=await db.query('SELECT p.product_id, p.name, p.price, p.description, v.name AS vendor, p.quantity, p.category, p.arrival_date, p.selling_date,p.cost,p.user_id,p.vendor_id FROM products p JOIN vendor v ON p.vendor_id = v.vendor_id WHERE p.user_id = ?;', [userId])
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
            message: "All Prodcuts Records",
            totalProduct: data[0].length,
            data:data[0],
        }
        );
    }catch(error){

        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get all product api'
        })

    }

};

const getProductByName= async (req,res) => {
    try{
        
        const userId =req.params.id
        const {pname}= req.body;
        console.log(userId,pname)
        if(!pname || !userId){
            return res.status(404).send({
                success: false,
                message: 'provide both fields',
               
            })
        }
        
        const data=await db.query('SELECT * FROM products WHERE name like ? AND user_id = ?', [`%${pname}%`, userId])
        if(data[0].length==0){
            return res.status(404).send({
                success: false,
                message: 'No records by name',
            })
        }
        res.status(200).send({
            success: true,
            message: "All products Records by name",
            Studentdetails: data[0].length,
            data:data[0],
        }
        );
    }catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            message: error
        })
    }
};

const addProduct=async(req,res)=>{
    try{
        const userId=req.params.id;
        const {name, price, description, vendor_id, quantity, category, arrival_date, selling_date,cost}=req.body;
        if(!name || !price || !description|| !vendor_id|| !quantity|| !category|| !arrival_date||!selling_date||!cost){
            console.log(name, price, description, vendor_id, quantity, category, arrival_date, selling_date,cost);
            res.status(500).send({
                success: false,
                message: 'Please provide all fields'
            })

        }
        const data=await db.query(`INSERT INTO products ( name, price, description, quantity, category, arrival_date, selling_date, cost,user_id,vendor_id)VALUES(?,?,?,?,?,?,?,?,?,?) `,[name, price, description, quantity, category, arrival_date, selling_date,cost,userId,vendor_id])
            console.log(name)
            if(!data){
                res.status(404).send({
                    success: false,
                    message: 'Error in the insert query'
                })
            }
            res.status(201).send({
                success: true,
                message: 'New Product added'


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

const updateProduct = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming userId is passed as a URL parameter
        const { product_id, name, price, description, vendor, quantity, category, arrival_date, selling_date, cost } = req.body; // Destructuring req.body
        console.log(product_id)
        if (!product_id) {
            return res.status(500).send({
                success: false,
                message: 'Invalid product ID'
            });
        }

        if (!userId) {
            return res.status(500).send({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // console.log("Updating product with ID:", id);
        
        const data = await db.query('UPDATE products SET name=?, price=?, description=?, vendor=?, quantity=?, category=?, arrival_date=?, selling_date=?, cost=? WHERE product_id=? AND user_id=?', [name, price, description, vendor, quantity, category, arrival_date, selling_date, cost, product_id, userId]);

        if (data.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Error in the update query or no matching record found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Product updated successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating the product'
        });
    }
};


const deleteProduct=async(req,res)=>{
    try{
        const id=req.params.id
        const {product_id}=req.body;
        if(!id){
            res.status(500).send({
                success: false,
                message: 'invalid id'
            })
        }
     console.log(product_id,id);
        const data=await db.query(`DELETE FROM products WHERE product_id = ? and user_id = ?;`,[product_id,id])

            if(!data){
                res.status(404).send({
                    success: false,
                    message: 'Error in the delete query'
                })
            }
            res.status(201).send({
                success: true,
                message: 'Product deleted'


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
const updateProductQuantity = async (req, res) => {
    try {
        const { product_id, user_id, quantity } = req.body;

        // Validate input
        if (!product_id || !user_id || !quantity) {
            return res.status(400).send({
                success: false,
                message: 'Product ID, User ID, and quantity are required'
            });
        }

        // Fetch product data
        const [product] = await db.query('SELECT quantity FROM products WHERE product_id = ? AND user_id = ?', [product_id, user_id]);

        if (product.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }

        const currentQuantity = product[0].quantity;

        // Check if stock is available
        if (quantity > currentQuantity) {
            return res.status(400).send({
                success: false,
                message: 'Stock unavailable'
            });
        }

        // Update product quantity
        const newQuantity = currentQuantity - quantity;
        await db.query('UPDATE products SET quantity = ? WHERE product_id = ? AND user_id = ?', [newQuantity, product_id, user_id]);

        res.status(200).send({
            success: true,
            message: 'Stock updated successfully',
            newQuantity: newQuantity
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating product quantity'
            
        });
    }
};

const getProductByCategory = async (req, res) => {
    try {
        const userId=req.params.id;
        const { categoryName } = req.query; 
        console.log(categoryName,userId);
        if (!categoryName || !userId) {
            return res.status(400).send({
                success: false,
                message: 'Category and User ID are required'
            });
        }

        const [results] = await db.query('SELECT * FROM products WHERE category = ? and user_id = ?', [categoryName,userId]);

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No products'
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
            message: 'Error fetching products'
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const userId=req.params.id;
        
        if ( !userId) {
            return res.status(400).send({
                success: false,
                message: 'User ID are required'
            });
        }

        const [results] = await db.query('SELECT distinct category FROM products WHERE user_id = ?', [userId]);

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No categories'
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
            message: 'Error fetching Categories'
        });
    }
};

// Update purchase and adjust total_debt in customers table
const updateDebtPurchaseProducts = async (req, res) => {
    const connection = await db.getConnection(); // Start a transaction
    try {
        await connection.beginTransaction();

        const { purchase_id, customer_id, user_id } = req.params; // Non-editable fields from params
        const { purchase_date, quantity, total_price, payment_status } = req.body; // Editable fields
        
        // Fetch the current purchase details
        const [currentPurchase] = await connection.query(
            'SELECT total_price, payment_status FROM purchases WHERE purchase_id = ? AND customer_id = ? AND user_id = ?',
            [purchase_id, customer_id, user_id]
        );

        if (!currentPurchase) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Purchase not found'
            });
        }
        const oldTotalPrice = currentPurchase[0].total_price;
        const oldPaymentStatus = currentPurchase[0].payment_status;
        // Fetch the customer's total_debt
        const [customer] = await connection.query(
            'SELECT total_debt FROM customers WHERE customer_id = ?',
            [customer_id]
        );

        if (!customer) {
            await connection.rollback();
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }
       
        const customerTotalDebt = customer[0].total_debt;
      //  console.log(total_price,customerTotalDebt);
        // If payment_status changes from 0 to 1, check if total_price is greater than total_debt
        if (oldPaymentStatus == 0 && payment_status == 1 && total_price > customerTotalDebt) {
            await connection.rollback(); // Roll back the transaction if the condition fails
            return res.status(400).send({
                success: false,
                message: 'Price greater than debt, cannot change payment status'
            });
        }

        // Update the purchase fields
        const updateQuery = `
            UPDATE purchases 
            SET purchase_date = ?, total_price = ?, payment_status = ? 
            WHERE purchase_id = ? AND customer_id = ? AND user_id = ?
        `;
        await connection.query(updateQuery, [purchase_date, quantity, total_price, payment_status, purchase_id, customer_id, user_id]);

        // If total_price is changed, update the customer's total_debt
      //  console.log(total_price,oldTotalPrice);
        if (total_price > oldTotalPrice) {

            const priceDifference = total_price - oldTotalPrice;
            await connection.query(
                'UPDATE customers SET total_debt = total_debt + ? WHERE customer_id = ?',
                [priceDifference, customer_id]
            );
        }
        if (total_price < oldTotalPrice) {

            const priceDifference = oldTotalPrice - total_price ;
            await connection.query(
                'UPDATE customers SET total_debt = total_debt - ? WHERE customer_id = ?',
                [priceDifference, customer_id]
            );
        }


        // If payment_status changes from 0 to 1, subtract total_price from total_debt
        console.log("sss");
        console.log(oldPaymentStatus,payment_status);
        console.log(oldPaymentStatus == 0 && payment_status == 1);
        // console.log(oldPaymentStatus,payment_status,total_price,customer_id);
        if (oldPaymentStatus == 0 && payment_status == 1) {
            console.log("hello1");
            await connection.query(
                'UPDATE customers SET total_debt = total_debt - ? WHERE customer_id = ?',
                [total_price, customer_id]
            );
        }

        await connection.commit(); // Commit the transaction if everything is successful

        res.status(200).send({
            success: true,
            message: 'Purchase and customer debt updated successfully'
        });
    } catch (error) {
        await connection.rollback(); // Roll back transaction in case of error
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating purchase'
        });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};

const makeTransaction = async (req, res) => {
    const connection = await db.getConnection(); // To handle the transaction
    try {
        const { customer_id, purchase_date, total_price, payment_status, items, user_id, payment_detail, discount } = req.body;
        console.log(customer_id, purchase_date, total_price, payment_status, items, user_id, payment_detail, discount);

        // Validate request body
        if (!customer_id || !purchase_date || !total_price || !items || !user_id || payment_detail === undefined || discount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        // Begin transaction
        await connection.beginTransaction();
        const quantity = 1;
        const product_id = items[0].product_id;

        // Insert into the `purchases` table
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchases (customer_id, product_id, purchase_date, quantity, total_price, payment_status, user_id, payment_option, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_id, product_id, purchase_date, quantity, total_price, payment_status, user_id, payment_detail, discount]
        );

        const purchase_id = purchaseResult.insertId; // Get the generated purchase_id
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

            if (!availableQuantity || availableQuantity < quantity) {
                await connection.rollback(); // Rollback transaction
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ID ${product_id}. Available quantity: ${availableQuantity}, requested: ${quantity}`
                });
            }

            // Insert into `purchase_items` table
            await connection.query(
                'INSERT INTO purchase_items (purchase_id, product_id, price, quantity, user_id) VALUES (?, ?, ?, ?, ?)',
                [purchase_id, product_id, price, quantity, user_id]
            );

            // Subtract the purchased quantity from the `products` table
            await connection.query(
                'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
                [quantity, product_id]
            );
        }

        // Step to update total_debt and last_update if payment_status is 0
        if (payment_status == 0) {
            await connection.query(
                'UPDATE customers SET total_debt = total_debt + ?, last_update = NOW() WHERE customer_id = ? AND user_id = ?',
                [total_price, customer_id, user_id]
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






module.exports={getProduct,getProductByName,addProduct,updateProduct,deleteProduct,updateProductQuantity,getProductByCategory,getCategories,updateDebtPurchaseProducts,makeTransaction };