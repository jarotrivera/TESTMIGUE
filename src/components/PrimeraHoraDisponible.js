import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // Archivo CSS personalizado

// Divide un array en subarrays de tamaño definido
const dividirEnFilas = (arr, tamanio) => {
    const filas = [];
    for (let i = 0; i < arr.length; i += tamanio) {
        filas.push(arr.slice(i, i + tamanio));
    }
    return filas;
};

const PrimeraHoraDisponible = ({ negocioId, servicioId }) => {
    const [diasDisponibles, setDiasDisponibles] = useState([]);
    const [bloquesPorProfesional, setBloquesPorProfesional] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [negocioNombre, setNegocioNombre] = useState('');
    const [servicioNombre, setServicioNombre] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Inicializando PrimeraHoraDisponible...');
        console.log('Antes de limpiar:', sessionStorage);
        sessionStorage.removeItem('bloqueSeleccionado');
        sessionStorage.removeItem('empleadoSeleccionado');
        sessionStorage.removeItem('fechaSeleccionada');
        console.log('Después de limpiar:', sessionStorage);
        if (!negocioId || !servicioId) {
            setError('ID de negocio o servicio no está definido.');
            setLoading(false);
            return;
        }

        axios
            .get(`http://localhost:5000/api/reserva-horario/disponibilidad/general/${negocioId}/${servicioId}`)
            .then((response) => {
                const { negocio, servicio, diasDisponibles } = response.data;
                setDiasDisponibles(diasDisponibles);
                setNegocioNombre(negocio.nombre);
                setServicioNombre(servicio.nombre);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al obtener disponibilidad:', error);
                setError('Error al obtener disponibilidad: ' + error.message);
                setLoading(false);
            });
    }, [negocioId, servicioId]);

    const handleDiaSeleccion = (date) => {
        const dia = moment(date).format('YYYY-MM-DD');
        setDiaSeleccionado(dia);
        setBloqueSeleccionado(null);

        const diaData = diasDisponibles.find((d) => d.fecha === dia);
        if (diaData && diaData.bloquesPorEmpleado.length > 0) {
            const bloquesAgrupados = diaData.bloquesPorEmpleado.reduce((acc, empleado) => {
                const { id, nombre } = empleado.empleado;
                const bloques = empleado.bloques;
                acc[id] = { nombreEmpleado: nombre, bloques };
                return acc;
            }, {});
            setBloquesPorProfesional(Object.entries(bloquesAgrupados));
        } else {
            setBloquesPorProfesional([]);
        }
    };

    const handleBloqueSeleccion = (bloque, empleadoId, empleadoNombre) => {
        console.log('Bloque seleccionado:', bloque); // Depurar
        console.log('Empleado seleccionado:', { empleadoId, empleadoNombre });


        setBloqueSeleccionado({ ...bloque, empleadoId, empleadoNombre });
        sessionStorage.setItem('bloqueSeleccionado', JSON.stringify({ ...bloque, empleadoId, empleadoNombre }));
        sessionStorage.setItem('empleadoSeleccionado', JSON.stringify({ empleadoId, empleadoNombre }));
        sessionStorage.setItem('fechaSeleccionada', diaSeleccionado); // Guarda la fecha seleccionada

        console.log('SessionStorage después de guardar:'); // Depurar
        console.log('bloqueSeleccionado:', sessionStorage.getItem('bloqueSeleccionado'));
        console.log('empleadoSeleccionado:', sessionStorage.getItem('empleadoSeleccionado'));
        console.log('fechaSeleccionada:', sessionStorage.getItem('fechaSeleccionada'));
    };

    const handleSiguiente = () => {
        if (bloqueSeleccionado) {
            sessionStorage.setItem(
                'negocioSeleccionado',
                JSON.stringify({ id: negocioId, nombre: negocioNombre })
            );
            sessionStorage.setItem(
                'servicioSeleccionado',
                JSON.stringify({ id: servicioId, nombre: servicioNombre })
            );
            sessionStorage.setItem('bloqueSeleccionado', JSON.stringify(bloqueSeleccionado));
            sessionStorage.setItem('fechaSeleccionada', diaSeleccionado);
            navigate('/paso-registro-reserva');
        } else {
            alert('Por favor, seleccione un bloque de horario antes de continuar.');
        }
    };

    const isDayDisabled = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        return !diasDisponibles.some((dia) => dia.fecha === formattedDate && dia.disponible);
    };

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#151515', marginBottom: '5px' }}>
                Primera Hora Disponible
            </h3>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>Seleccione un día:</p>

            {loading ? (
                <p>Cargando disponibilidad...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <Calendar onChange={handleDiaSeleccion} tileDisabled={({ date }) => isDayDisabled(date)} />
                </div>
            )}

            {diaSeleccionado && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
                        Horarios para el día{' '}
                        <span style={{ color: '#5666dc' }}>{moment(diaSeleccionado).format('YYYY-MM-DD')}</span>
                    </h3>
                    {bloquesPorProfesional.length > 0 ? (
                        bloquesPorProfesional.map(([empleadoId, { nombreEmpleado, bloques }]) => (
                            <div key={empleadoId} style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Profesional: {nombreEmpleado}</h4>
                                {dividirEnFilas(bloques, 5).map((fila, filaIndex) => (
                                    <div
                                        key={filaIndex}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {fila.map((bloque, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleBloqueSeleccion(bloque, empleadoId, nombreEmpleado)}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor:
                                                        bloqueSeleccionado?.hora_inicio === bloque.hora_inicio &&
                                                        bloqueSeleccionado?.empleadoId === empleadoId
                                                            ? '#333'
                                                            : '#f9f9f9',
                                                    color:
                                                        bloqueSeleccionado?.hora_inicio === bloque.hora_inicio &&
                                                        bloqueSeleccionado?.empleadoId === empleadoId
                                                            ? 'white'
                                                            : 'black',
                                                    padding: '10px 15px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '5px',
                                                    minWidth: '110px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {bloque.hora_inicio} - {bloque.hora_fin}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p>No hay bloques de horario disponibles para este día.</p>
                    )}

                    {bloqueSeleccionado && (
                        <button
                            onClick={handleSiguiente}
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
                            Siguiente
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrimeraHoraDisponible;
