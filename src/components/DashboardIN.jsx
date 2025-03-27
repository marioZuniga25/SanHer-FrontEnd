import './DashboardIN.css';
import { FaRegCalendarCheck } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { FaUserCog } from "react-icons/fa";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { VscChecklist } from "react-icons/vsc";
import { FaRegCalendarAlt } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const DashboardIN = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [citasHoy, setCitasHoy] = useState({});
    const [cDiaSemanaChart, setCDiaSemanaChart] = useState([]);

    const data = [
        { name: 'Lunes', Atendidas: 400, Canceladas: 200 },
        { name: 'Martes', Atendidas: 300, Canceladas: 100 },
        { name: 'Miercoles', Atendidas: 200, Canceladas: 50 },
        { name: 'Jueves', Atendidas: 100, Canceladas: 30 },
        { name: 'Viernes', Atendidas: 250, Canceladas: 10 },
    ];

    useEffect(() => {
        fetchCitasHoy();
        fetchCitasDiaSemanaChart();
    }, []);

    const fetchCitasHoy = async () => {
        try {
            const idContador = localStorage.getItem("idUsuario");
            const response = await axios.get(`${API_URL}/api/Citas/miscitashoy`, {
                params: { idContador }
            });
            setCitasHoy(response.data);
            console.log("Citas del usuario " + idContador + ": " + JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error('Error al obtener citas de hoy', error);
        }
    }

    const fetchCitasDiaSemanaChart = async () => {
        try {
            const idContador = localStorage.getItem("idUsuario");
            const response = await axios.get(`${API_URL}/api/Citas/contador/${idContador}`);
            setCDiaSemanaChart(response.data || []);
            console.log("Citas del usuario por dia de la semana " + idContador + ": " + JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error('Error al obtener citas por dia de la semana', error);
            setCDiaSemanaChart([]);
        }
    }

    return (
        <>
            <div className="dashboard-options">
                <Link to="/landing/myschedule" className="d-option"><h1>Citas</h1><FaRegCalendarCheck size={100} color='f4a523'/></Link>
                <Link to="/landing/report" className="d-option"><h1>Reportes</h1><TbReportAnalytics size={100} color='f4a523'/></Link>
                <Link to="/landing/profile" className="d-option"><h1>Mi Perfil</h1><FaUserCog size={100} color='f4a523'/></Link>
                <Link to="/landing/horarios" className="d-option"><h2>Mis Horarios</h2><RiCalendarScheduleLine size={90} color='f4a523' /></Link>
            </div>
            <div className="dashboard-container">
                <div className="analytics">
                    <h2>Mis Citas Atendidas <VscChecklist size={30} /></h2>
                    <div className="charts-container">
                        <ResponsiveContainer width={600} height={400}>
                            <BarChart data={cDiaSemanaChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fill: 'black' }} />
                                <YAxis tick={{ fill: 'black' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', color: 'black' }} shared={true} />
                                <Legend wrapperStyle={{ color: 'black' }} />
                                <Bar dataKey="atendidas" stackId="a" fill="gray" radius={5} />
                                <Bar dataKey="canceladas" stackId="a" fill="#000000" radius={5} />
                            </BarChart>
                        </ResponsiveContainer>

                        <BarChart width={600} height={400} data={data}>
                            <XAxis dataKey="name" tick={{ fill: 'black' }} />
                            <YAxis tick={{ fill: 'black' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', color: 'black' }} />
                            <Legend wrapperStyle={{ color: 'black' }} />
                            <Bar dataKey="Atendidas" fill="gray" />
                        </BarChart>

                    </div>
                </div>
                <div className="citas-hoy">
                    <h2>Citas De Hoy <FaRegCalendarAlt size={30} /></h2>
                    <div className="citas-list">
                        {citasHoy.length > 0 ? (
                            citasHoy.map((cita) => (
                                <div key={cita.id} className="D-cita-card">
                                    <div className="cita-header">
                                        <span className="nombre-cliente">{cita.nombre}</span>
                                        <span className="D-detalle-texto">De click para más detalles</span>
                                    </div>
                                    <p className="asunto-cita"><strong>Asunto:</strong> {cita.asunto}</p>
                                    <div className="hora-container">
                                        <span className="reloj-icon">🕰️</span>
                                        <span className="hora-cita">{cita.hora}</span>
                                    </div>
                                </div>

                            ))
                        ) : (
                            <p>No tienes citas hoy.</p>
                        )}
                    </div>
                </div>

            </div>
        </>
    )
}

export default DashboardIN;