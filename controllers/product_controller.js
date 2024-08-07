const db = require("../config/db");

const getProduct= async (req,res) => {
    try{
        const userId = req.params.id;
        const data=await db.query('SELECT * FROM products WHERE user_id = ?', [userId])
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
        const {name, price, description, vendor, quantity, category, arrival_date, selling_date,cost}=req.body;
        if(!name || !price || !description|| !vendor|| !quantity|| !category|| !arrival_date||!selling_date||!cost){
            console.log(name, price, description, vendor, quantity, category, arrival_date, selling_date,cost);
            res.status(500).send({
                success: false,
                message: 'Please provide all fields'
            })

        }
        const data=await db.query(`INSERT INTO products ( name, price, description, vendor, quantity, category, arrival_date, selling_date, cost,user_id)VALUES(?,?,?,?,?,?,?,?,?,?) `,[name, price, description, vendor, quantity, category, arrival_date, selling_date,cost,userId])
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
        const { categoryName } = req.body;
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


module.exports={getProduct,getProductByName,addProduct,updateProduct,deleteProduct,updateProductQuantity,getProductByCategory,getCategories };