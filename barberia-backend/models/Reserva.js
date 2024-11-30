const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Negocio = require('./Negocio');
const EmpleadoNegocio = require('./EmpleadoNegocio');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  id_servicio: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  id_cliente: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Nuevos campos para almacenar el horario específico de la reserva
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  id_pago: {
    type: DataTypes.BIGINT,
  },
  comentario_cliente: {
    type: DataTypes.TEXT,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'reserva',
});

module.exports = Reserva;
