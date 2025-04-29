const express = require('express');
const app = express();
require('dotenv').config();
const config = require('./config');
const mongoose = require('mongoose');  
app.use(express.json());  

const cors = require('cors');
app.use(cors());

const adminRouter = require('./Routes/admin');
const userRouter = require('./Routes/user');
const productRouter = require('./Routes/products');
const cartRouter = require('./Routes/cart');
const wishlistRouter = require('./Routes/wishlist');
const paymentRouter = require('./Routes/payment');
const aiRouter = require('./Routes/ai');
const reviewRouter = require('./Routes/review');
const ordersRouter = require('./Routes/orders');

app.use('/admin', adminRouter);
app.use('/user', userRouter);   
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/payment', paymentRouter);
app.use('/ai', aiRouter);
app.use('/review', reviewRouter);
app.use('/orders', ordersRouter);

async function main(){
    await mongoose.connect(process.env.MONGO_URL);

    app.listen(8000, () => console.log('Server is running'));
}

main();