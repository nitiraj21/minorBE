const mongoose = require('mongoose');
const { Schema } = mongoose;
const ObjectId = mongoose.Types.ObjectId;
mongoose.set('strictPopulate', false);

// Import the wishlist model directly
const Wishlist = require('./Models/wishlist');
const productSchema = require('./Models/product');

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
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }]
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
            productId: { type: ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);
const adminModel = mongoose.model("Admin", adminSchema);
const productModel = mongoose.model("Product", productSchema);
const purchaseModel = mongoose.model("Purchase", purchaseSchema);
const cartModel = mongoose.model("Cart", cartSchema);
// Use the imported Wishlist model directly
const wishlistModel = Wishlist;

module.exports= {
    userModel,
    adminModel,
    productModel,
    purchaseModel,
    cartModel,
    wishlistModel
};