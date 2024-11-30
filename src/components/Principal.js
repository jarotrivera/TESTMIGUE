// src/components/Principal.js

import React, { useState, useEffect  } from "react";
import '../styles/Principal.css';  // Archivo CSS para estilos personalizados
import logo from '../assets/images/logo.png';
import back from '../assets/images/back.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";
import { FaRegCalendarAlt } from 'react-icons/fa';
import { AiOutlineCreditCard } from 'react-icons/ai';
import { toast } from 'react-toastify';


const Principal = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [negocios, setNegocios] = useState([]);
  const navigate = useNavigate();

  const handleNegocioClick = (nombre) => {
    navigate(`/negocio/${nombre}`);
  };

  useEffect(() => {
    const fetchNegocios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/negocios/completos');
        const negociosFiltrados = response.data.filter((negocio) => 
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

  return (
    <div
    className="container mx-auto p-6"
    style={{
      backgroundImage: `url(${back})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh', // Asegura que cubra toda la pantalla
      width: '100%',
    }}
  >
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-purple-800 text-white px-6 py-4">
      {/* Logo y Botón Negocios */}
      <div className="flex items-center relative">
        <img src={logo} alt="Logo" className="h-12 mr-4" onClick={() => (window.location.href = '/principal')} />
        <button
          className="brutalist-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="button-text">
            <span>NEGOCIOS</span>
            <span>MENU</span>
          </div>
        
</button>

{menuOpen && (
  <div
    className="absolute bg-[#31306a] text-white rounded-md shadow-lg w-64 z-50"
    style={{ top: '100%', left: '0', marginTop: '8px' }} // Ajusta posición justo debajo
    onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic dentro del menú
  >
    <ul className="divide-y divide-gray-400">
      {negocios.length > 0 ? (
        negocios.map((negocio) => (
          <li
            key={negocio.id}
            onClick={() => handleNegocioClick(negocio.nombre)}
            className="px-4 py-2 hover:bg-gray-500 cursor-pointer"
          >
            {negocio.nombre}
          </li>
        ))
      ) : (
        <li className="px-4 py-2 text-gray-400">No hay negocios disponibles</li>
      )}
    </ul>
          </div>
        )}
      </div>

      {/* Botones de Login y Registro */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => (window.location.href = '/login')}
          className="brutalist-button"
        >
          <div className="button-text">
            <span>LOGIN</span>
            <span>ACCESS</span>
          </div>
        </button>
        <button
          onClick={() => (window.location.href = '/register')}
          className="brutalist-button"
        >
          <div className="button-text">
            <span>REGISTER</span>
            <span>JOIN</span>
          </div>
        </button>
      </div>
    </nav>

      {/* Hero Section */}
      <header className="text-center mt-10">
        <h1 className="text-3xl font-bold mb-4">
          Crea y Gestiona tu Negocio con Rhea.
        </h1>
        <p className="text-lg mb-6">
          "Registra tu negocio, agenda servicios y conecta con tus clientes
          desde un solo lugar."
        </p>
        <div className="flex justify-center space-x-4">
        <button onClick={() => window.location.href = '/register'}
          class="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-purple-800/60 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-purple-800/50 border border-white/20"
        >
          <span class="text-lg">REGISTRA TU NEGOCIO</span>
          <div
            class="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
          >
            <div class="relative h-full w-10 bg-white/30"></div>
          </div>
        </button>
          
        </div>
      </header>

      {/* Sección de Tarjetas */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold mb-6">
          ¿Por qué elegir Rhea?
        </h2>
        <div className="flex justify-center gap-8 flex-wrap">
      {/* Tarjetas con hover */}
      <div
        className="card"
        data-title="Gestión Total"
        data-hover-text="Administra cada aspecto de tu negocio desde una sola plataforma: horarios, empleados, servicios y mucho más."
      >
        <MdDashboard className="card-icon" />
      </div>
      <div
        className="card"
        data-title="Agenda Inteligente"
        data-hover-text="Olvídate del caos con una agenda automatizada que organiza tus reservas y optimiza la disponibilidad de tus empleados."
      >
        <FaRegCalendarAlt className="card-icon" />
      </div>
      <div
        className="card"
        data-title="Pagos Simplificados"
        data-hover-text="Ofrece a tus clientes múltiples opciones de pago seguro y gestiona tus finanzas fácilmente."
      >
        <AiOutlineCreditCard className="card-icon" />
      </div>
    </div>
        <div className="flex justify-center gap-8 mt-12 flex-wrap">
        <h2 className="text-center text-2xl font-bold mb-6">
          ¿Preguntas frecuentes sobre Rhea?
        </h2>
        </div>

        {/* Tarjetas 3D */}
        <div className="flex justify-center gap-8 mt-12 flex-wrap">
          <div className="three-d-card">
            <div className="card-wrapper">
              <div className="card-face front">
                <div className="card-content">
                  <div className="card-title">¿Cómo puedo empezar a usar Rhea en mi negocio?</div>
                  <div className="card-description">
                  Descubre más sobre Rhea
                  </div>
                </div>
              </div>
              <div className="card-face back">
                <div className="card-content">
                  <div className="card-title">¡Empieza Hoy!</div>
                  <div className="card-description">
                  Es muy fácil. Solo necesitas registrarte, completar los datos de tu negocio y podrás comenzar a configurar tus servicios, empleados y horarios desde nuestra plataforma intuitiva.
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Duplicar si se necesitan más */}
          <div className="three-d-card">
            <div className="card-wrapper">
              <div className="card-face front">
                <div className="card-content">
                  <div className="card-title">¿Es necesario que mis clientes se registren para reservar una cita?</div>
                  <div className="card-description">
                  Descubre más sobre Rhea
                  </div>
                </div>
              </div>
              <div className="card-face back">
                <div className="card-content">
                  <div className="card-title">¡Empieza Hoy!</div>
                  <div className="card-description">
                  No, tus clientes pueden reservar como invitados sin necesidad de registrarse, aunque también tienen la opción de crear una cuenta para acceder a más beneficios, como historial de reservas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-600">
        © 2024 Rhea. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Principal;
