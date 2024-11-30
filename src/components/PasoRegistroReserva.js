import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../PasoRegistroReserva.css'; // Archivo de estilos
import logorhea from "../assets/images/logorhea.png";

const PasoRegistroReserva = () => {
    window.scrollTo(0, 0);
    const navigate = useNavigate();

    // Recuperar datos del sessionStorage
    const negocioSeleccionado = JSON.parse(sessionStorage.getItem('negocioSeleccionado'));
    const servicioSeleccionado = JSON.parse(sessionStorage.getItem('servicioSeleccionado'));
    const empleadoSeleccionado = JSON.parse(sessionStorage.getItem('empleadoSeleccionado'));
    const bloqueSeleccionado = JSON.parse(sessionStorage.getItem('bloqueSeleccionado'));
    const fechaSeleccionada = sessionStorage.getItem('fechaSeleccionada');

    const [modoRegistro, setModoRegistro] = useState('invitado'); // 'invitado' o 'login'
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        comentario: '',
        telefono: '',
    });
    const [emailError, setEmailError] = useState('');
    const [loginData, setLoginData] = useState({
        correo: '',
        contraseña: '',
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Validaciones personalizadas
    const validateFields = () => {
        const errors = {};

        // Validar nombre
        if (!/^[a-zA-ZñÑ\s]+$/.test(formData.nombre)) {
            errors.nombre = 'El nombre solo puede contener letras.';
        }

        // Validar correo
        if (!formData.email.includes('@')) {
            errors.email = 'El correo debe contener un "@" válido.';
        }

        // Validar teléfono (opcional, pero si se escribe debe ser válido)
        if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
            errors.telefono = 'El teléfono debe contener exactamente 9 dígitos.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const verificarCorreo = async () => {
        if (!formData.email) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/clientes/verificar-correo`, {
                params: { email: formData.email },
            });
            if (response.data.registrado) {
                setEmailError('El correo ya está registrado.');
            } else {
                setEmailError('');
            }
        } catch (error) {
            console.error('Error al verificar el correo:', error);
            setEmailError('Error al verificar el correo. Inténtalo de nuevo.');
        }
    };

    const handleVolver = () => {
        sessionStorage.removeItem('reservaInvitado');
        if (negocioSeleccionado?.id && negocioSeleccionado?.nombre) {
            sessionStorage.setItem('negocioSeleccionado', negocioSeleccionado.id);
        }
        if (servicioSeleccionado?.id && servicioSeleccionado?.nombre) {
            sessionStorage.setItem('servicioSeleccionado', servicioSeleccionado.id);
        }
        navigate('/pregunta-preferencia');
    };

    const handleSiguiente = () => {
        if (modoRegistro === 'invitado') {
            const { nombre, email, telefono, comentario } = formData; // Ajuste aquí
    
            // Validar campos antes de continuar
            if (!validateFields()) {
                alert('Hay errores en el formulario. Por favor, revísalo.');
                return;
            }
    
            if (!nombre || !email) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
    
            // Guardar datos en sessionStorage
            sessionStorage.setItem(
                'reservaInvitado',
                JSON.stringify({ 
                    nombre, 
                    email, 
                    telefono, 
                    comentario_cliente: comentario // Guardamos correctamente el comentario
                })
            );
            
            navigate('/metodo-pago');
        } else {
            alert('Por favor, inicia sesión para continuar.');
        }
    };

    const handleModoRegistroChange = (modo) => {
        if (modo === 'login') {
            // Si cambia a "Registrarse con cuenta existente", eliminar datos del invitado
            sessionStorage.removeItem('reservaInvitado');
        }
        setModoRegistro(modo);
    };

    if (!negocioSeleccionado || !servicioSeleccionado || !empleadoSeleccionado || !bloqueSeleccionado) {
        return (
            <div className="container">
                <p>Error: No hay datos para mostrar. Por favor, vuelve a seleccionar tus preferencias.</p>
                <button onClick={handleVolver} className="btn volver">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="registro-container">
            <header className="registro-header">
                <div className="logo-container">
                    <img src={logorhea} alt="Rhea Reserve Logo" className="registro-logo" />
                </div>
            </header>
            <div className={`registro-left ${modoRegistro === 'invitado' ? 'expandido' : ''}`}>
                <h3 className="registro-titulo">Paso 1: Datos de Reserva</h3>
                <div className="opciones-container">
                    <div>
                        <input
                            type="radio"
                            id="invitado"
                            checked={modoRegistro === 'invitado'}
                            onChange={() => handleModoRegistroChange('invitado')}
                        />
                        <label htmlFor="invitado">Continuar como Invitado</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="login"
                            checked={modoRegistro === 'login'}
                            onChange={() => handleModoRegistroChange('login')}
                        />
                        <label htmlFor="login">Registrarse con cuenta existente</label>
                    </div>
                </div>

                {modoRegistro === 'login' ? (
                    <>
                        <h4 className="form-login-title">Iniciar Sesión</h4>
                        <form className="form-login">
                            <div className="form-group-login">
                                <label htmlFor="correo">Correo</label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    value={loginData.correo}
                                    onChange={handleLoginInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group-login">
                                <label htmlFor="password">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="contraseña"
                                    value={loginData.contraseña}
                                    onChange={handleLoginInputChange}
                                    required
                                />
                            </div>
                            <div className="botones-container">
                                <button type="button" className="btn-login" onClick={handleSiguiente}>
                                    Iniciar Sesión
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <form className="form-datos-invitado">
                        <div className="form-group">
                            <label>Nombre*</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.nombre && <p className="error-text">{validationErrors.nombre}</p>}
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico*</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={verificarCorreo}
                                required
                            />
                            {emailError && (
                                <p className="error-text">
                                    {emailError}{' '}
                                    <span
                                        className="error-link"
                                        onClick={() => setModoRegistro('login')}
                                    >
                                        Iniciar Sesión
                                    </span>
                                </p>
                            )}
                            {validationErrors.email && <p className="error-text">{validationErrors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label>Comentario (opcional)</label>
                            <textarea
                                name="comentario"
                                value={formData.comentario}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Teléfono (opcional)</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                            />
                            {validationErrors.telefono && <p className="error-text">{validationErrors.telefono}</p>}
                        </div>
                    </form>
                )}

                <div className="botones-container">
                    <button onClick={handleVolver} className="btn volver">
                        Volver
                    </button>
                    <button onClick={handleSiguiente} className="btn siguiente">
                        Siguiente
                    </button>
                </div>
            </div>

            <div className="registro-right">
                <h3 className="registro-titulo-secundario">Resumen de Reserva</h3>
                <div className="resumen-container">
                    <p><b>Negocio:</b> {negocioSeleccionado.nombre}</p>
                    <p><b>Servicio:</b> {servicioSeleccionado.nombre}</p>
                    <p><b>Profesional:</b> {empleadoSeleccionado.empleadoNombre}</p>
                    <p><b>Fecha:</b> {fechaSeleccionada}</p>
                    <p><b>Hora:</b> {bloqueSeleccionado.hora_inicio} - {bloqueSeleccionado.hora_fin}</p>
                </div>
            </div>
        </div>
    );
};

export default PasoRegistroReserva;

