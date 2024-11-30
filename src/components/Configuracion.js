import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FcSms, FcSupport } from 'react-icons/fc';

const Configuracion = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contraseñaActual: '',
    nuevaContraseña: '',
    foto_perfil: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData((prevData) => ({
        ...prevData,
        nombre: response.data.nombre,
        correo: response.data.correo,
        telefono: response.data.telefono,
        foto_perfil: response.data.foto_perfil
      }));
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  };

  // Llama a fetchUserData al montar el componente
  useEffect(() => {
    fetchUserData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.match(/^[a-zA-Z\s]+$/)) {
      newErrors.nombre = 'El nombre solo debe contener letras y espacios.';
    }
    if (!formData.correo.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.correo = 'Ingrese un correo electrónico válido.';
    }
    if (!formData.telefono.match(/^\d{9}$/)) {
      newErrors.telefono = 'El teléfono debe contener 9 dígitos.';
    }
    if (formData.nuevaContraseña) {
      if (formData.nuevaContraseña.length < 8) {
        newErrors.nuevaContraseña = 'La nueva contraseña debe tener al menos 8 caracteres.';
      }
      if (!formData.contraseñaActual) {
        newErrors.contraseñaActual = 'Debe ingresar su contraseña actual para cambiarla.';
      }
      if (formData.contraseñaActual === formData.nuevaContraseña) {
        newErrors.nuevaContraseña = 'La nueva contraseña no debe ser igual a la contraseña actual.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;

    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const updateData = {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
      };
      if (formData.nuevaContraseña) {
        updateData.contraseñaActual = formData.contraseñaActual;
        updateData.nuevaContraseña = formData.nuevaContraseña;
      }

      await axios.put('http://localhost:5000/api/users/update', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Datos actualizados correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      setServerError('Error al actualizar los datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profileImage', profileImage);

    try {
      const response = await axios.post('http://localhost:5000/api/users/upload-profile-image', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage('Foto de perfil actualizada correctamente');

      // Actualiza el estado con la URL de la nueva imagen y vuelve a cargar los datos del usuario
      setFormData((prevData) => ({
        ...prevData,
        foto_perfil: response.data.profileImage
      }));
      setProfileImage(null);
      fetchUserData(); // Vuelve a cargar los datos para asegurarse de que la imagen es correcta
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setServerError('Error al subir la imagen: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Configuración</h2>

      <div onClick={() => setShowEditPopup(true)} className="cursor-pointer flex items-center space-x-4 p-4 bg-gray-100 rounded-md mb-6">
        {formData.foto_perfil ? (
          <img 
            src={formData.foto_perfil} 
            alt="Foto de perfil"
            className="h-12 w-12 rounded-full object-cover" 
          />
        ) : (
          <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-700">
              {formData.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-800">{formData.nombre}</h3>
          <p className="text-sm text-gray-500">Edita tu perfil</p>
        </div>
      </div>
      <Link to="/notificaciones" className="cursor-pointer flex items-center space-x-4 p-4 bg-gray-100 rounded-md mb-6">
        <div className="h-12 w-12 flex items-center justify-center">
          <FcSms className="text-4xl" /> {/* Icono de Notificaciones */}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">Notificaciones</h3>
        </div>
      </Link>

      <Link to="/soporte" className="cursor-pointer flex items-center space-x-4 p-4 bg-gray-100 rounded-md mb-6">
        <div className="h-12 w-12 flex items-center justify-center">
          <FcSupport className="text-4xl" /> {/* Icono de Soporte */}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">Soporte</h3>
        </div>
      </Link>

      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Configuración de Usuario</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-gray-700">Correo:</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.correo && <p className="text-red-500 text-sm">{errors.correo}</p>}
              </div>

              <div>
                <label className="block text-gray-700">Teléfono:</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
              </div>

              <div>
                <label className="block text-gray-700">Contraseña Actual:</label>
                <input
                  type="password"
                  name="contraseñaActual"
                  value={formData.contraseñaActual}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.contraseñaActual && <p className="text-red-500 text-sm">{errors.contraseñaActual}</p>}
              </div>

              <div>
                <label className="block text-gray-700">Nueva Contraseña:</label>
                <input
                  type="password"
                  name="nuevaContraseña"
                  value={formData.nuevaContraseña}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.nuevaContraseña && <p className="text-red-500 text-sm">{errors.nuevaContraseña}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </form>

            <h3 className="text-lg font-semibold mt-6 mb-2">Actualizar Foto de Perfil</h3>
            <input type="file" onChange={handleImageChange} className="mb-4"/>
            <button
              onClick={handleImageUpload}
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300"
            >
              Guardar Foto
            </button>

            <button
              onClick={() => setShowEditPopup(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="text-green-500 text-sm text-center mt-4">{successMessage}</p>
      )}
      {serverError && (
        <p className="text-red-500 text-sm text-center mt-4">{serverError}</p>
      )}
    </div>
  );
};

export default Configuracion;
