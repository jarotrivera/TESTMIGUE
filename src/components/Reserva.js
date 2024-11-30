import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Reserva = () => {
  const { negocioId, servicioId, horarioId } = useParams();
  const navigate = useNavigate();
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [modalOpen, setModalOpen] = useState(true);
  const [formError, setFormError] = useState('');
  const [clienteInfo, setClienteInfo] = useState({ nombre: '', telefono: '', correo: '' });
  const [selectedEmpleado, setSelectedEmpleado] = useState('');

  const cargarEmpleados = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/empleados?negocioId=${negocioId}&servicioId=${servicioId}`);
      setEmpleadosDisponibles(response.data);
    } catch (error) {
      console.error('Error al cargar empleados disponibles:', error);
    }
  }, [negocioId, servicioId]);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const cerrarModalReserva = () => {
    setModalOpen(false);
    setFormError('');
    setClienteInfo({ nombre: '', telefono: '', correo: '' });
    navigate(`/negocio/${negocioId}`);
  };

  const validarFormulario = () => {
    if (!clienteInfo.nombre.trim() || !clienteInfo.telefono.trim() || !clienteInfo.correo.trim() || !selectedEmpleado) {
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
        id_horario: horarioId,
        id_empleado: selectedEmpleado,
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

  return (
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
              value={selectedEmpleado}
              onChange={(e) => setSelectedEmpleado(e.target.value)}
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
  );
};

export default Reserva;

