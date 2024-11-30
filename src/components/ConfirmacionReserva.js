import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../ConfirmacionReserva.css'; // Crea un archivo CSS para este componente si necesitas estilos.

const ConfirmacionReserva = () => {
    const navigate = useNavigate();

    // Datos de la reserva y cliente almacenados en sessionStorage
    const reservaInvitado = JSON.parse(sessionStorage.getItem('reservaInvitado'));


    const handleVolverInicio = () => {
        // Limpiar datos de sessionStorage si es necesario
        sessionStorage.clear();
        navigate('/'); // Redirigir a la página inicial
    };

    return (
        <div className="confirmacion-container">
            <h2 className="confirmacion-titulo">🎊¡Reserva Confirmada! 🎊</h2>
            <p>Tu reserva se ha realizado con éxito</p> <br />
            <p> Recibiras un correo en <span className="correousuario">{reservaInvitado?.email}</span> recibiendo la informacion detallada.</p>
            
            <button onClick={handleVolverInicio} className="btn volver-inicio">
                Volver al Inicio
            </button>
        </div>
    );
};

export default ConfirmacionReserva;
