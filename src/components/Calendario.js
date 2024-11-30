import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';
import Modal from 'react-modal';
import axios from 'axios';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

Modal.setAppElement('#root');

const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3"];

const predefinedCategories = [
  "Cumpleaños",
  "Entrega de Suministros",
  "Reunión de Equipo",
  "Visita de Clientes",
  "Mantenimiento",
];

const Calendario = () => {
  const [user, setUser] = useState({ nombre: '', correo: '', id_negocio: null, cargo: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ titulo: '', inicio: new Date(), fin: new Date(), descripcion: '', categoria: '' });
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
        const negocio = response.data.negocio;
        if (negocio && negocio.id) cargarEventos(negocio.id, token);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
  }, []);

  const cargarEventos = async (id_negocio, token) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/eventos/negocio/${id_negocio}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventosConFechaCorrecta = response.data.map(evento => ({
        ...evento,
        title: evento.titulo,
        inicio: parseISO(evento.inicio),
        fin: parseISO(evento.fin),
      }));
      setEvents(eventosConFechaCorrecta);
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
    }
  };

  const getCategoryColor = (categoryName) => {
    const index = predefinedCategories.indexOf(categoryName);
    return colorPalette[index % colorPalette.length];
  };

  const openModal = (slotInfo) => {
    setNewEvent({
      titulo: '',
      inicio: slotInfo.start ? new Date(slotInfo.start) : new Date(),
      fin: slotInfo.end ? new Date(slotInfo.end) : new Date(),
      descripcion: '',
      categoria: '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setFormError('');
    setModalOpen(false);
  };

  const validateForm = () => {
    if (!newEvent.titulo.trim()) {
      setFormError('El título es obligatorio.');
      return false;
    }
    if (!newEvent.categoria.trim()) {
      setFormError('La categoría es obligatoria.');
      return false;
    }
    if (newEvent.descripcion.length < 10 || newEvent.descripcion.length > 100) {
      setFormError('La descripción debe tener entre 10 y 100 caracteres.');
      return false;
    }
    return true;
  };

  const handleAddEvent = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      if (!user.negocio || !user.negocio.id) {
        alert('No se encontró un negocio asociado al usuario.');
        return;
      }

      const formattedEvent = {
        ...newEvent,
        inicio: new Date(newEvent.inicio),
        fin: new Date(newEvent.fin),
        id_negocio: user.negocio.id,
        id_usuario_creador: user.id,
      };

      const response = await axios.post('http://localhost:5000/api/eventos', formattedEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents([...events, {
        ...response.data,
        inicio: new Date(response.data.inicio),
        fin: new Date(response.data.fin),
      }]);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Error al añadir el evento:', error);
    }
  };
   // Maneja el click en el evento
   const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/eventos/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Evento eliminado con éxito");
      cargarEventos(user.negocio.id, token); // Recargar los eventos tras eliminación
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };

  const puedeEliminarEvento = selectedEvent && user && (
    user.cargo === "Dueño" || user.id === selectedEvent.id_usuario_creador
  );

  

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Calendario del Negocio</h2>
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <Calendar
          localizer={localizer}
          events={events.map(event => ({
            ...event,
            color: getCategoryColor(event.categoria),
          }))}
          startAccessor="inicio"
          endAccessor="fin"
          style={{ height: 500 }}
          selectable
          onSelectSlot={(slotInfo) => openModal(slotInfo)}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              color: 'white',
              borderRadius: '0.5rem',
              padding: '0.2rem',
            },
          })}
        />
      </div>
          {/* Modal para mostrar los detalles del evento */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedEvent.titulo}</h2>
          
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Inicio:</span> {new Date(selectedEvent.inicio).toLocaleString()}
          </p>
          
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Fin:</span> {new Date(selectedEvent.fin).toLocaleString()}
          </p>
          
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Descripción:</span> {selectedEvent.descripcion}
          </p>
          
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Categoría:</span> {selectedEvent.categoria}
          </p>
          
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Creado por:</span> {selectedEvent.nombre_usuario}
          </p>
          
          <div className="flex justify-end space-x-4">
            {puedeEliminarEvento && (
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                Eliminar
              </button>
            )}
            <button
              onClick={() => setSelectedEvent(null)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
            >
              Cerrar
            </button>
          </div>


          </div>
        </div>
      )}
    
      {/* Modal para añadir un evento */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Añadir Evento"
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
          <h3 className="text-2xl font-bold mb-4">Añadir un Evento</h3>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Título del Evento:</label>
              <input
                type="text"
                value={newEvent.titulo}
                onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Descripción:</label>
              <textarea
                value={newEvent.descripcion}
                onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Fecha de Inicio:</label>
              <input
                type="datetime-local"
                value={format(newEvent.inicio, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, inicio: new Date(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Fecha de Finalización:</label>
              <input
                type="datetime-local"
                value={format(newEvent.fin, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, fin: new Date(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Categoría:</label>
              <select
                value={newEvent.categoria}
                onChange={(e) => setNewEvent({ ...newEvent, categoria: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una categoría</option>
                {predefinedCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddEvent}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Añadir Evento
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="ml-2 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Calendario;
