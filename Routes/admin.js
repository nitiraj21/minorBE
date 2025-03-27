const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const  { JWT_ADMIN_PASSWORD } = require("../config");
const { adminModel, productModel } = require("../db");
const { authenticateAdmin } = require("../AuthMiddleware/auth");


const router = express.Router();


router.post("/register", async(req, res) =>{
    try{
        const {name, email, password,} = req.body;

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

        const token = jwt.sign({id : admin._id, isAdmin : true},process.env.JWT_ADMIN_PASSWORD);

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


module.exports = router;
