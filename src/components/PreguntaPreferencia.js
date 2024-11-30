import React, { useState } from 'react';
import PrimeraHoraDisponible from './PrimeraHoraDisponible';
import ProfesionalEspecifico from './ProfesionalEspecifico';
import '../PreguntaPreferencia.css'; // Archivo CSS para el diseño
import logorhea from "../assets/images/logorhea.png";

const PreguntaPreferencia = () => {
    // Leer `negocioId` y `servicioId` desde `sessionStorage`
    const negocioId = sessionStorage.getItem('negocioSeleccionado');
    const servicioId = sessionStorage.getItem('servicioSeleccionado');
    const servicioNombre = sessionStorage.getItem('servicioSeleccionadoNombre'); // Nuevo

    const [preferencia, setPreferencia] = useState(null);

    const handlePreferenciaSeleccion = (opcion) => {
        setPreferencia(opcion);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <header className="registro-header">
                <div className="logo-container">
                    <img src={logorhea} alt="Rhea Reserve Logo" className="registro-logo" />
                </div>
            </header>
            {/* "Nuevo" - Título principal */}
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#855bff', marginBottom: '10px' , paddingTop: '50px'}}>
                Reserva tu Hora
            </h1>

            {/* Mostrar el nombre del servicio */}
            <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold', marginBottom: '20px' }}>
                Servicio seleccionado: <span style={{ color: '#855bff' }}>{servicioNombre}</span>
            </p>

            {/* "Nuevo" - Subtítulo */}
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '30px' }}>
                A continuación, selecciona cómo prefieres elegir tu horario de reserva. <br></br>
                Primera hora disponible sin importar el profesional o  Elegir una hora con un Profesional Específico.
            </p>


            

            {/* Opciones de preferencia */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                {/* Botón para Primera Hora Disponible */}
                <button
                    onClick={() => handlePreferenciaSeleccion('primera-hora')}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#444444',
                        color: 'white',
                        border: '2px solid #444444',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#333333')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#444444')}
                >
                    Primera Hora Disponible
                </button>

                {/* Botón para Seleccionar Disponibilidad de Profesional */}
                <button
                    onClick={() => handlePreferenciaSeleccion('profesional-especifico')}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#855bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#6c45e0')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#855bff')}
                >
                    Elegir Profesional Específico
                </button>
            </div>

            {/* Renderizado Condicional según la preferencia seleccionada */}
            {preferencia === 'primera-hora' && (
                <PrimeraHoraDisponible negocioId={negocioId} servicioId={servicioId} />
            )}
            {preferencia === 'profesional-especifico' && (
                <ProfesionalEspecifico negocioId={negocioId} servicioId={servicioId} />
            )}
        </div>
    );
};

export default PreguntaPreferencia;
