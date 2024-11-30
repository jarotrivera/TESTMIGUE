import React, { useState } from "react";
import axios from "axios";

const RegistroCliente = ({ closeModal, setAuth }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email_cliente: "",
    password_cliente: "",
    celular_cliente: "",
  });

  const [successMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/clientes/register', formData);

      // Guarda el token en localStorage
      localStorage.setItem('token', response.data.token);

      // Actualiza el estado de autenticación
      setAuth(true);

      // Cierra el modal después del registro
      closeModal();
    } catch (error) {
      console.error('Error al registrar el cliente:', error);
      setErrorMessage(error.response?.data?.message || 'Ocurrió un error.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] max-h-[80vh] bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Registro de Cliente</h2>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email_cliente" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email_cliente"
              name="email_cliente"
              value={formData.email_cliente}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password_cliente" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password_cliente"
              name="password_cliente"
              value={formData.password_cliente}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="celular_cliente" className="block text-sm font-medium text-gray-700">
              Celular
            </label>
            <input
              type="text"
              id="celular_cliente"
              name="celular_cliente"
              value={formData.celular_cliente}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Registrar
          </button>
        </form>
        <button
          type="button"
          onClick={closeModal}
          className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RegistroCliente;


