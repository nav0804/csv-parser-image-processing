const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/ormconfig');
const { Request } = require('./Request');

class Product extends Model {}

Product.init(
  {
    serialNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestId: {
      type: DataTypes.UUID,
      references: {
        model: Request,
        key: 'id',
      },
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inputImageUrls: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    outputImageUrls: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  }
);

module.exports = { Product };
