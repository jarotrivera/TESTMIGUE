const Usuario = require('./Usuario');
const Negocio = require('./Negocio');
const Servicio = require('./Servicio');
const HorarioNegocio = require('./HorarioNegocio');
const DisponibilidadEmpleado = require('./DisponibilidadEmpleado');
const EmpleadoNegocio = require('./EmpleadoNegocio');
const Reserva = require('./Reserva');
const DuenoNegocio = require('./DuenoNegocio');
const Pago = require('./Pago');
const Cliente = require('./Cliente');
const Evento = require('./Evento');
const EmpleadoServicio = require('./EmpleadoServicio');
const Soporte = require('./Soporte');

// Asociación: Un Usuario tiene un Negocio (Dueño)
Usuario.hasOne(Negocio, { foreignKey: 'id_dueno', as: 'negocio' });
Negocio.belongsTo(Usuario, { foreignKey: 'id_dueno', as: 'dueno' });

// Asociación: Un Negocio tiene muchos Servicios
Negocio.hasMany(Servicio, { foreignKey: 'id_negocio', as: 'servicios' });
Servicio.belongsTo(Negocio, { foreignKey: 'id_negocio' });

// Asociación: Un Negocio tiene muchos Horarios
Negocio.hasMany(HorarioNegocio, { foreignKey: 'id_negocio', as: 'horarios' });
HorarioNegocio.belongsTo(Negocio, { foreignKey: 'id_negocio', as: 'negocio' });

// Asociación: Un Usuario tiene Disponibilidad de Empleado (id_usuario)
Usuario.hasMany(DisponibilidadEmpleado, { foreignKey: 'id_usuario', as: 'disponibilidades' });
DisponibilidadEmpleado.belongsTo(Usuario, { foreignKey: 'id_usuario' });

EmpleadoNegocio.hasMany(DisponibilidadEmpleado, { foreignKey: 'id_usuario', sourceKey: 'id_usuario', as: 'disponibilidades' });
DisponibilidadEmpleado.belongsTo(EmpleadoNegocio, { foreignKey: 'id_usuario', targetKey: 'id_usuario', as: 'empleado' });

// Asociación: Un Negocio tiene muchos Empleados
Negocio.hasMany(EmpleadoNegocio, { foreignKey: 'id_negocio', as: 'empleados' });
EmpleadoNegocio.belongsTo(Negocio, { foreignKey: 'id_negocio' });

// Asociación: Un Usuario pertenece a muchos Negocios (Dueño a través de DuenoNegocio)
Usuario.belongsToMany(Negocio, { through: DuenoNegocio, as: 'negocios', foreignKey: 'id_usuario' });
Negocio.belongsToMany(Usuario, { through: DuenoNegocio, as: 'duenos', foreignKey: 'id_negocio' });

// Asociacion para traer tabla empleados en reserva.
Usuario.hasMany(EmpleadoNegocio, { foreignKey: 'id_usuario' });
EmpleadoNegocio.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Asociación: Un Servicio puede tener muchas Reservas
Servicio.hasMany(Reserva, { foreignKey: 'id_servicio', as: 'reservasServicio' });
Reserva.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

// Asociación: Un Cliente puede tener muchas Reservas (tabla Cliente)
Cliente.hasMany(Reserva, { foreignKey: 'id_cliente', as: 'reservasCliente' });
Reserva.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Asociación: Un Negocio tiene muchas Reservas
Negocio.hasMany(Reserva, { foreignKey: 'id_negocio', as: 'reservas' });
Reserva.belongsTo(Negocio, { foreignKey: 'id_negocio' });

// Asociación: Un Empleado puede estar en muchas Reservas
EmpleadoNegocio.hasMany(Reserva, { foreignKey: 'id_empleado', as: 'reservasEmpleado' });
Reserva.belongsTo(EmpleadoNegocio, { foreignKey: 'id_empleado', as: 'empleadoNegocio'  });

// Asociación: Un Usuario puede tener muchas Reservas (si es empleado)
Usuario.hasMany(Reserva, { foreignKey: 'id_empleado', as: 'reservasUsuario' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_empleado', as: 'empleadoUsuario' });

// Asociación: Un Pago está asociado a una Reserva
Reserva.hasOne(Pago, { foreignKey: 'id_reserva', as: 'pago' });
Pago.belongsTo(Reserva, { foreignKey: 'id_reserva' });

// Usuario también puede tener muchas Reservas (si es cliente o hace la reserva)
Usuario.hasMany(Reserva, { foreignKey: 'id_cliente', as: 'reservas' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_cliente' });


// Asociación Un Negocio tiene muchos Eventos (calendario compartido)
Negocio.hasMany(Evento, { foreignKey: 'id_negocio', as: 'eventos' });
Evento.belongsTo(Negocio, { foreignKey: 'id_negocio', as: 'negocio' });

// Asociación Un Usuario crea múltiples Eventos
Usuario.hasMany(Evento, { foreignKey: 'id_usuario', as: 'eventosCreados' });
Evento.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'creador' });

// Asociación: Relación entre Servicio y Empleado a través de EmpleadoServicio
// associations.js

Servicio.belongsToMany(Usuario, {
  through: EmpleadoServicio,
  foreignKey: 'id_servicio',
  otherKey: 'id_empleado', 
  as: 'empleados'
});

Usuario.belongsToMany(Servicio, {
  through: EmpleadoServicio,
  foreignKey: 'id_empleado', 
  otherKey: 'id_servicio',
  as: 'servicios'
});

Usuario.belongsToMany(Negocio, {
  through: EmpleadoNegocio,
  foreignKey: 'id_empleado',
  otherKey: 'id_negocio',
  as: 'empleadoNegocio'
});

Negocio.belongsToMany(Usuario, {
  through: EmpleadoNegocio,
  foreignKey: 'id_negocio',
  otherKey: 'id_empleado',
  as: 'empleadosNegocio'
});

// Un Usuario tiene muchas Solicitudes de Soporte
Usuario.hasMany(Soporte, { foreignKey: 'id_usuario', as: 'solicitudesSoporte' });
Soporte.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'creadorSoporte' }); 

// Un Negocio tiene muchas Solicitudes de Soporte
Negocio.hasMany(Soporte, { foreignKey: 'id_negocio', as: 'solicitudesNegocio' });
Soporte.belongsTo(Negocio, { foreignKey: 'id_negocio', as: 'negocioSoporte' });



module.exports = {
  Usuario,
  Negocio,
  Servicio,
  HorarioNegocio,
  DisponibilidadEmpleado,
  EmpleadoNegocio,
  Cliente,
  DuenoNegocio,
  Reserva,
  Pago,
  Evento,
  EmpleadoServicio,
  Soporte,
};