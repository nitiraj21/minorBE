const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const { userModel, productModel, purchaseModel } = require("../db");
const{Router} = require('express');
const  { JWT_USER_PASSWORD } = require("../config");
const router = express.Router();
const { authenticateUser } = require("../AuthMiddleware/auth");



router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password: hashed
        });

        await newUser.save();
        res.status(201).json({ message: "You have registered" });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
);

router.post("/login", async (req, res) => {
    try{
        const{email, password} = req.body;
        const user =await userModel.findOne({email});   
        if(!user) return res.status(400).json({error : "invalid credentials"}); 
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({error : "invalid credentials"});
        const token = jwt.sign({id : user._id}, JWT_USER_PASSWORD);
        res.json({token});  
    }
    catch(error){
        res.status(500).json({error : error.message});
    }
}
);  

router.get("/products", authenticateUser,async (req, res) => {
    try {
        const products = await productModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/purchase", authenticateUser, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });}

        const purchase = new purchaseModel({
            userId,
            totalAmount: product.price * quantity, 
            purchaseDate: new Date(),
            products: [
                {
                    productId : productId, 
                    quantity : quantity,
                    price: product.price
                }
            ]
        });

        product.stock -= quantity;
        await purchase.save();
        await product.save();
        res.status(201).json({ message: "Purchase successful", purchase });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/purchases", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const purchases = await purchaseModel.find({ userId }).populate('productId');

        if (purchases.length === 0) return res.status(200).json({ message: "No purchases found", purchases: [] });

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile with addresses
router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
