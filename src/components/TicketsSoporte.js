// archivo: TicketsSoporteAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketsSoporte = () => {
  const [tickets, setTickets] = useState([]);
  const [filtros, setFiltros] = useState({
    negocio: '',
    cargo: '',
    estado: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [mostrarResueltos, setMostrarResueltos] = useState(false);


  // Obtener todos los tickets desde la base de datos
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get('http://localhost:5000/api/soportes/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error al obtener los tickets de soporte:', error);
      setMensaje('Error al obtener los tickets de soporte.');
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const filtrarTickets = () => {
    return tickets
      .filter((ticket) => {
        const cumpleNegocio = !filtros.negocio || ticket.id_negocio === Number(filtros.negocio);
        const cumpleCargo = !filtros.cargo || ticket.cargo === filtros.cargo;
        const cumpleEstado = !filtros.estado || ticket.estado === filtros.estado;
        const cumplePrioridad = !filtros.prioridad || ticket.prioridad === filtros.prioridad;

        return cumpleNegocio && cumpleCargo && cumpleEstado && cumplePrioridad;
      })
      .filter((ticket) => {
        // Mostrar los tickets resueltos solo si mostrarResueltos es verdadero o si el ticket no está resuelto
        return mostrarResueltos || ticket.estado !== 'resuelto';
      })
      .sort((a, b) => {
        // Ordenar los tickets para que los que no están resueltos aparezcan primero
        if (a.estado === 'resuelto' && b.estado !== 'resuelto') return 1;
        if (a.estado !== 'resuelto' && b.estado === 'resuelto') return -1;
        return new Date(b.creado_en) - new Date(a.creado_en); // Orden descendente por fecha de creación
      });
  };

  const handleEstadoYRespuestaChange = async (ticketId, nuevoEstado, respuesta) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      await axios.put(
        `http://localhost:5000/api/soportes/${ticketId}/estado`,
        { estado: nuevoEstado, respuesta },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensaje('Estado y respuesta del ticket actualizados correctamente.');
      fetchTickets();
    } catch (error) {
      console.error('Error al actualizar el estado y la respuesta del ticket:', error);
      setMensaje('Error al actualizar el estado y la respuesta del ticket.');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-bold mb-4">Tickets de Soporte - Administrador</h1>
        {mensaje && <p className="mb-4 text-green-500">{mensaje}</p>}
        <div className="bg-white p-6 rounded shadow-md space-y-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-2">Negocio</label>
              <input
                type="number"
                name="negocio"
                value={filtros.negocio}
                onChange={handleFiltroChange}
                className="p-2 border rounded w-full bg-gray-100"
                placeholder="ID del negocio"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Cargo</label>
              <select
                name="cargo"
                value={filtros.cargo}
                onChange={handleFiltroChange}
                className="p-2 border rounded w-full bg-gray-100"
              >
                <option value="">Todos</option>
                <option value="Dueño">Dueño</option>
                <option value="Empleado">Empleado</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Estado</label>
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleFiltroChange}
                className="p-2 border rounded w-full bg-gray-100"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Prioridad</label>
              <select
                name="prioridad"
                value={filtros.prioridad}
                onChange={handleFiltroChange}
                className="p-2 border rounded w-full bg-gray-100"
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={mostrarResueltos}
                onChange={() => setMostrarResueltos(!mostrarResueltos)}
                className="form-checkbox"
              />
              <span className="ml-2">Mostrar tickets resueltos</span>
            </label>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Tickets de Soporte</h2>
          {filtrarTickets().length === 0 ? (
            <p>No se encontraron tickets de soporte.</p>
          ) : (
            <ul className="bg-white p-6 rounded shadow-md space-y-4">
              {filtrarTickets().map((ticket) => (
                <li key={ticket.id} className="border-b pb-4 mb-4">
                  <p><strong>ID del Negocio:</strong> {ticket.id_negocio}</p>
                  <p><strong>Asunto:</strong> {ticket.asunto}</p>
                  <p><strong>Descripción:</strong> {ticket.descripcion}</p>
                  <p><strong>Prioridad:</strong> {ticket.prioridad}</p>
                  <p><strong>Cargo:</strong> {ticket.cargo}</p>
                  <p><strong>Estado:</strong> {ticket.estado}</p>
                  <p><strong>Fecha de creación:</strong> {new Date(ticket.creado_en).toLocaleString()}</p>
                  {ticket.imagen && (
                    <div className="mt-4">
                      <a
                        href={ticket.imagen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Ver Imagen Adjunta
                      </a>
                    </div>
                  )}
                  <div className="mt-4">
                    <textarea
                      placeholder="Escribe la respuesta aquí"
                      className="p-2 border rounded w-full bg-gray-100 mb-4"
                      onChange={(e) => (ticket.respuesta = e.target.value)}
                    />
                    <button
                      onClick={() => handleEstadoYRespuestaChange(ticket.id, 'en_progreso', ticket.respuesta)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Marcar como En Progreso
                    </button>
                    <button
                      onClick={() => handleEstadoYRespuestaChange(ticket.id, 'resuelto', ticket.respuesta)}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Marcar como Resuelto
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsSoporte;

