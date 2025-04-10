const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
mongoose.set('strictPopulate', false);

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true
    },
    addresses : [{
        address : {type : String},
        city : {type : String},
        state : {type : String},
        pincode : {type : Number},
        country : {type : String}
    }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchases" }]
    });

const adminSchema = new Schema({  
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true
    }
    });
    
const productSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, enum: ["CPU", "GPU", "RAM", "Storage", "Motherboard", "Keyboard", "Mouse", "Monitor", "Cabinet", "Others"], required: true },
    sspecs: { 
        processor: String,
        cores: Number,
        memory: String,
        storage: String,
        dimensions: String,
        weight: String,
        wattage: Number,
        additionalDetails: String
    },
    stock: { type: Number, default: 0 },
    image : [{type : String}],
    reviews: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
    });


    const purchaseSchema = new Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }],
        totalAmount: { type: Number, required: true, default : 0 },
        status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
        paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
        orderDate: { type: Date, default: Date.now },
        shippingAddress: {
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: Number },
            country: { type: String }
        },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String }
    });
    

const cartSchema = new Schema({
    userId: { type: ObjectId, ref: "User", required: true },
    items: [
        {
            productId: { type: ObjectId, ref: "Products", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
}, { timestamps: true });

const wishlistSchema = new Schema({
    userId: { type: ObjectId, ref: "User", required: true },
    products: [{ type: ObjectId, ref: "Products" }]
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);
const adminModel = mongoose.model("Admin", adminSchema);
const productModel = mongoose.model("Products", productSchema);
const purchaseModel = mongoose.model("Purchases", purchaseSchema);
const cartModel = mongoose.model("Cart", cartSchema);
const wishlistModel = mongoose.model("Wishlist", wishlistSchema);

module.exports= {
    userModel,
    adminModel,
    productModel,
    purchaseModel,
    cartModel,
    wishlistModel
};