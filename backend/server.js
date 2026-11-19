
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import sequelize from "./config/database.js";
import Product from "./models/product.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

// สร้างรายการสั่งซื้อแบบทดลอง
app.post("/api/orders", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "จำนวนสินค้าไม่ถูกต้อง"
            });
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                message: "ไม่พบสินค้า"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                message: "สินค้าไม่เพียงพอ"
            });
        }

        await product.decrement("stock", {
            by: quantity
        });

        res.status(201).json({
            message: "สั่งซื้อสินค้าสำเร็จ",
            product: product.name,
            quantity,
            total: product.price * quantity
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// เปิดใช้งานไฟล์ Frontend เมื่อ Build แล้ว
const frontendPath = path.resolve(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get("/{*splat}", (req, res, next) => {
    res.sendFile(
        path.join(frontendPath, "index.html"),
        (err) => {
            if (err) next();
        }
    );
});

// เชื่อมต่อ Database
async function startServer() {
    try {
        await sequelize.authenticate();

        await sequelize.sync({ alter: true });

        // เพิ่มสินค้าตัวอย่างเฉพาะเมื่อ Database ยังว่าง
        if (await Product.count() === 0) {
            await Product.bulkCreate([
                {
                    name: "Whale 3D Model",
                    description: "โมเดลวาฬ 3 มิติ สำหรับทดลองระบบ AR",
                    price: 590,
                    image: "/images/whale.jpg",
                    model3D: "/models/whale.glb",
                    stock: 10
                },
                {
                    name: "Space Model",
                    description: "โมเดลจำลองอวกาศ 3 มิติ",
                    price: 790,
                    image: "/images/space.jpg",
                    model3D: "/models/space.glb",
                    stock: 5
                },
                {
                    name: "Robot Model",
                    description: "โมเดลหุ่นยนต์ 3 มิติ",
                    price: 990,
                    image: "/images/robot.jpg",
                    model3D: "/models/robot.glb",
                    stock: 8
                }
            ]);
        }

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Backend: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Server Error:", error);
    }
}

startServer();
