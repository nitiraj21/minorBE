const express = require('express');
const app = express();
const mongoose = require('mongoose');  
require('dotenv').config();
app.use(express.json());  

const adminRouter = require('./Routes/admin');
const userRouter = require('./Routes/user');
const productRouter = require('./Routes/products');
const cartRouter = require('./Routes/cart');



app.use('/admin', adminRouter);
app.use('/user', userRouter);   
app.use('/products', productRouter);
app.use('/cart', cartRouter);


async function main(){
    await mongoose.connect("mongodb+srv://nitirajsc2112:Bobby123@cluster0.uzofs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    app.listen(3000, () => console.log('Server is running'));
}


main();