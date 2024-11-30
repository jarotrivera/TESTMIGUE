import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { FcMenu, FcPlanner, FcBusinessman, FcPlus, FcManager, FcCalendar, FcAutomatic, FcCustomerSupport,FcInspection,FcPositiveDynamic    } from 'react-icons/fc';
import logo from '../assets/images/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [role, setRole] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('cargo'); // Si cargo también se usa
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Obtener el rol del usuario almacenado en localStorage
    const storedUser = JSON.parse(localStorage.getItem('usuario'));
    if (storedUser && storedUser.cargo) {
      setRole(storedUser.cargo);
    } else {
      console.warn("No se encontró un usuario válido en localStorage.");
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className={`h-screen bg-gray-900 text-white shadow-lg flex flex-col fixed top-0 left-0 transition-width duration-300 ${isMenuOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        <button onClick={toggleMenu} className="text-white hover:text-purple-500 focus:outline-none mr-4">
          <FcMenu size={24} />
        </button>
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo Rhea Reserve" className="h-10 w-10" />
          {isMenuOpen && <span className="text-2xl font-bold">Rhea Reserve</span>}
        </div>
      </div>
      <ul className="mt-6 space-y-2 flex-grow">

        {/* Mostrar la opción "Negocio" solo si el rol es 'Dueño' */}
        {role === 'Dueño' && (
          <li>
            <Link
              to="/cuenta"
              className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/cuenta') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
            >
              <FcBusinessman />
              {isMenuOpen && <span>Negocio</span>}
            </Link>
          </li>
        )}
        {/* Mostrar la opción "Servicios" solo para 'Dueño' */}
        {role === 'Dueño' && (
          <li>
            <Link
              to="/servicios"
              className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/servicios') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
            >
              <FcPlus />
              {isMenuOpen && <span>Servicios</span>}
            </Link>
          </li>
        )}

        {/* Mostrar la opción "ServiciosEmp" solo para 'Empleado' */}
        {role === 'Empleado' && (
          <li>
            <Link
              to="/ServiciosEmp"
              className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/ServiciosEmp') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
            >
              <FcInspection  />
              {isMenuOpen && <span>Mis Servicios</span>}
            </Link>
          </li>
        )}

        {/* Mostrar el resto de opciones si el rol es 'Dueño' o 'Empleado' */}
        {(role === 'Dueño' || role === 'Empleado') && (
          <>
            <li>
              <Link
                to="/panel-reservas"
                className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/panel-reservas') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
              >
                <FcPlanner />
                {isMenuOpen && <span>Panel de Reservas</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/profesionales"
                className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/profesionales') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
              >
                <FcManager />
                {isMenuOpen && <span>Profesionales</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/calendario"
                className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/calendario') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
              >
                <FcCalendar />
                {isMenuOpen && <span>Calendario</span>}
              </Link>
            </li>
            {/* Mostrar la opción "Dashboard" solo para 'Dueño' */}
        {role === 'Dueño' && (
          <li>
            <Link
              to="/Dashboard"
              className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/Dashboard') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
            >
              <FcPositiveDynamic   />
              {isMenuOpen && <span>Reportes</span>}
            </Link>
          </li>
        )}
            <li>
              <Link
                to="/configuracion"
                className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/configuracion') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
              >
                <FcAutomatic />
                {isMenuOpen && <span>Configuración</span>}
              </Link>
            </li>
          </>
        )}
        {role === 'Soporte' && (
          <li>
            <Link
              to="/TicketsSoporte"
              className={`flex items-center space-x-3 p-2 px-4 rounded transition-colors duration-200 ${isActive('/TicketsSoporte') ? 'bg-purple-500' : 'hover:bg-gray-700'}`}
            >
              <FcCustomerSupport />
              {isMenuOpen && <span>Tickets</span>}
            </Link>
          </li>
        )}

      </ul>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          {isMenuOpen && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
