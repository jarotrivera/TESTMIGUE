import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 

dayjs.locale('es'); // Configurar dayjs para usar español


const Dashboard = () => {
  // Estados para Reservaciones por Empleado
  const [dataEmpleados, setDataEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  // Estados para Reservas por Fecha
  const [dataEvolucion, setDataEvolucion] = useState([]);
  const [loadingEvolucion, setLoadingEvolucion] = useState(true);
  const [rango, setRango] = useState('semana'); // Rango por defecto: semana

  // Estados para Ventas por Mes
  const [dataPorMes, setDataPorMes] = useState([]);
  const [loadingMes, setLoadingMes] = useState(true);

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado. Redirigiendo al login.');
      window.location.href = '/login';
      return null;
    }
    return token;
  };

  

  // Fetch para Reservaciones por Empleado
  useEffect(() => {
    const fetchReservasPorEmpleado = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/reservas/empleados', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDataEmpleados(response.data);
        setLoadingEmpleados(false);
      } catch (error) {
        console.error('Error al cargar los datos de empleados:', error);
      }
    };

    fetchReservasPorEmpleado();
  }, []);

  // Fetch para Evolución de Reservas en el Tiempo
  useEffect(() => {
    const fetchReservasEvolucion = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/reservas/reservas-por-fecha?rango=${rango}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { serviciosData } = response.data;

        // Transformar los datos en formato compatible con Recharts
        const transformedData = serviciosData.map((item) => ({
          fecha: item.nombre, // Suponiendo que el backend devuelve fechas
          total_reservas: item.total_reservas,
        }));

        setDataEvolucion(transformedData);
        setLoadingEvolucion(false);
      } catch (error) {
        console.error('Error al cargar los datos de evolución:', error);
      }
    };

    fetchReservasEvolucion();
  }, [rango]);

  const COLORS = ['#6B4226', '#D9A066', '#F4D03F', '#28B463', '#1F618D'];
  // Fetch para Ventas por Mes
  useEffect(() => {
    const fetchReservasPorMes = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/reservas/reservas-por-mes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const transformedData = response.data.map((item) => ({
            mes: dayjs(item.mes + '-01').format('MMMM'),
          total_reservas: item.total_reservas,
        }));

        setDataPorMes(transformedData);
        setLoadingMes(false);
      } catch (error) {
        console.error('Error al cargar los datos por mes:', error);
      }
    };

    fetchReservasPorMes();
  }, []);

  if (loadingEmpleados || loadingEvolucion || loadingMes) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>Cargando datos...</p>;
  }


  return (
    <div style={{ padding: '20px' }}>
      {/* Reservaciones por Empleado */}
      <div style={{ marginBottom: '40px', background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Reservaciones por Empleado</h2>
        <ResponsiveContainer width="100%" height={400}>
        <PieChart width={400} height={400}>
  <Pie
    data={dataEmpleados}
    dataKey="total_reservaciones"
    nameKey="empleado"
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    fill="#8884d8"
    paddingAngle={5}
    label={({ name, value }) => `${name}: ${value}`}
    labelLine={{
      stroke: '#ccc',
      strokeWidth: 1,
    }}
  >
    {dataEmpleados.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Legend
    layout="vertical"
    verticalAlign="middle"
    align="right"
    iconType="circle"
    formatter={(value) => <span style={{ color: '#333' }}>{value}</span>}
  />
</PieChart>
</ResponsiveContainer>
      </div>

      {/* Evolución de Reservas en el Tiempo */}
      <div
  style={{
    marginBottom: '40px',
    background: '#ffffff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <h2
    style={{
      textAlign: 'center',
      marginBottom: '20px',
      color: '#4A4A4A',
      fontFamily: 'Arial, sans-serif',
    }}
  >
    Evolución de Reservas en el Tiempo
  </h2>
  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <label
      htmlFor="rango"
      style={{
        marginRight: '10px',
        fontWeight: 'bold',
        color: '#4A4A4A',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      Seleccionar rango:
    </label>
    <select
      id="rango"
      value={rango}
      onChange={(e) => setRango(e.target.value)}
      style={{
        padding: '10px 15px',
        borderRadius: '25px',
        border: '1px solid #CCCCCC',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        background: '#f7f7f7',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <option value="semana">Última Semana</option>
      <option value="mes">Último Mes</option>
      <option value="año">Último Año</option>
    </select>
  </div>
  {dataEvolucion.length > 0 ? (
    <ResponsiveContainer width="100%" height={400}>
    <BarChart
      data={dataEvolucion}
      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#d9d9d9" />
      <XAxis
        dataKey="fecha"
        label={{
          value: 'Servicios',
          position: 'bottom',
          dy: 20,
          style: { fill: '#4A4A4A', fontFamily: 'Arial, sans-serif' },
        }}
        tick={{ fill: '#4A4A4A' }}
      />
      <YAxis
        label={{
          value: 'Reservas Totales',
          angle: -90,
          position: 'insideLeft',
          dx: -10,
          style: { fill: '#4A4A4A', fontFamily: 'Arial, sans-serif' },
        }}
        tick={{ fill: '#4A4A4A' }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          borderRadius: '10px',
          fontFamily: 'Arial, sans-serif',
        }}
        labelStyle={{ color: '#4A4A4A', fontWeight: 'bold' }}
        itemStyle={{ color: '#4A4A4A' }}
        formatter={(value, name, props) => [`${value} reservas`, name]}
      />
      <Legend
        verticalAlign="top"
        height={36}
        wrapperStyle={{ fontFamily: 'Arial, sans-serif', color: '#4A4A4A' }}
      />
      <Bar
        dataKey="total_reservas"
        fill="#6c63ff"
        barSize={30}
        radius={[5, 5, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
  
  ) : (
    <p style={{ textAlign: 'center', color: '#4A4A4A' }}>
      No hay datos disponibles para el rango seleccionado.
    </p>
  )}
</div>



      {/* Ventas por Mes */}
      <div style={{ marginBottom: '40px', background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Ventas por Mes</h2>
        <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dataPorMes} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" label={{ value: 'Meses', position: 'bottom', dy: 20 }} />
          <YAxis label={{ value: 'Reservas Totales', angle: -90, position: 'insideLeft', dx: -10 }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="total_reservas"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4, fill: '#82ca9d' }}
            activeDot={{ r: 6, fill: '#82ca9d' }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
