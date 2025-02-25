const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/ormconfig');

class Request extends Model {}

Request.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'Request',
    tableName: 'requests',
    timestamps: true,
  }
);

module.exports = { Request };
