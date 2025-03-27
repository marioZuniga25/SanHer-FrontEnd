import "./Recuento.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Recuento = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [contadores, setContadores] = useState([]);
  const [citasContador, setCitasContador] = useState([]);
  const [selectedContador, setSelectedContador] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const MySwal = withReactContent(Swal);

  // Datos de ejemplo para el gráfico principal
  const data = [
    { fecha: "2025-03-01", tipo: "Agendadas", cantidad: 9 },
    { fecha: "2025-03-01", tipo: "Atendidas", cantidad: 2 },
    { fecha: "2025-03-01", tipo: "Canceladas", cantidad: 1 },
    { fecha: "2025-03-05", tipo: "Agendadas", cantidad: 5 },
    { fecha: "2025-03-05", tipo: "Atendidas", cantidad: 4 },
    { fecha: "2025-03-05", tipo: "Canceladas", cantidad: 2 },
    { fecha: "2025-03-10", tipo: "Agendadas", cantidad: 6 },
    { fecha: "2025-03-10", tipo: "Atendidas", cantidad: 10 },
    { fecha: "2025-03-10", tipo: "Canceladas", cantidad: 1 },
    { fecha: "2025-03-15", tipo: "Agendadas", cantidad: 11 },
    { fecha: "2025-03-15", tipo: "Atendidas", cantidad: 6 },
    { fecha: "2025-03-15", tipo: "Canceladas", cantidad: 3 },
    { fecha: "2025-03-20", tipo: "Agendadas", cantidad: 8 },
    { fecha: "2025-03-20", tipo: "Atendidas", cantidad: 18 },
    { fecha: "2025-03-20", tipo: "Canceladas", cantidad: 1 },
  ];

  useEffect(() => {
    fetchContadores();
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  }, []);

  const fetchContadores = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/Usuarios/getContadores`);
      setContadores(response.data);
    } catch (error) {
      console.error("Error fetching contadores:", error);
      MySwal.fire(
        'Error',
        'No se pudieron cargar los contadores',
        'error'
      );
    }
  };

  const fetchCitasContador = async (contadorId) => {
    try {
      const response = await axios.get(`${API_URL}/api/Citas/por-contador/${contadorId}`, {
        params: {
          startDate,
          endDate
        }
      });
      setCitasContador(response.data);
    } catch (error) {
      console.error("Error fetching citas por contador:", error);
      MySwal.fire(
        'Error',
        'No se pudieron cargar las citas del contador',
        'error'
      );
    }
  };

  const handleContadorClick = (contador) => {
    setSelectedContador(contador);
    fetchCitasContador(contador.id);
  };

  const handleBackToContadores = () => {
    setSelectedContador(null);
    setCitasContador([]);
  };

  // Función para generar todos los días en un rango
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);
    
    while (currentDate <= end) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }
    
    return dates;
  };

  // Procesamiento de datos para el gráfico
  const filteredData = data.filter((item) => {
    if (startDate && item.fecha < startDate) return false;
    if (endDate && item.fecha > endDate) return false;
    return true;
  });

  // Genera todos los días del rango seleccionado
  const allDatesInRange = generateDateRange(startDate, endDate);

  // Crea un objeto con los datos agrupados por fecha
  const dataByDate = filteredData.reduce((acc, curr) => {
    if (!acc[curr.fecha]) {
      acc[curr.fecha] = { fecha: curr.fecha };
    }
    acc[curr.fecha][curr.tipo] = curr.cantidad;
    return acc;
  }, {});

  // Combina con todos los días del rango, llenando con ceros donde no hay datos
  const groupedData = allDatesInRange.map(date => ({
    fecha: date,
    Agendadas: dataByDate[date]?.Agendadas || 0,
    Atendidas: dataByDate[date]?.Atendidas || 0,
    Canceladas: dataByDate[date]?.Canceladas || 0,
  }));

  return (
    <div className="recuento-container">
      {/* Panel izquierdo (Contadores o Citas por contador) */}
      <div className="users-list-contadores">
        {!selectedContador ? (
          <>
            <h1>Contadores</h1>
            {contadores.map((contador, index) => (
              <div 
                className="contador-card" 
                key={index}
                onClick={() => handleContadorClick(contador)}
              >
                <div className="contador-info">
                  <span className="contador-nombre">
                    {contador.nombre} {contador.apellido1} {contador.apellido2}
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="header-citas-contador">
              <button 
                className="back-button"
                onClick={handleBackToContadores}
              >
                ← Volver a contadores
              </button>
              <h1>Citas de {selectedContador.nombre}</h1>
            </div>
            
            <div className="citas-list">
              {citasContador.length > 0 ? (
                citasContador.map((cita, index) => (
                  <div 
                    className="cita-card" 
                    key={index}
                    data-estatus={cita.estatus.toLowerCase()}
                  >
                    <p><strong>Cliente:</strong> {cita.nombreCliente}</p>
                    <p><strong>Teléfono:</strong> {cita.telefono}</p>
                    <p><strong>Fecha:</strong> {cita.fecha} ({cita.diaSemana})</p>
                    <p><strong>Horario:</strong> {cita.horaCompleta}</p>
                    <p><strong>Asunto:</strong> {cita.asunto}</p>
                    <p><strong>Estado:</strong> 
                      <span className={`status-${cita.estatus.toLowerCase()}`}>
                        {cita.estatus}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="no-citas">
                  No hay citas registradas en este período
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Gráfico principal */}
      <div className="chart-container">
        <h1>Total de Citas</h1>
        <div className="date-filters">
          <div className="date-filter">
            <label>Desde: </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="date-filter">
            <label>Hasta: </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
        <LineChart 
          width={1200} 
          height={650} 
          data={groupedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="fecha" 
            tickFormatter={(date) => dayjs(date).format('DD/MM')}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, value === 1 ? 'cita' : 'citas']}
            labelFormatter={(date) => dayjs(date).format('DD/MM/YYYY')}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Agendadas" 
            stroke="rgb(177, 177, 177)" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Atendidas" 
            stroke="gray" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Canceladas" 
            stroke="black" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default Recuento;