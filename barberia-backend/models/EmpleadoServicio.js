// models/EmpleadoServicio.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmpleadoServicio = sequelize.define('EmpleadoServicio', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_empleado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'EmpleadoNegocios', // Nombre de la tabla con la que se relaciona
      key: 'id',
    },
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Servicios', // Nombre de la tabla con la que se relaciona
      key: 'id',
    },
  },
}, {
  tableName: 'EmpleadoServicio',
  timestamps: false,
});

module.exports = EmpleadoServicio;
