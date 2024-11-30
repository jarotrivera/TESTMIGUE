import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/styles.css';

const CuentaCliente = ({ isOpen, closeModal, user, fetchUser }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [error] = useState(null);
  const [formData, setFormData] = useState({
    email_cliente: '',
    celular_cliente: '',
  });
  const [historial, setHistorial] = useState([]);

  // Manejar cambios en los campos de entrada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Guardar los cambios en el backend
  const handleSave = async () => {
    try {
        setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/clientes/me',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Datos actualizados correctamente');
      fetchUser(); // Recargar los datos del usuario
      setEditMode(false); // Salir del modo edición
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      toast.error('Error al actualizar los datos');
    }finally {
        setLoading(false); // Desactivar estado de carga
      }
  };

  // Cargar datos iniciales del usuario al abrir el modal
  useEffect(() => {
    if (user) {
      setFormData({
        email_cliente: user.email_cliente || '',
        celular_cliente: user.celular_cliente || '',
      });
      setLoading(false); // Only stop loading when user data is available
    }
  }, [user]);

  // Obtener el historial de reservas
  useEffect(() => {
    const fetchHistorialReservas = async () => {
      if (!user?.id) {
        console.warn('El usuario no está definido o no tiene un ID.');
        return;
      }
  
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No se encontró el token.');
        return;
      }
  
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clientes/historial/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setHistorial(response.data);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
        toast.error('No se pudo cargar el historial de reservas.');
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };
  
    if (isOpen) {
      setLoading(true);
      fetchHistorialReservas();
    }
  }, [isOpen, user]);
  

  // Asegurar que el modal esté abierto
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió un problema
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <p>{error}</p>
          <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-md shadow-lg">
        {/* Header del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Cuenta</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 p-2 text-center ${
              activeTab === 'personal' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-500'
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 p-2 text-center ${
              activeTab === 'history' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-500'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div>
          {activeTab === 'personal' && (
            <div>
              {editMode ? (
                <div>
                  <label className="block">
                    <strong>Correo:</strong>
                    <input
                      type="email"
                      name="email_cliente"
                      value={formData.email_cliente}
                      onChange={handleChange}
                      className="border rounded w-full p-2 mt-1"
                    />
                  </label>
                  <label className="block mt-4">
                    <strong>Celular:</strong>
                    <input
                      type="text"
                      name="celular_cliente"
                      value={formData.celular_cliente}
                      onChange={handleChange}
                      className="border rounded w-full p-2 mt-1"
                    />
                  </label>
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-purple-500 text-white px-4 py-2 rounded"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
                  <p><strong>Correo:</strong> {user?.email_cliente}</p>
                  <p><strong>Celular:</strong> {user?.celular_cliente}</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          )}

            {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Últimas 5 Reservas:</h3>
              {historial.length ? (
                <ul className="list-disc pl-5">
                  {historial.slice(0, 5).map((item, index) => (
                    <li key={index} className="mb-3">
                      <p><strong>Servicio:</strong> {item.servicio}</p>
                      <p><strong>Empleado:</strong> {item.empleado}</p>
                      <p><strong>Fecha:</strong> {item.fecha}</p>
                      <p><strong>Hora:</strong> {item.hora}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tienes reservas recientes.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuentaCliente;


  