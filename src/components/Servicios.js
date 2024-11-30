import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcMinus, FcPlus  } from "react-icons/fc";

const Servicios = () => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    categoria: '',
    id_empleados: [],
    id_negocio: null,
  });
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const [ setUser] = useState({ nombre: '', correo: '', id_negocio: null });

   // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  
    axios
      .get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Usuario autenticado:', response.data);
        setUser(response.data);
  
        const negocio = response.data.negocio;
        if (negocio && negocio.id) {
          console.log('Cargando datos para el negocio:', negocio.id);
          setForm((prevForm) => ({ ...prevForm, id_negocio: negocio.id }));
          cargarServicios(negocio.id);
          cargarEmpleados(negocio.id);
        } else {
          console.error('El usuario no tiene un negocio asociado:', negocio);
          alert('No se encontró un negocio asociado. Verifica tus datos.');
        }
      })
      .catch((error) => {
        console.error('Error al obtener el usuario:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate,]);

  const cargarServicios = async (id_negocio) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/api/servicios/negocio/${id_negocio}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const cargarEmpleados = async (id_negocio) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/api/empleados/negocio/${id_negocio}/empleados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Manejar selección de empleados
  const handleEmpleadoSelect = (e) => {
    const empleadoId = parseInt(e.target.value);
    setForm((prevForm) => {
      const nuevosEmpleados = prevForm.id_empleados.includes(empleadoId)
        ? prevForm.id_empleados.filter((id) => id !== empleadoId)
        : [...prevForm.id_empleados, empleadoId];
      return { ...prevForm, id_empleados: nuevosEmpleados };
    });
  };

  // Crear o actualizar un servicio
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const nombreRegex = /^[a-zA-ZñÑ\s]{1,20}$/;
    const descripcionRegex = /^[a-zA-ZñÑ\s]{1,100}$/;
    const precioRegex = /^[0-9]+$/;
    const categoriaRegex = /^[a-zA-ZñÑ\s]+$/;

    if (!nombreRegex.test(form.nombre)) {
      alert('El nombre solo puede contener letras, con un máximo de 20 caracteres.');
      return;
    }
    if (!descripcionRegex.test(form.descripcion)) {
      alert('La descripción solo puede contener letras, con un máximo de 100 caracteres.');
      return;
    }
    if (!precioRegex.test(form.precio) || form.precio < 1000 || form.precio > 100000) {
      alert('El precio solo puede contener números, y debe estar entre 1000 y 100000.');
      return;
    }
    if (!categoriaRegex.test(form.categoria)) {
      alert('La categoría solo puede contener letras, sin caracteres especiales ni números.');
      return;
    }
    if (form.id_empleados.length === 0) {
      alert('Debe seleccionar al menos un empleado para el servicio.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const url = editingId
        ? `http://localhost:5000/api/servicios/${editingId}`
        : 'http://localhost:5000/api/servicios';
      const method = editingId ? 'put' : 'post';
      await axios[method](
        url,
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          duracion: parseInt(form.duracion, 10),
          precio: parseFloat(form.precio),
          categoria: form.categoria,
          id_negocio: form.id_negocio,
          id_empleados: form.id_empleados,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      cargarServicios(form.id_negocio);
      setForm({
        nombre: '',
        descripcion: '',
        duracion: '',
        precio: '',
        categoria: '',
        id_empleados: [],
        id_negocio: form.id_negocio,
      });
      setEditingId(null); // Restablece el modo de edición
      toast.success('¡Servicio guardado correctamente!',{
        icon: FcPlus ,
      });

    } catch (error) {
      toast.error('Error al guardar el servicio. Inténtalo nuevamente.');
    }
  };

  // Cargar datos en el formulario para edición
  const handleEdit = (servicio) => {
    setEditingId(servicio.id);
    setForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      categoria: servicio.categoria,
      id_empleados: servicio.empleados ? servicio.empleados.map((empleado) => empleado.id) : [],
      id_negocio: form.id_negocio,
    });
  };

  // Eliminar un servicio
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/servicios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Eliminar el servicio de la lista sin recargar todos los servicios
      setServicios((prevServicios) => prevServicios.filter(servicio => servicio.id !== id));
      toast.success("Servicio eliminado correctamente", {
        icon: FcMinus,
      });

    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
    }
  };
  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <ToastContainer position="top-center" autoClose={5000} />
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Gestión de Servicios</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre del Servicio</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del Servicio"
            required
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción del Servicio"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
            <select
              name="duracion"
              value={form.duracion}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Seleccionar duración</option>
              <option value="30">30 minutos</option>
              <option value="60">60 minutos</option>
              <option value="120">120 minutos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="Precio"
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <input
            type="text"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder="Categoría"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">Empleados Disponibles</h3>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleados.map((empleado) => (
            <label key={empleado.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md shadow hover:bg-gray-100">
              <input
                type="checkbox"
                value={empleado.id}
                checked={form.id_empleados.includes(empleado.id)}
                onChange={handleEmpleadoSelect}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                  {empleado.foto_perfil ? (
                    <img src={empleado.foto_perfil} alt={`${empleado.nombre}`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500">👤</span>
                  )}
                </div>
                <span className="text-gray-800 font-medium">{empleado.nombre}</span>
              </div>
            </label>
          ))}
        </div>
        
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600">
          {editingId ? 'Actualizar Servicio' : 'Crear Servicio'}
        </button>
      </form>

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Lista de Servicios</h3>
      <ul className="space-y-4">
        {servicios.map((servicio) => (
          <li key={servicio.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-800">{servicio.nombre}</h4>
                <p className="text-gray-600">{servicio.descripcion}</p>
                <p className="text-sm text-gray-500">
                  <strong>Duración:</strong> {servicio.duracion} min &nbsp; | &nbsp;
                  <strong>Precio:</strong> ${servicio.precio}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Empleados:</strong> {servicio.empleados && servicio.empleados.length > 0
                    ? servicio.empleados.map((empleado) => empleado.nombre).join(', ')
                    : 'Ninguno'}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Categoría:</strong> {servicio.categoria}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(servicio)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(servicio.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Servicios;