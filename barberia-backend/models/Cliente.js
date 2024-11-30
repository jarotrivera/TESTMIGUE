const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email_cliente: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password_cliente: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  celular_cliente: {
    type: DataTypes.NUMERIC(9),
    allowNull: true,
  },
  comentario: {
    type: DataTypes.TEXT,
  },
  is_guest: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  token_recuperacion_cliente: {
    type: DataTypes.STRING(255),
  },
}, {
  timestamps: false,
  tableName: 'cliente',
});

module.exports = Cliente;
