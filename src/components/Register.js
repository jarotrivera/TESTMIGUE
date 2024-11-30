import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    nombreNegocio: '',
    correoNegocio: '', // Campo para el correo del negocio
    telefonoNegocio: '',
    direccionNegocio: '', // Campo para la dirección del negocio
    cargo: 'Dueño',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate();

  // Función para buscar direcciones en Nominatim
  const searchAddress = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/api/address?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error al buscar dirección:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Buscar direcciones solo si el campo de dirección cambia y tiene al menos 3 caracteres
    if (name === 'direccionNegocio' && value.length > 2) {
      searchAddress(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, direccionNegocio: suggestion.display_name });
    setSuggestions([]); // Limpia las sugerencias al seleccionar una
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu)$/;
    const passwordRegex = /^\S+$/;
    const phoneRegex = /^\d+$/;

    if (!nameRegex.test(formData.nombre)) {
      newErrors.nombre = 'El nombre solo puede contener letras y espacios.';
    }
    if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido. Debe terminar en .com, .org, .net o .edu.';
    }
    if (!passwordRegex.test(formData.contraseña) || formData.contraseña.length < 8) {
      newErrors.contraseña = 'La contraseña debe tener al menos 8 caracteres y no contener espacios.';
    }
    if (!phoneRegex.test(formData.telefono) || formData.telefono.length !== 9) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
    }
    if (!phoneRegex.test(formData.telefonoNegocio) || formData.telefonoNegocio.length !== 9) {
      newErrors.telefonoNegocio = 'El teléfono del negocio debe tener exactamente 9 dígitos.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setResponseMessage('Por favor, corrige los errores antes de continuar.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/panel-reservas');
    } catch (error) {
      console.error('Error al registrar:', error);

      // Mostrar mensaje específico si el correo o el nombre del negocio ya están en uso
      if (error.response && error.response.data.message) {
        setResponseMessage(error.response.data.message);
      } else {
        setResponseMessage('Error al registrar el usuario. Intenta de nuevo más tarde.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                ¡Crea Tu <span className="text-purple-500">Cuenta</span>!
              </h2>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre Completo"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}

              <input
                type="email"
                name="correo"
                placeholder="Correo Electrónico"
                value={formData.correo}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.correo && <p className="text-red-500">{errors.correo}</p>}

              <input
                type="password"
                name="contraseña"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.contraseña && <p className="text-red-500">{errors.contraseña}</p>}

              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.telefono && <p className="text-red-500">{errors.telefono}</p>}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                ¡Registra Tu <span className="text-purple-500">Negocio</span>!
              </h2>
              <input
                type="text"
                name="nombreNegocio"
                placeholder="Nombre del Negocio"
                value={formData.nombreNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.nombreNegocio && <p className="text-red-500">{errors.nombreNegocio}</p>}

              <input
                type="email"
                name="correoNegocio"
                placeholder="Correo del Negocio"
                value={formData.correoNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.correoNegocio && <p className="text-red-500">{errors.correoNegocio}</p>}

              <input
                type="text"
                name="direccionNegocio"
                placeholder="Dirección del Negocio"
                value={formData.direccionNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {suggestions.length > 0 && (
                <ul className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {errors.direccionNegocio && <p className="text-red-500">{errors.direccionNegocio}</p>}

              <input
                type="tel"
                name="telefonoNegocio"
                placeholder="Teléfono del Negocio"
                value={formData.telefonoNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.telefonoNegocio && <p className="text-red-500">{errors.telefonoNegocio}</p>}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition"
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-purple-500 hover:underline"
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </button>
          </div>
        </form>

        {responseMessage && (
          <div className="mt-4 text-center text-red-500">{responseMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Register;
