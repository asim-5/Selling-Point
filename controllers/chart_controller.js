const db = require("../config/db");

const getTotalDebt = async (req, res) => {
    try {
        const userId = req.params.id;

        // Query to calculate the total debt for customers and vendors for the given user ID
        const [customerData] = await db.query(
            'SELECT SUM(total_debt) AS totalCustomerDebt FROM customers WHERE user_id = ?',
            [userId]
        );

        const [vendorData] = await db.query(
            'SELECT SUM(total_debt) AS totalVendorDebt FROM vendor WHERE user_id = ?',
            [userId]
        );

        // Extract total debt values from the results
        const totalCustomerDebt = customerData[0]?.totalCustomerDebt || 0;
        const totalVendorDebt = vendorData[0]?.totalVendorDebt || 0;



        // Send success response
        res.status(200).send({
            success: true,
            message: "Total debt calculated successfully",

            customerDebt: totalCustomerDebt,
            vendorDebt: totalVendorDebt,
            
        });
    } catch (error) {
        console.error("Error calculating total debt:", error);
        res.status(500).send({
            success: false,
            message: 'Error in calculating total debt',
        });
    }
};
const getTotal = async (req, res) => {
    try {
        const userId = req.params.id;

        // Query to calculate the total debt for customers and vendors for the given user ID
        const [customerData] = await db.query(
            'SELECT SUM(total_price) AS totalSales FROM purchases WHERE user_id = ?',
            [userId]
        );

        const [vendorData] = await db.query(
            'SELECT SUM(total_price) AS totalSupply FROM vendor_supply WHERE user_id = ?',
            [userId]
        );

        // Extract total debt values from the results
        const totalCustomer = customerData[0]?.totalSales || 0;
        const totalVendor = vendorData[0]?.totalSupply || 0;



        // Send success response
        res.status(200).send({
            success: true,
            message: "Total calculated successfully",

            customer: totalCustomer,
            vendor: totalVendor,
            
        });
    } catch (error) {
        console.error("Error calculating total :", error);
        res.status(500).send({
            success: false,
            message: 'Error in calculating total',
        });
    }
};

const getchartData = async (req, res) => {
    try {
        // Query to fetch all rows and columns (purchase_date and total_price) from purchases
        const [allPurchases] = await db.query(
            'SELECT purchase_date, total_price FROM purchases'
        );

        // Query to fetch all rows and columns (purchase_date and total_price) from vendor supply
        const [allVendorSupplies] = await db.query(
            'SELECT purchase_date, total_price FROM vendor_supply'
        );

        // Query to fetch rows and columns (purchase_date and total_price) from purchases where payment_status = 0
        const [unpaidPurchases] = await db.query(
            'SELECT purchase_date, total_price FROM purchases WHERE payment_status = 0'
        );

        // Query to fetch rows and columns (purchase_date and total_price) from vendor supply where payment_status = 0
        const [unpaidVendorSupplies] = await db.query(
            'SELECT purchase_date, total_price FROM vendor_supply WHERE payment_status = 0'
        );

        // Send the results as separate lists
        res.status(200).send({
            success: true,
            message: "Data fetched successfully",
            allPurchases,
            allVendorSupplies,
            unpaidPurchases,
            unpaidVendorSupplies
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({
            success: false,
            message: 'Error fetching data',
        });
    }
};

module.exports={getTotalDebt,getTotal,getchartData}