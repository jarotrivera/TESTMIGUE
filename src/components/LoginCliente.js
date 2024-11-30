import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = ({ closeModal, setAuth }) => {
  const [formData, setFormData] = useState({ correo: '', contraseña: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token en localStorage.');
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/clientes/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        // Guarda los datos del cliente en localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('¡Datos del usuario cargados correctamente!');
      } else {
        console.warn('La respuesta no contiene datos del cliente.');
      }
    } catch (error) {
      console.error('Error al obtener datos del cliente:', error);
      toast.error('No se pudieron cargar los datos del usuario.');
    }
  };

  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/clientes/loginc', formData);
      
      // Guardar el token
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Obtener datos del cliente inmediatamente
      const userResponse = await axios.get('http://localhost:5000/api/clientes/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Guardar los datos del cliente en localStorage
      const user = userResponse.data;
      localStorage.setItem('user', JSON.stringify(user));
      await fetchUser();

      // Actualizar el estado de autenticación
      setAuth(true);

      // Cerrar el modal
      closeModal();

      toast.success('¡Inicio de sesión exitoso!');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.response || error);
      setError('Credenciales inválidas.');
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };
  

  return (
    <form onSubmit={handleLogin} className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
      {error && <p className="text-red-500">{error}</p>}
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Correo</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleInputChange}
          className="border rounded w-full py-2 px-3"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Contraseña</label>
        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleInputChange}
          className="border rounded w-full py-2 px-3"
          required
        />
      </div>
      <div className="flex justify-between">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        <button type="button" onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default LoginForm;