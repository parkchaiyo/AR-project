
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT
    },

    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    image: {
        type: DataTypes.STRING
    },

    model3D: {
        type: DataTypes.STRING
    },

    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

export default Product;
