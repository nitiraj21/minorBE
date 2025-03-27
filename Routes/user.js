const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
        const token = jwt.sign({id : user._id}, process.env.JWT_USER_PASSWORD);
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

module.exports = router;
