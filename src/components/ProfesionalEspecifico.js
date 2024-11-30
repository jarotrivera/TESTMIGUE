import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

const ProfesionalEspecifico = ({ negocioId, servicioId }) => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [diasDisponibles, setDiasDisponibles] = useState([]); // Inicializamos como un array vacío
    const [bloquesDisponibles, setBloquesDisponibles] = useState([]);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
    const [negocioNombre, setNegocioNombre] = useState('');
    const [servicioNombre, setServicioNombre] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [ setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Inicializando ProfesionalEspecifico...');
        sessionStorage.removeItem('bloqueSeleccionado');
        sessionStorage.removeItem('empleadoSeleccionado');
        sessionStorage.removeItem('fechaSeleccionada');

        const fetchDatos = async () => {
            try {
                const generalResponse = await axios.get(
                    `http://localhost:5000/api/reserva-horario/disponibilidad/general/${negocioId}/${servicioId}`
                );

                const empleadosResponse = await axios.get(
                    `http://localhost:5000/api/reserva-horario/disponibilidad/empleados/${negocioId}/${servicioId}`
                );

                const { negocio, servicio, diasDisponibles: dias } = generalResponse.data;

                setEmpleados(empleadosResponse.data || []); // Asegúrate de que sea un array
                setDiasDisponibles(dias || []); // Aquí aseguramos que sea un array
                setNegocioNombre(negocio.nombre);
                setServicioNombre(servicio.nombre);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
                setDiasDisponibles([]); // Manejo de error
            }
        };

        fetchDatos();
    }, [negocioId, servicioId]);

    const handleSeleccionarEmpleado = async (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setLoading(true);

        try {
            const response = await axios.get(
                `http://localhost:5000/api/reserva-horario/disponibilidad/empleado/${negocioId}/${servicioId}/${empleado.id}`
            );
            setDiasDisponibles(response.data.diasDisponibles || []); // Manejo seguro
        } catch (error) {
            console.error('Error al obtener disponibilidad del empleado:', error);
            setDiasDisponibles([]); // Reinicia en caso de error
        } finally {
            setLoading(false);
        }
    };

    const handleBloqueSeleccionado = (bloque) => {
        const fecha = diasDisponibles.find((d) =>
            d.bloques?.some((b) => b.hora_inicio === bloque.hora_inicio && b.hora_fin === bloque.hora_fin)
        )?.fecha;

        if (!fecha) {
            console.warn('No se encontró una fecha para el bloque seleccionado:', bloque);
            return;
        }

        setBloqueSeleccionado({ ...bloque, fecha });
        sessionStorage.setItem('bloqueSeleccionado', JSON.stringify({ ...bloque, fecha }));
        sessionStorage.setItem(
            'empleadoSeleccionado',
            JSON.stringify({
                empleadoId: empleadoSeleccionado.id,
                empleadoNombre: empleadoSeleccionado.nombre,
            })
        );
        sessionStorage.setItem('fechaSeleccionada', fecha);
    };

    const handleSiguiente = () => {
        if (empleadoSeleccionado && bloqueSeleccionado) {
            sessionStorage.setItem(
                'negocioSeleccionado',
                JSON.stringify({ id: negocioId, nombre: negocioNombre })
            );
            sessionStorage.setItem(
                'servicioSeleccionado',
                JSON.stringify({ id: servicioId, nombre: servicioNombre })
            );

            navigate('/paso-registro-reserva');
        } else {
            alert('Por favor, selecciona un empleado y un bloque de horario antes de continuar.');
        }
    };

    const dividirEnFilas = (arr, tamanio) => {
        const filas = [];
        for (let i = 0; i < arr.length; i += tamanio) {
            filas.push(arr.slice(i, i + tamanio));
        }
        return filas;
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Selecciona un Profesional</h2>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                {empleados.length > 0 ? (
                    empleados.map((empleado) => (
                        <button
                            key={empleado.id}
                            onClick={() => handleSeleccionarEmpleado(empleado)}
                            style={{
                                margin: '10px',
                                padding: '15px 30px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                backgroundColor: empleadoSeleccionado?.id === empleado.id ? '#4CAF50' : '#f9f9f9',
                                color: empleadoSeleccionado?.id === empleado.id ? 'white' : 'black',
                                width: '200px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {empleado.nombre}
                        </button>
                    ))
                ) : (
                    <p>No hay profesionales disponibles para este servicio.</p>
                )}
            </div>

            {empleadoSeleccionado && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Disponibilidad de {empleadoSeleccionado.nombre}</h3>
                    <Calendar
                        onClickDay={(date) => {
                            const fechaSeleccionada = date.toISOString().split('T')[0];
                            const diaEncontrado = diasDisponibles.find((dia) => dia.fecha === fechaSeleccionada);
                            setBloquesDisponibles(diaEncontrado ? diaEncontrado.bloques : []);
                        }}
                        tileDisabled={({ date }) => {
                            if (!Array.isArray(diasDisponibles)) return true;

                            const fechaTile = date.toISOString().split('T')[0];
                            const diaEncontrado = diasDisponibles.find((dia) => dia.fecha === fechaTile);

                            return !diaEncontrado || !diaEncontrado.disponible;
                        }}
                    />
                </div>
            )}

            {bloquesDisponibles.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Bloques de horario disponibles</h3>
                    {dividirEnFilas(bloquesDisponibles, 5).map((fila, filaIndex) => (
                        <div key={filaIndex} style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '10px' }}>
                            {fila.map((bloque, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleBloqueSeleccionado(bloque)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: bloqueSeleccionado?.hora_inicio === bloque.hora_inicio ? '#4CAF50' : '#f9f9f9',
                                        color: bloqueSeleccionado?.hora_inicio === bloque.hora_inicio ? 'white' : 'black',
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
            )}

            {bloqueSeleccionado && (
                <button
                    onClick={handleSiguiente}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
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
    );
};

export default ProfesionalEspecifico;
