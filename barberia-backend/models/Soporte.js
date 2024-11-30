// archivo: models/Soporte.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Negocio = require('./Negocio'); // Asegúrate de tener el modelo Negocio

class Soporte extends Model {}

Soporte.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    id_negocio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Negocio,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    cargo: {
      type: DataTypes.STRING(50),  
    },
    asunto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      allowNull: false,
      defaultValue: 'media', 
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'resuelto'),
      defaultValue: 'pendiente',
    },
    respuesta: {
      type: DataTypes.TEXT,
      allowNull: true, // Solo se completará cuando el soporte responda
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true, // Ruta o nombre de archivo de la imagen subida
    },
    creado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    actualizado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Soporte',
    tableName: 'soporte',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  }
);

module.exports = Soporte;
