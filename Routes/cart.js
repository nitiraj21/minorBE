const express = require("express");
const { cartModel, productModel } = require("../db");
const { authenticateUser } = require("../AuthMiddleware/auth"); 

const router = express.Router();


router.post("/add", authenticateUser, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        
        const product = await productModel.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({ userId, items: [] });
        }


        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        
        if (itemIndex > -1) {
           
            cart.items[itemIndex].quantity += quantity;
        } else {
            
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await cartModel.findOne({ userId }).populate("items.productId");

        if (!cart) return res.status(200).json({ message: "Cart is empty", items: [] });

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/remove/:productId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        let cart = await cartModel.findOne({ userId });
        if (!cart) return res.status(400).json({ error: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        await cart.save();
        res.status(200).json({ message: "Product removed from cart", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
