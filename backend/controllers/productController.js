
import Product from "../models/product.js";

// แสดงสินค้าทั้งหมด
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();

        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// แสดงรายละเอียดสินค้า
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "ไม่พบสินค้า"
            });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// เพิ่มสินค้า
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// แก้ไขสินค้า
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "ไม่พบสินค้า"
            });
        }

        await product.update(req.body);

        res.json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// ลบสินค้า
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "ไม่พบสินค้า"
            });
        }

        await product.destroy();

        res.json({
            message: "ลบสินค้าสำเร็จ"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
