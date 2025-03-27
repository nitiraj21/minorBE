
const express = require('express');
const router = express.Router();
const { productModel } = require('../db'); 




router.get('/', async (req, res) => {
  try{
    const {type} = req.query;
    let filter = {};
    if(type){
      filter.type = type.toUpperCase();
    }
    const products = await productModel.find(filter);

    res.json(products);
  }
  catch(err){
    res.status(500).json({message: err.message});
  }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const product = new productModel(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
});

module.exports = router;