const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const  { JWT_ADMIN_PASSWORD } = require("../config");
const { adminModel, productModel, purchaseModel, userModel } = require("../db");
const { authenticateAdmin } = require("../AuthMiddleware/auth");


const router = express.Router();


router.post("/register", async(req, res) =>{
    try{
        const {name, email, password,} = req.body;

        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: "Admin already exists with this email" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const newAdmin = new adminModel({
            name,
            email,
            password: hashed
        });

        await newAdmin.save();
        res.status(201).json({message :  "You have registered" });
    }
    catch(error){
        res.status(400).json({error : error.message});
    }
});


router.post("/login", async (req, res) =>{
    try{
        const {email, password} =  req.body;
        const admin = await adminModel.findOne({email});

        if(!admin) {
            return res.status(400).json({error : "invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch) return res.status(400).json({error : "invalid credentials"});

        const token = jwt.sign({id : admin._id, isAdmin : true}, JWT_ADMIN_PASSWORD);
        res.json({token});
    }
    catch(error){
        res.status(500).json({error : error.message});
    }
});

router.post("/add-product", authenticateAdmin, async(req, res) =>{
    try {
        const { name, description, price, stock, category, type, brand, image, sspecs } = req.body;

        // Validate required fields
        if (!name || !description || !price || !stock || !category || !type || !brand || !image) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate price and stock are numbers and positive
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ error: "Price must be a positive number" });
        }

        if (isNaN(stock) || stock < 0) {
            return res.status(400).json({ error: "Stock must be a positive number" });
        }

        // Validate image is an array
        if (!Array.isArray(image)) {
            return res.status(400).json({ error: "Image must be an array of strings" });
        }

        const product = new productModel({
            name,
            description,
            price,
            stock,
            category,
            type,
            brand,
            image,
            sspecs
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({ error: error.message });
    }
});


router.put("/update-product/:id", authenticateAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const product = await productModel.findById(id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );
        
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/products", authenticateAdmin, async (req, res) => {
    try {
        const products = await productModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

router.delete("/delete-product/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await productModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/orders", authenticateAdmin, async (req, res) => {
    try {
        const orders = await purchaseModel.find()
            .populate('userId', 'name email')
            .populate('products.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/order-status/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        
        const order = await purchaseModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('products.productId');
        
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/order/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if order exists
        const order = await purchaseModel.findById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Delete the order
        await purchaseModel.findByIdAndDelete(id);

        // Remove order reference from user's orders array
        await userModel.updateMany(
            { orders: id },
            { $pull: { orders: id } }
        );

        res.status(200).json({ 
            success: true, 
            message: "Order deleted successfully" 
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
