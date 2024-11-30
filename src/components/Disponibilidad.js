import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Disponibilidad = () => {
  const { negocioId, servicioId } = useParams();
  const [horarios, setHorarios] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [formError, setFormError] = useState('');
  const [clienteInfo, setClienteInfo] = useState({ nombre: '', telefono: '', correo: '' });

  const cargarHorarios = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/horarios/${negocioId}`);
      setHorarios(response.data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  }, [negocioId]);

  const cargarEmpleados = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/empleados?negocioId=${negocioId}&servicioId=${servicioId}`);
      setEmpleadosDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar empleados disponibles:', error);
    }
  }, [negocioId, servicioId]);

  useEffect(() => {
    cargarHorarios();
    cargarEmpleados();
  }, [cargarHorarios, cargarEmpleados]);

  const abrirModalReserva = (horario) => {
    setSelectedHorario(horario);
    setModalOpen(true);
  };

  const cerrarModalReserva = () => {
    setModalOpen(false);
    setFormError('');
    setClienteInfo({ nombre: '', telefono: '', correo: '' });
  };

  const validarFormulario = () => {
    if (!clienteInfo.nombre.trim() || !clienteInfo.telefono.trim() || !clienteInfo.correo.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return false;
    }
    return true;
  };

  const confirmarReserva = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      const reserva = {
        id_servicio: servicioId,
        id_negocio: negocioId,
        fecha: selectedHorario.fecha,
        hora: selectedHorario.hora,
        cliente: clienteInfo,
      };
      await axios.post('http://localhost:5000/api/reservas', reserva);
      alert('Reserva confirmada con éxito.');
      cerrarModalReserva();
    } catch (error) {
      console.error('Error al confirmar la reserva:', error);
      setFormError('No se pudo completar la reserva. Inténtelo de nuevo.');
    }
  };

  const handleHorarioSelect = (horario) => {
    abrirModalReserva(horario);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Disponibilidad de Horarios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {horarios.map((horario) => (
          <div key={horario.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-2">{format(new Date(horario.fecha), 'dd/MM/yyyy')}</h3>
            <p>Hora: {horario.hora_inicio} - {horario.hora_fin}</p>
            <button
              onClick={() => handleHorarioSelect(horario)}
              className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Reservar
            </button>
          </div>
        ))}
      </div>

      {/* Modal para confirmar reserva */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={cerrarModalReserva}
        contentLabel="Confirmar Reserva"
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
          <h3 className="text-2xl font-bold mb-4">Confirmar Reserva</h3>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Nombre del Cliente:</label>
              <input
                type="text"
                value={clienteInfo.nombre}
                onChange={(e) => setClienteInfo({ ...clienteInfo, nombre: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Teléfono:</label>
              <input
                type="text"
                value={clienteInfo.telefono}
                onChange={(e) => setClienteInfo({ ...clienteInfo, telefono: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Correo Electrónico:</label>
              <input
                type="email"
                value={clienteInfo.correo}
                onChange={(e) => setClienteInfo({ ...clienteInfo, correo: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Empleado Disponible:</label>
              <select
                value={selectedHorario?.empleadoId || ''}
                onChange={(e) => setSelectedHorario({ ...selectedHorario, empleadoId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un empleado</option>
                {empleadosDisponibles.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
              </select>
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={cerrarModalReserva}
              className="mr-4 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarReserva}
              className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
            >
              Confirmar Reserva
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Disponibilidad;



