const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Negocio = require('./Negocio');

const Evento = sequelize.define('Evento', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true, // Categoría del evento (Ej. Cumpleaños, Tarea administrativa, etc.)
  },
  id_negocio: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Negocio, // Hace referencia al modelo Negocio
      key: 'id',
    },
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Usuario, // Hace referencia al modelo Usuario
      key: 'id',
    },
  },
}, {
  tableName: 'evento',
  timestamps: false,
});

module.exports = Evento;