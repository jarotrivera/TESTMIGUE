import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import fondo1 from '../assets/images/fondo1.png';
import LoginForm from './LoginCliente';
import AccountModal from './CuentaClient';
import RegistroCliente from './RegistroCliente';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const VistaCliente = () => {
  const { nombre } = useParams(); // Obtener el nombre del negocio desde la URL
  const navigate = useNavigate(); // Hook para la navegación
  const [negocio, setNegocio] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [modalLoginOpen, setModalLoginOpen] = useState(false);
  const [modalRegisterOpen, setModalRegisterOpen] = useState(false);
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [history] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Función para obtener información del negocio, servicios y horarios
    const fetchData = async () => {
      try {
        // Obtener el negocio por su nombre
        const responseNegocio = await axios.get(`http://localhost:5000/api/negocios/${nombre}`);
        setNegocio(responseNegocio.data);

        // Guardar `negocioId` en `sessionStorage` para uso en otros componentes
        sessionStorage.setItem('negocioSeleccionado', responseNegocio.data.id);

        // Guardar `negocioId` en `sessionStorage` para uso en otros componentes
        sessionStorage.setItem('negocioSeleccionado', responseNegocio.data.id);

        const negocioId = responseNegocio.data.id;

        // Realizar las solicitudes de servicios y horarios en paralelo
        const [responseServicios, responseHorarios] = await Promise.all([
          axios.get(`http://localhost:5000/api/servicios/negocio/${negocioId}`),
          axios.get(`http://localhost:5000/api/horarios/negocio/${negocioId}`)
        ]);

        // Establecer los servicios y horarios en el estado
        setServicios(responseServicios.data);
        setHorarios(responseHorarios.data);

        setLoading(false);
      } catch (error) {
        setError('Negocio en creacion');
        setLoading(false);
      }
    };
    fetchData();
  }, [nombre]);
  
  const handleOpenLoginModal = () => {
    setModalLoginOpen(true);
  };

  const handleCloseLoginModal = () => {
    setModalLoginOpen(false);
  };

  const handleOpenRegisterModal = () => {
    setModalRegisterOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setModalRegisterOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    window.location.reload();
  };
  

  
  useEffect(() => {
    const syncAuthAndFetchUser = async () => {
      const token = localStorage.getItem('token');
      const userFromStorage = localStorage.getItem('user');
    
      // Cargar usuario desde localStorage si ya existe
      if (userFromStorage) {
        try {
          setUser(JSON.parse(userFromStorage)); // Actualizar estado con datos almacenados
          console.log('Usuario cargado desde localStorage:', userFromStorage);
        } catch (error) {
          console.error('Error al cargar el usuario desde localStorage:', error);
        }
      }
    
      if (token) {
        setAuth(true); // Usuario autenticado
        try {
          // Solo realiza la solicitud al servidor si el usuario no está en localStorage
          const response = await axios.get('http://localhost:5000/api/clientes/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (response.data) {
            console.log('Datos del usuario obtenidos del servidor:', response.data);
            setUser(response.data); // Actualiza el estado del usuario
            localStorage.setItem('user', JSON.stringify(response.data)); // Sincronizar localStorage
          } else {
            console.warn('La respuesta no contiene datos del usuario.');
          }
        } catch (error) {
          console.error('Error al obtener datos del cliente desde el servidor:', error);
          toast.error('No se pudieron cargar los datos del usuario desde el servidor.');
          setAuth(false); // Desactivar autenticación en caso de error
        }
      } else {
        console.warn('No se encontró el token en localStorage. Cerrando sesión.');
        setAuth(false); // Usuario no autenticado
      }
    };
  
    syncAuthAndFetchUser();
  
    const handleStorageChange = (event) => {
      if (event.key === 'user' || event.key === 'token') {
        syncAuthAndFetchUser(); // Re-sincronizar si algo cambia en localStorage
      }
    };
  
    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange); // Limpiar listener al desmontar
    };
  }, []);
  

  useEffect(() => {
    const fetchNegocios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/negocios/completos');
        const negociosFiltrados = response.data.filter(negocio => 
          negocio.nombre && negocio.telefono && negocio.direccion && negocio.categoria
        );
        setNegocios(negociosFiltrados);
      } catch (error) {
        console.error('Error al obtener negocios:', error);
        toast.error('No se pudieron cargar los negocios.');
      }
    };

    fetchNegocios();
  }, []);

  const handleNegocioClick = (nombre) => {
    navigate(`/negocio/${nombre}`);
  };
  
  const openModal = () => {
    if (user) {
      setModalOpen(true);
    } else {
      toast.error('Los datos del usuario no están cargados.');
    }
  };

  
  const seleccionarServicio = (servicio) => {
    sessionStorage.setItem('servicioSeleccionado', servicio.id); // Guardar el ID del servicio en sessionStorage
    sessionStorage.setItem('servicioSeleccionadoNombre', servicio.nombre);
    navigate('/pregunta-preferencia'); // Navegar a PreguntaPreferencia.js
  };

  useEffect(() => {
    console.log('Token en localStorage:', localStorage.getItem('token'));
    console.log('Usuario en localStorage:', localStorage.getItem('user'));
    console.log('Estado de auth:', auth);
    console.log('Estado de user:', user);
  }, [auth, user]);

  const serviciosFiltrados = filtroCategoria
    ? servicios.filter(servicio => servicio.categoria === filtroCategoria)
    : servicios;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }
  

  return (
    <div className="container mx-auto p-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-800 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Vista Cliente</h1>
  
        {/* Menú de Negocios */}
        <div className="relative">
          <button
            className="bg-gray-500 px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
            onClick={() => setMenuOpen(!menuOpen)} // Alternar el estado del menú
          >
            Negocios
          </button>
          {menuOpen && (
            <div
              className="absolute bg-white text-black rounded-md shadow-lg mt-2 w-64 z-50"
              onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic dentro del menú
            >
              <ul className="divide-y divide-gray-200">
                {negocios.length > 0 ? (
                  negocios.map((negocio) => (
                    <li
                      key={negocio.id}
                      onClick={() => handleNegocioClick(negocio.nombre)}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {negocio.nombre}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No hay negocios disponibles</li>
                )}
              </ul>
            </div>
          )}
        </div>
  
        {/* Botones de Autenticación */}
        <div className="flex items-center space-x-4">
          {auth ? (
            <>
              <ToastContainer position="top-center" autoClose={5000} />
              <button
                onClick={openModal}
                className="bg-gray-500 px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
              >
                Cuenta
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleOpenLoginModal}
                className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Login
              </button>
              <button
                onClick={handleOpenRegisterModal}
                className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>
  
      <div className="mb-6">
        <img src={fondo1} alt="Banner" className="w-full object-cover h-64 rounded-lg shadow-md" />
      </div>
  
      {/* Selección de Categoría */}
      <div className="mb-4">
        <label className="text-gray-700 font-semibold mr-2">Filtrar por categoría:</label>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="border-gray-300 rounded-md p-2"
        >
          <option value="">Todas</option>
          {[...new Set(servicios.map((servicio) => servicio.categoria))].map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>
  
      {/* Parte principal de la vista */}
      <div className="flex gap-6">
        <div className="flex-grow bg-white shadow-md rounded-md p-6">
          {/* Encabezado del negocio */}
          <div className="flex items-center mb-6">
            <img
              src={negocio.logo}
              alt="Logo del negocio"
              className="w-24 h-24 rounded-full mr-4 object-cover shadow-md"
            />
            <h2 className="text-3xl font-bold text-gray-800">{negocio.nombre}</h2>
          </div>
  
          {/* Servicios del negocio */}
          <div className="mt-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviciosFiltrados.map((servicio) => (
                <div
                  key={servicio.id}
                  className="bg-[#3b3b3b] text-white p-6 rounded-md shadow-lg transform hover:scale-105 transition-transform duration-300"
                >
                  <h4 className="text-xl font-bold mb-2">{servicio.nombre}</h4>
                  <p className="mb-2"><strong>Duración:</strong> {servicio.duracion} minutos</p>
                  <p className="mb-2"><strong>Precio:</strong> ${servicio.precio}</p>
                  <p className="mb-4"><strong>Categoría:</strong> {servicio.categoria}</p>
                  <button
                    onClick={() => seleccionarServicio(servicio)}
                    className="bg-[#855bff] text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
                  >
                    Seleccionar Servicio
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Información detallada del negocio */}
        <div className="w-96 bg-white shadow-md rounded-md p-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Información del Negocio</h3>
          <p className="mb-2"><strong>Teléfono:</strong> {negocio.telefono}</p>
          <p className="mb-2"><strong>Dirección:</strong> {negocio.direccion}</p>
          <p className="mb-2"><strong>Correo:</strong> {negocio.correo}</p>
          <p className="mb-4"><strong>Descripción:</strong> {negocio.descripcion}</p>
          <p className="mb-4"><strong>Categoría:</strong> {negocio.categoria}</p>
  
          {/* Horario del negocio */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Horario</h3>
            {horarios.length > 0 ? (
              <ul className="space-y-2">
                {diasSemana.map((dia) => {
                  const horario = horarios.find((h) => h.dia_semana === dia);
                  return (
                    <li key={dia} className="flex justify-between text-gray-700">
                      <span>{dia}</span>
                      <span>
                        {horario && horario.activo
                          ? `${horario.hora_inicio} - ${horario.hora_fin}`
                          : 'Cerrado'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500">No se encontraron horarios.</p>
            )}
          </div>
        </div>
      </div>
  
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AccountModal
            isOpen={modalOpen}
            closeModal={() => setModalOpen(false)}
            user={user}
            history={history}
          />
        </div>
      )}
  
      {/* Modal para Login */}
      {modalLoginOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <LoginForm closeModal={handleCloseLoginModal} setAuth={setAuth} />
          </div>
        </div>
      )}
  
      {/* Modal para Registro */}
      {modalRegisterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <RegistroCliente closeModal={handleCloseRegisterModal} setAuth={setAuth} />
          </div>
        </div>
      )}
    </div>
  );
}
export default VistaCliente;




