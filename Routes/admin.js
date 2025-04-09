const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const  { JWT_ADMIN_PASSWORD } = require("../config");
const { adminModel, productModel } = require("../db");
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

        const token = jwt.sign({id : admin._id, isAdmin : true},JWT_ADMIN_PASSWORD);

        res.json({token});
    }
    catch(error){
        res.status(500).json({error : error.message});
    }
});

router.post("/add-product", authenticateAdmin, async(req, res) =>{
    try {
        const product = new productModel(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
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

router.post("/delete-product/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findOne({id});
        if (!product) return res.status(404).json({ error: "Product not found" });

        await productModel.deleteOne({ name });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

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

module.exports = router;
