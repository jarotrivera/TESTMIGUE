import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Resumen = () => {
    const navigate = useNavigate();

    // Recuperar datos del sessionStorage
    const negocioSeleccionado = JSON.parse(sessionStorage.getItem('negocioSeleccionado'));
    const servicioSeleccionado = JSON.parse(sessionStorage.getItem('servicioSeleccionado'));
    const empleadoSeleccionado = JSON.parse(sessionStorage.getItem('empleadoSeleccionado'));
    const bloqueSeleccionado = JSON.parse(sessionStorage.getItem('bloqueSeleccionado'));
    const fechaSeleccionada = sessionStorage.getItem('fechaSeleccionada');

    // Función para confirmar la reserva
    const handleConfirmarReserva = async () => {
        if (!negocioSeleccionado || !servicioSeleccionado || !empleadoSeleccionado || !bloqueSeleccionado || !fechaSeleccionada) {
            alert('Faltan datos para confirmar la reserva.');
            return;
        }

        const reservaData = {
            negocioId: negocioSeleccionado.id,
            servicioId: servicioSeleccionado.id,
            empleadoId: empleadoSeleccionado.empleadoId,
            fecha: fechaSeleccionada,
            hora_inicio: bloqueSeleccionado.hora_inicio,
            hora_fin: bloqueSeleccionado.hora_fin,
            clienteId: 1, // Cliente predeterminado para pruebas
            comentario_cliente: 'Reserva realizada desde la app.',
        };

        try {
            const response = await axios.post('http://localhost:5000/api/reserva-horario/reservar', reservaData);
            console.log('Reserva confirmada:', response.data);

            alert('Reserva confirmada con éxito.');
            sessionStorage.clear(); // Opcional: limpiar el sessionStorage
            navigate('/exito'); // Redirige a una página de éxito
        } catch (error) {
            console.error('Error al confirmar la reserva:', error);
            alert('Hubo un error al confirmar la reserva. Inténtalo nuevamente.');
        }
    };

    const handleVolver = () => {
        console.log('Volviendo a PrimeraHoraDisponible...');
        // Restablecer negocioSeleccionado y servicioSeleccionado al formato simple
        if (negocioSeleccionado?.id && negocioSeleccionado?.nombre) {
            sessionStorage.setItem('negocioSeleccionado', negocioSeleccionado.id);
        }
        if (servicioSeleccionado?.id && servicioSeleccionado?.nombre) {
            sessionStorage.setItem('servicioSeleccionado', servicioSeleccionado.id);
        }
        console.log('SessionStorage después de ajustar al volver:', sessionStorage);
        navigate('/pregunta-preferencia'); // Redirige a la selección de preferencia
    };

    if (!negocioSeleccionado || !servicioSeleccionado || !empleadoSeleccionado || !bloqueSeleccionado) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p>Error: No hay datos para mostrar. Por favor, vuelve a seleccionar tus preferencias.</p>
                <button
                    onClick={handleVolver}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#855bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h3>Resumen de la Reserva</h3>
            <p>Confirma si los datos ingresados están correctos:</p>
            <table style={{ margin: '0 auto', textAlign: 'left' }}>
                <tbody>
                    <tr>
                        <td><b>Negocio:</b></td>
                        <td>{negocioSeleccionado.nombre}</td>
                    </tr>
                    <tr>
                        <td><b>Servicio:</b></td>
                        <td>{servicioSeleccionado.nombre}</td>
                    </tr>
                    <tr>
                        <td><b>Profesional:</b></td>
                        <td>{empleadoSeleccionado.empleadoNombre}</td>
                    </tr>
                    <tr>
                        <td><b>Fecha:</b></td>
                        <td>{fechaSeleccionada}</td>
                    </tr>
                    <tr>
                        <td><b>Hora:</b></td>
                        <td>{bloqueSeleccionado.hora_inicio} - {bloqueSeleccionado.hora_fin}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={handleVolver}
                    style={{
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#ccc',
                        color: 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Volver
                </button>
                <button
                    onClick={handleConfirmarReserva}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#855bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Confirmar Reserva
                </button>
            </div>
        </div>
    );
};

export default Resumen;