import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../PasoRegistroReserva.css'; // Usaremos los mismos estilos de CSS
import logorhea from "../assets/images/logorhea.png";
import { FcTabletAndroid, FcShop } from "react-icons/fc";
import axios from 'axios';

const MetodoPago = () => {
    window.scrollTo(0, 0); // Asegurarnos de que la vista se cargue desde el principio
    const navigate = useNavigate();

    // Recuperar datos de sessionStorage
    const negocioSeleccionado = JSON.parse(sessionStorage.getItem('negocioSeleccionado'));
    const servicioSeleccionado = JSON.parse(sessionStorage.getItem('servicioSeleccionado'));
    const empleadoSeleccionado = JSON.parse(sessionStorage.getItem('empleadoSeleccionado'));
    console.log('Empleado Seleccionado:', empleadoSeleccionado); // Asegúrate de que no sea null o undefined
    const bloqueSeleccionado = JSON.parse(sessionStorage.getItem('bloqueSeleccionado'));
    const fechaSeleccionada = sessionStorage.getItem('fechaSeleccionada');
    const reservaInvitado = JSON.parse(sessionStorage.getItem('reservaInvitado'));

    const [metodoPago, setMetodoPago] = useState(''); // Estado para el método de pago seleccionado
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    const [isLoading, setIsLoading] = useState(false); // Estado para mostrar el loader

    const handleVolver = () => {
        sessionStorage.removeItem('clienteId');
        sessionStorage.removeItem('metodoPago');
        navigate('/paso-registro-reserva'); // Redirigir al paso anterior
    };

    const handleSiguiente = () => {
        // Guardar datos importantes en sessionStorage antes de abrir el modal
        sessionStorage.setItem('empleadoSeleccionado', JSON.stringify(empleadoSeleccionado));
        sessionStorage.setItem('bloqueSeleccionado', JSON.stringify(bloqueSeleccionado));
        sessionStorage.setItem('reservaInvitado', JSON.stringify(reservaInvitado));
        if (!metodoPago) {
            alert('Por favor, selecciona un método de pago.');
            return;
        }
        setIsModalOpen(true); // Abrir el modal
    };

    const handleConfirmarReserva = async () => {
        const bloqueSeleccionado = JSON.parse(sessionStorage.getItem('bloqueSeleccionado'));
        const negocioSeleccionado = JSON.parse(sessionStorage.getItem('negocioSeleccionado'));
        const servicioSeleccionado = JSON.parse(sessionStorage.getItem('servicioSeleccionado'));
    
        setIsModalOpen(false); // Cerrar el modal
        setIsLoading(true); // Mostrar el loader
    
        if (!empleadoSeleccionado || !empleadoSeleccionado.empleadoId) {
            alert('Hubo un problema al seleccionar al profesional. Por favor, regresa y selecciona un profesional válido.');
            setIsLoading(false); // Ocultar loader si hay error temprano
            return;
        }
    
        try {
            let clienteId = sessionStorage.getItem('clienteId'); // Cambiado a let
            if (!clienteId && reservaInvitado) {
                // Crear cliente si es invitado
                const responseCliente = await axios.post('http://localhost:5000/api/clientes/invitado', {
                    nombre: reservaInvitado.nombre,
                    email: reservaInvitado.email,
                    telefono: reservaInvitado.telefono || null,
                    is_guest: true,
                });
    
                clienteId = responseCliente.data.clienteId;
                sessionStorage.setItem('clienteId', clienteId);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo
            }
    
            // Crear reserva
            await axios.post('http://localhost:5000/api/reserva-horario/crear', {
                clienteId,
                negocioId: negocioSeleccionado.id,
                servicioId: servicioSeleccionado.id,
                empleadoId: bloqueSeleccionado.empleadoId, // Ajuste aquí
                fecha: fechaSeleccionada,
                hora_inicio: bloqueSeleccionado.hora_inicio,
                hora_fin: bloqueSeleccionado.hora_fin,
                comentario_cliente: reservaInvitado?.comentario || null,
            });
    
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos
            navigate('/confirmacion'); // Redirigir a la pantalla de confirmación
        } catch (error) {
            console.error('Error al confirmar la reserva:', error);
            alert('Hubo un problema al confirmar tu reserva. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false); // Ocultar el loader
        }
    };
    

    return (
        <div className="registro-container">
            <header className="registro-header">
                <div className="logo-container">
                    <img src={logorhea} alt="Rhea Reserve Logo" className="registro-logo" />
                </div>
            </header>

            {/* Modal para el resumen */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className='titulo-1-1-1'>Resumen de la Reserva</h3>
                        <h4 className='titulo-1-1-2'>Datos de Reserva</h4>
                        <p><b>Negocio:</b> {negocioSeleccionado.nombre}</p>
                        <p><b>Servicio:</b> {servicioSeleccionado.nombre}</p>
                        <p><b>Profesional:</b> {empleadoSeleccionado.empleadoNombre}</p>
                        <p><b>Fecha:</b> {fechaSeleccionada}</p>
                        <p><b>Hora:</b> {bloqueSeleccionado.hora_inicio} - {bloqueSeleccionado.hora_fin}</p>
                        <hr />
                        <h4 className='titulo-1-1-2'>Datos del Cliente</h4>
                        <p><b>Nombre:</b> {reservaInvitado.nombre}</p>
                        <p><b>Correo Electrónico:</b> {reservaInvitado.email}</p>
                        <p><b>Comentario:</b> {reservaInvitado.comentario || 'Sin comentario'}</p>
                        <p><b>Teléfono:</b> {reservaInvitado.telefono || 'Sin teléfono'}</p>
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)} className="btn volver">Volver</button>
                            <button onClick={handleConfirmarReserva} className="btn siguiente">Confirmar Reserva</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loader */}
            {isLoading && (
                <div className="loader-overlay">
                    <div className="scene">
                        <div class="scene">
                        <div class="forest">
                            <div class="tree tree1">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            </div>

                            <div class="tree tree2">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>

                            <div class="tree tree3">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>

                            <div class="tree tree4">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>

                            <div class="tree tree5">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>

                            <div class="tree tree6">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>

                            <div class="tree tree7">
                            <div class="branch branch-top"></div>
                            <div class="branch branch-middle"></div>
                            <div class="branch branch-bottom"></div>
                            </div>
                        </div>
                        
                        <div class="tent">
                            <div class="roof"></div>
                            <div class="roof-border-left">
                                <div class="roof-border roof-border1"></div>
                                <div class="roof-border roof-border2"></div>
                                <div class="roof-border roof-border3"></div>
                            </div>
                            <div class="entrance">
                                <div class="door left-door">
                                <div class="left-door-inner"></div>
                                </div>
                                <div class="door right-door">
                                <div class="right-door-inner"></div>
                                </div>
                            </div>
                            </div>

                        <div class="floor">
                            <div class="ground ground1"></div>
                            <div class="ground ground2"></div>
                            </div>
                        
                        <div class="fireplace">
                            <div class="support"></div>
                            <div class="support"></div>
                            <div class="bar"></div>
                            <div class="hanger"></div>
                            <div class="smoke"></div>
                            <div class="pan"></div>
                            <div class="fire">
                            <div class="line line1">
                                <div class="particle particle1"></div>
                                <div class="particle particle2"></div>
                                <div class="particle particle3"></div>
                                <div class="particle particle4"></div>
                            </div>
                            <div class="line line2">
                                <div class="particle particle1"></div>
                                <div class="particle particle2"></div>
                                <div class="particle particle3"></div>
                                <div class="particle particle4"></div>
                            </div>
                            <div class="line line3">
                                <div class="particle particle1"></div>
                                <div class="particle particle2"></div>
                                <div class="particle particle3"></div>
                                <div class="particle particle4"></div>
                            </div>
                            </div>
                        </div>
                        
                        <div class="time-wrapper">
                            <div class="time">
                            <div class="day"></div>
                            <div class="night">
                                <div class="moon"></div>
                                <div class="star star1 star-big"></div>
                                <div class="star star2 star-big"></div>
                                <div class="star star3 star-big"></div>
                                <div class="star star4"></div>
                                <div class="star star5"></div>
                                <div class="star star6"></div>
                                <div class="star star7"></div>
                            </div>
                            </div>
                        </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div className="registro-left">
                <h3>Paso 2: Método de Pago</h3>
                <div className="opciones-container-botones-pago">
                    <button
                        className={`btn-metodo-pago ${metodoPago === 'tienda' ? 'activo' : ''}`}
                        onClick={() => setMetodoPago('tienda')}
                    >
                        <FcShop style={{ marginRight: "10px", fontSize: "1.5rem" }} />
                        Pago en tienda
                    </button>
                    <button
                        className={`btn-metodo-pago ${metodoPago === 'transbank' ? 'activo' : ''}`}
                        onClick={() => setMetodoPago('transbank')}
                    >
                        <FcTabletAndroid style={{ marginRight: "10px", fontSize: "1.5rem" }} />
                        Pago online Transbank
                    </button>
                </div>
                <div className="botones-container">
                    <button onClick={handleVolver} className="btn volver">Volver</button>
                    <button onClick={handleSiguiente} className="btn siguiente">Siguiente</button>
                </div>
            </div>

            <div className={`registro-right ${reservaInvitado ? 'expandido' : ''}`}>
                <h3>Resumen de Reserva</h3>
                <div className="resumen-container">
                    <p><b>Negocio:</b> {negocioSeleccionado.nombre}</p>
                    <p><b>Servicio:</b> {servicioSeleccionado.nombre}</p>
                    <p><b>Profesional:</b> {empleadoSeleccionado.empleadoNombre}</p>
                    <p><b>Fecha:</b> {fechaSeleccionada}</p>
                    <p><b>Hora:</b> {bloqueSeleccionado.hora_inicio} - {bloqueSeleccionado.hora_fin}</p>
                    <hr />
                    <p><b>Nombre:</b> {reservaInvitado.nombre}</p>
                    <p><b>Correo Electrónico:</b> {reservaInvitado.email}</p>
                    <p><b>Comentario:</b> {reservaInvitado.comentario || 'Sin comentario'}</p>
                    <p><b>Teléfono:</b> {reservaInvitado.telefono || 'Sin teléfono'}</p>
                </div>
            </div>
        </div>
    );
};

export default MetodoPago;
