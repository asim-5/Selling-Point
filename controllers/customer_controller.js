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
            SELECT pur.purchase_id,p.product_id,p.name,pur.purchase_date,pur.quantity,pur.total_price,pur.payment_status
            FROM products p
            JOIN purchases pur ON p.product_id = pur.product_id
            JOIN customers c ON pur.customer_id = c.customer_id
            WHERE pur.customer_id = ? AND p.user_id = ? AND pur.payment_status = FALSE
        `;
        const values = [customerId, userId];
        const [results] = await db.query(query, values);

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

module.exports={addCustomer,deleteCustomer,getCustomers,searchCustomers,getDebtProductsByCustomer,updateCustomer}