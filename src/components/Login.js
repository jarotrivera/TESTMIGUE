import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import fondo from '../assets/images/fondo.png';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Nuevo estado para manejar el botón


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        correo,
        contraseña,
      });
  
      const { token } = response.data;
  
      // Almacenar el token en localStorage
      localStorage.setItem('token', token);
      
      // Decodificar el token para obtener el cargo y otros datos del usuario
      const decoded = jwtDecode(token);
      const { id, cargo, nombre } = decoded;

      // Verifica que el cargo esté disponible en el token decodificado
      if (!cargo) {
        setError('Cargo no encontrado en el token de autenticación.');
        return;
      }

      // Almacenar los datos del usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify({ id, nombre, cargo }));
      localStorage.setItem('cargo', cargo);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirigir inmediatamente después del login según el cargo
      if (cargo === 'Dueño') {
        navigate('/cuenta'); // Dueño ve la vista de cuenta
      } else if (cargo === 'Empleado') {
        navigate('/ServiciosEmp'); // Empleado ve el panel de servicios
      } else if (cargo === 'Soporte') {
        console.log('Redirigiendo a /TicketsSoporte');
        navigate('/TicketsSoporte');
      } else {
        setError('Cargo no reconocido.');
      }
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false); // Reactiva el botón después de la solicitud
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="bg-white bg-opacity-50 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="correo" className="block text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contraseña" className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
        </form>
        <div className="mt-4 text-center">
          <p>¿No tienes una cuenta? <Link to="/register" className="text-blue-500">Regístrate</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;


