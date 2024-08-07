const express= require('express');
const dotenv=require('dotenv');
const morgan= require('morgan');
const mySqlPool = require('./config/db');
const cors = require('cors');

dotenv.config();

//rest object

const app = express();
app.use(cors());
//middleware
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/product",require("./routes/product_route"))
app.use("/api/v1/customer",require("./routes/customer_route"))
app.use("/api/v1/debt",require("./routes/debt_route"))
app.use("/api/v1/user",require("./routes/user_route"))

app.get("/test",(req,resp)=>{
    resp.send("app is workinghhha..")
});
const PORT=process.env.PORT||5000 ;


mySqlPool.query('SELECT 1').then(()=>{
    console.log('DB connected');

    app.listen(PORT,()=>{
        console.log(`server running on port ${process.env.PORT}`);
    })

}).catch((error)=>{
    console.log(error);
})


