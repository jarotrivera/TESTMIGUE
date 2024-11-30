import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const PanelReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [reservasSeleccionadas, setReservasSeleccionadas] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());

    useEffect(() => {
        const obtenerReservas = async () => {
            try {
                const negocioId = 1; // Cambia este valor por el ID del negocio correspondiente
                const response = await axios.get(`http://localhost:5000/api/panel-reservas/${negocioId}`);
                const { reservas } = response.data;

                setReservas(reservas);
                const eventosFormat = reservas.map((reserva) => ({
                    title: `${reserva.nombre_servicio} - ${reserva.empleado}`,
                    start: new Date(`${reserva.fecha}T${reserva.hora_inicio}`),
                    end: new Date(`${reserva.fecha}T${reserva.hora_fin}`),
                    reserva,
                }));
                setEventos(eventosFormat);
            } catch (error) {
                console.error('Error al obtener reservas:', error);
            }
        };

        obtenerReservas();
    }, []);

    const handleSeleccionarDia = (date) => {
        setDiaSeleccionado(date);
        const reservasDelDia = reservas.filter(
            (reserva) => reserva.fecha === moment(date).format('YYYY-MM-DD')
        );
        setReservasSeleccionadas(reservasDelDia);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Panel de Reservas</h2>
            <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectSlot={(slotInfo) => handleSeleccionarDia(slotInfo.start)}
                selectable
            />

            <div style={{ marginTop: '20px' }}>
                <h3>Reservas del {moment(diaSeleccionado).format('DD/MM/YYYY')}</h3>
                {reservasSeleccionadas.length > 0 ? (
                    <ul>
                        {reservasSeleccionadas.map((reserva, index) => (
                            <li key={index} style={{ marginBottom: '10px' }}>
                                <b>Servicio:</b> {reserva.nombre_servicio}<br />
                                <b>Duración:</b> {reserva.duracion} minutos<br />
                                <b>Empleado:</b> {reserva.empleado}<br />
                                <b>Cliente:</b> {reserva.cliente}<br />
                                <b>Estado:</b> {reserva.estado}<br />
                                <b>Comentario:</b> {reserva.comentario_cliente || 'Sin comentario'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay reservas para este día.</p>
                )}
            </div>
        </div>
    );
};

export default PanelReservas;
