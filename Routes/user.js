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

// Update user profile information
router.put("/profile", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        
        // Make sure we don't update the password this way
        const updateData = {
            ...(name && { name }),
            ...(email && { email })
        };
        
        // Check if email already exists (if updating email)
        if (email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already in use" });
            }
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user password
router.put("/password", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new password are required" });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }
        
        // Hash new password
        const hashed = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        user.password = hashed;
        await user.save();
        
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new address
router.post("/address", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { address, city, state, pincode, country } = req.body;
        
        if (!address || !city || !state || !pincode || !country) {
            return res.status(400).json({ error: "All address fields are required" });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Add the new address
        user.addresses.push({
            address,
            city,
            state,
            pincode,
            country
        });
        
        await user.save();
        
        res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an address
router.put("/address/:addressId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const { address, city, state, pincode, country } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Find the address by its ID
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ error: "Address not found" });
        }
        
        // Update the address fields
        if (address) user.addresses[addressIndex].address = address;
        if (city) user.addresses[addressIndex].city = city;
        if (state) user.addresses[addressIndex].state = state;
        if (pincode) user.addresses[addressIndex].pincode = pincode;
        if (country) user.addresses[addressIndex].country = country;
        
        await user.save();
        
        res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an address
router.delete("/address/:addressId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Filter out the address to be deleted
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        
        await user.save();
        
        res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
