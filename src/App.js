import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PanelReservas from './components/PanelReservas';
import Servicios from './components/Servicios';
import Profesionales from './components/Profesionales';
import Notificaciones from './components/Notificaciones';
import Calendario from './components/Calendario';
import Configuracion from './components/Configuracion';
import Soporte from './components/Soporte';
import Login from './components/Login';
import Register from './components/Register';
import Cuenta from './components/Cuenta';
import VistaCliente from './components/VistaCliente'; 
import RegistroEmpleado from './components/RegistroEmpleado';
import './index.css';
import Reserva from './components/Reserva';
import Disponibilidad from './components/Disponibilidad';
import PreguntaPreferencia from './components/PreguntaPreferencia';
import PrimeraHoraDisponible from './components/PrimeraHoraDisponible';
import ProfesionalEspecifico from './components/ProfesionalEspecifico';
import Resumen from './components/Resumen';
import RegistroCliente from './components/RegistroCliente';
import TicketsSoporte from './components/TicketsSoporte';
import PasoRegistroReserva from './components/PasoRegistroReserva';
import MetodoPago from './components/MetodoPago';
import ConfirmacionReserva from './components/ConfirmacionReserva';
import ServiciosEmp from './components/ServiciosEmp';
import { jwtDecode } from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute';
import 'react-toastify/dist/ReactToastify.css';
import CuentaClient from './components/CuentaClient';
// Función PrivateRoute para proteger rutas privadas
import Principal from './components/Principal';
import Dashboard from './components/Dashboard';
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userCargo, setUserCargo] = useState(localStorage.getItem('cargo') || '');
  const location = useLocation();

  useEffect(() => {
    const updateAuthState = () => {
        const token = localStorage.getItem('token');
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                // Verificar expiración del token (opcional, si manejas exp)
                const currentTime = Math.floor(Date.now() / 1000);
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.warn("El token ha expirado. Cerrando sesión.");
                    setIsAuthenticated(false);
                    setUserCargo('');
                    localStorage.clear();
                    return;
                }

                // Sincronizar los datos en localStorage con los decodificados del token
                if (!usuario || usuario.cargo !== decodedToken.cargo) {
                    console.warn("Sincronizando datos del usuario con el token decodificado.");
                    localStorage.setItem(
                        'usuario',
                        JSON.stringify({
                            id: decodedToken.id,
                            cargo: decodedToken.cargo,
                            correo: decodedToken.correo,
                        })
                    );
                    localStorage.setItem('cargo', decodedToken.cargo);
                }

                // Actualizar estados locales
                setIsAuthenticated(true);
                setUserCargo(decodedToken.cargo);

            } catch (error) {
                console.error("Error al decodificar el token:", error);

                // Si hay un error en el token, limpiar el estado y el almacenamiento
                setIsAuthenticated(false);
                setUserCargo('');
                localStorage.clear();
            }
        } else {
            // Si no hay token, limpiar el estado y el almacenamiento
            setIsAuthenticated(false);
            setUserCargo('');
            localStorage.clear();
        }
    };

    // Llamar inicialmente para sincronizar el estado
    updateAuthState();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
        if (e.key === 'token' || e.key === 'cargo') {
            updateAuthState();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, []);

  // Definir las rutas específicas donde se requiere el Sidebar para los Dueños y Empleados
  const routesWithSidebarForOwner = [
    '/cuenta',
    '/panel-reservas',
    '/servicios',
    '/ServiciosEmp',
    '/profesionales',
    '/calendario',
    '/configuracion',
    '/soporte',
    '/TicketsSoporte',
    '/Dashboard'
  ];

  // Determinar si el Sidebar debe mostrarse
  let showSidebar = false;
  if (isAuthenticated && (userCargo === 'Dueño' || userCargo === 'Empleado')) {
    showSidebar = routesWithSidebarForOwner.some((route) => location.pathname.startsWith(route));
  }

  return (
    <div className="flex">
      {/* Mostrar el Sidebar solo en rutas permitidas */}
      {showSidebar && <Sidebar tieneNegocio={userCargo === 'Dueño' || userCargo === 'Empleado'} />}

      <div className={`flex-grow p-4 ${showSidebar ? 'ml-64' : ''}`}>
        <Routes>
          {/* Rutas públicas para la VistaCliente y Disponibilidad */}
          <Route path="/cliente/:id_negocio" element={<VistaCliente />} />
          <Route path="/disponibilidad/:id_negocio" element={<Disponibilidad />} />
          <Route path="/reserva/:negocioId/:servicioId/:horarioId" element={<Reserva />} />
          <Route path="/pregunta-preferencia" element={<PreguntaPreferencia />} />
          <Route path="/primera-hora-disponible/:servicioId" element={<PrimeraHoraDisponible />} />
          <Route path="/profesional-especifico/:servicioId" element={<ProfesionalEspecifico />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/paso-registro-reserva" element={<PasoRegistroReserva />} />
          <Route path="/metodo-pago" element={<MetodoPago />} />
          <Route path="/confirmacion" element={<ConfirmacionReserva />} />

          <Route path="/negocio/:nombre" element={<VistaCliente />} />
          <Route path="/cuenta-cliente" element={<CuentaClient />} />
          <Route path="/principal" element={<Principal />} />
          
          {/* Rutas públicas para Login y Registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro-cliente" element={<RegistroCliente />} />
          <Route path="/registro/:token" element={<RegistroEmpleado />} />

          {/* Rutas privadas protegidas para Dueño */}
          <Route path="/cuenta" element={<ProtectedRoute allowedRoles={['Dueño']}><Cuenta /></ProtectedRoute>} />

          {/* Rutas privadas protegidas para Dueño y Empleado */}
          {(userCargo === 'Dueño' || userCargo === 'Empleado') && (
            <>
              <Route path="/panel-reservas" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><PanelReservas /></ProtectedRoute>} />
              <Route path="/servicios" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Servicios /></ProtectedRoute>} />
              <Route path="/profesionales" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Profesionales /></ProtectedRoute>} />
              <Route path="/notificaciones" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Notificaciones /></ProtectedRoute>} />
              <Route path="/calendario" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Calendario /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Configuracion /></ProtectedRoute>} />
              <Route path="/soporte" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Soporte /></ProtectedRoute>} />
              <Route path="/Dashboard" element={<ProtectedRoute allowedRoles={['Dueño', 'Empleado']}><Dashboard /></ProtectedRoute>} />
            </>
          )}
          {/* Ruta para ver los servicios asignados al empleado */}
          {(userCargo === 'Empleado') && (
            <Route
            path="/ServiciosEmp"
            element={
              <ProtectedRoute allowedRoles={['Empleado']}>
                <ServiciosEmp />
              </ProtectedRoute>
            }
          />
        )}
        
          {/* Ruta para soporte administrativo */}

          <Route
          path="/TicketsSoporte"
          element={
            <ProtectedRoute allowedRoles={['Soporte']}>
              <TicketsSoporte />
            </ProtectedRoute>
          }
        />

          {/* Redireccionar rutas no encontradas */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/principal" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
