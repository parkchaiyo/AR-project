
import sequelize from "./config/database.js";
import Product from "./models/product.js";

async function updateModelSizes() {
    try {
        await sequelize.authenticate();

        const sizes = [
            { id: 1, modelSize: 20 },
            { id: 2, modelSize: 200 },
            { id: 3, modelSize: 10 }
        ];

        for (const item of sizes) {
            const [updated] = await Product.update(
                { modelSize: item.modelSize },
                { where: { id: item.id } }
            );

            console.log(
                `Product ID ${item.id}: ${updated ? "Updated" : "Not found"}`
            );
        }

        const products = await Product.findAll({
            attributes: ["id", "name", "modelSize"],
            order: [["id", "ASC"]]
        });

        console.table(products.map(product => product.toJSON()));

    } catch (error) {
        console.error("Update failed:", error);
    } finally {
        await sequelize.close();
    }
}

updateModelSizes();
