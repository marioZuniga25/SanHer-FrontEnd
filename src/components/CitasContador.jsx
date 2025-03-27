import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CitasContador.css';
import { IoClose } from "react-icons/io5";
import { FaCircleXmark } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

const CitasContador = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [citas, setCitas] = useState([]);
    const [selectedCita, setSelectedCita] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    const idContador = localStorage.getItem('idUsuario');

    useEffect(() => {
        if (selectedDate) {
            fetchCitasContador(selectedDate);
        }
    }, [selectedDate]);

    const fetchCitasContador = async (fecha) => {
        try {
            const [year, month, day] = fecha.split('-');
            const fechaFormateada = `${day}-${month}-${year}`;

            const response = await axios.get(`${API_URL}/api/Citas/miagenda?idContador=${idContador}&fecha=${fechaFormateada}`);
            setCitas(response.data);
            console.log("Citas del usuario para el dia " + selectedDate + ": " + idContador + ": " + JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error('Error al obtener las citas', error);
        }
    };

    const esDiaNoLaborable = (dateKey) => {
        const fecha = new Date(dateKey);
        return fecha.getDay() === 0 || fecha.getDay() === 6;
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        const days = [];

        // Días de la semana (iniciales)
        const diasSemana = ["S", "D", "L", "M", "M", "J", "V"];

        // Agregar los días de la semana
        diasSemana.forEach((dia, index) => {
            days.push(
                <div key={`dia-semana-${index}`} className="day dia-semana">
                    {dia}
                </div>
            );
        });

        // Agregar días vacíos para alinear el primer día del mes
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="day empty"></div>);
        }

        // Agregar los días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const citasDelDia = citas.filter(c => c.Fecha === dateKey);
            const estadoDia = esDiaNoLaborable(dateKey) ? 'cupo-completo' : citasDelDia.length > 0 ? 'cupo-medio' : 'libre';
            days.push(
                <div
                    key={dateKey}
                    className={`day ${estadoDia} ${selectedDate === dateKey ? 'selected' : ''}`}
                    onClick={() => !esDiaNoLaborable(dateKey) && setSelectedDate(dateKey)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    const handleCitaClick = async (cita) => {
        setSelectedCita(cita);

        const rol = localStorage.getItem("rol");
        const idUsuario = localStorage.getItem("idUsuario");
        const nombre = `${localStorage.getItem("nombre")} ${localStorage.getItem("apellido1")} ${localStorage.getItem("apellido2")}`;
        const token = localStorage.getItem("token");

        if (rol === 'CO' || rol === 'A') {
            try {

                const fechaActual = new Date();
                const fechaFormateada = fechaActual.toISOString().split('T')[0];

                const auditoriaData = {
                    idUsuario: idUsuario,
                    accion: "Consulta",
                    fecha: fechaFormateada,
                    tablaAfectada: "Citas",
                    descripcion: `El usuario ${rol === 'CO' ? 'contador' : 'administrador'}: ${nombre} ha consultado detalles de la cita de ${cita.nombre}, para el dia ${cita.fecha} ${cita.hora}`
                };


                await axios.post(`${API_URL}/api/Auditorias`, auditoriaData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

            } catch (error) {
                console.error("Ha ocurrido un error al guardar la auditoria.");
            }
        }
    };

    const handleCambiarEstatus = async (nuevoEstatus) => {
        try {
            await axios.put(`${API_URL}/api/Citas/${selectedCita.id}/estatus`, nuevoEstatus, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSelectedCita({ ...selectedCita, estatus: nuevoEstatus });
            fetchCitasContador(selectedDate);

            const rol = localStorage.getItem("rol");
            const idUsuario = localStorage.getItem("idUsuario");
            const nombre = `${localStorage.getItem("nombre")} ${localStorage.getItem("apellido1")} ${localStorage.getItem("apellido2")}`;
            const token = localStorage.getItem("token");

            if (rol === 'CO' || rol === 'A') {
                try {

                    const fechaActual = new Date();
                    const fechaFormateada = fechaActual.toISOString().split('T')[0];

                    const auditoriaData = {
                        idUsuario: idUsuario,
                        accion: "Consulta",
                        fecha: fechaFormateada,
                        tablaAfectada: "Citas",
                        descripcion: `El usuario ${rol === 'CO' ? 'contador' : 'administrador'}: ${nombre} ha cambiado el estatus de la cita por ${nuevoEstatus === 3 ? 'Cancelada': 'Atendida'}`
                    };


                    await axios.post(`${API_URL}/api/Auditorias`, auditoriaData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                } catch (error) {
                    console.error("Ha ocurrido un error al guardar la auditoria.");
                }
            }

        } catch (error) {
            console.error('Error al cambiar el estatus de la cita');
        }
    };

    const handleClose = (window) => {
        if (window === "citas") {
            setSelectedDate(null);
        } else if (window === "detalle") {
            setSelectedCita(null);
        }
    };

    return (
        <>
            <h1 className='title'>Mi Agenda</h1>
            <div className="container-miagenda">
                <div className="calendar">
                    <div className="header">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                        <h2>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
                    </div>
                    <div className="days-grid">{renderCalendar()}</div>
                </div>
                {selectedDate && (
                    <div className="citas-container">
                        <IoClose className='close' size={30} onClick={() => handleClose("citas")} />
                        <h3>Citas para el {selectedDate}</h3>
                        <div className="citas-list">
                            {citas.map((cita, index) => (
                                <div key={index} className="cita-card" onClick={() => handleCitaClick(cita)}>
                                    <div className="cita-header">
                                        <span className="nombre-cliente">{cita.nombre}</span>
                                        <span className="detalle-texto">De click para más detalles</span>
                                    </div>
                                    <div className="cita-content">
                                        <div className="cita-column">
                                            <p className="asunto-cita"><strong>Asunto:</strong> {cita.asunto}</p>
                                            <p><strong>Teléfono:</strong> {cita.telefono}</p>
                                        </div>
                                        <div className="cita-column">
                                            <div className="hora-container">
                                                <span className="reloj-icon">🕰️</span>
                                                <span className="hora-cita">{cita.hora}</span>
                                            </div>
                                            <p><strong>Estatus:</strong> {cita.estatus === 1 ? 'Agendada' : cita.estatus === 2 ? 'Atendida' : 'Cancelada'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {selectedCita && (
                    <div className="cita-detalle">
                        <IoClose className='close' size={30} onClick={() => handleClose("detalle")} />
                        <h3>Detalles de la Cita</h3>
                        <p><strong>Nombre:</strong> {selectedCita.nombre}</p>
                        <p><strong>Fecha:</strong> {selectedCita.fecha}</p>
                        <p><strong>Hora:</strong> {selectedCita.hora}</p>
                        <p><strong>Asunto:</strong> {selectedCita.asunto}</p>
                        <p><strong>Teléfono:</strong> {selectedCita.telefono}</p>
                        <p><strong>Estatus:</strong> {selectedCita.estatus === 1 ? 'Agendada' : selectedCita.estatus === 2 ? 'Atendida' : 'Cancelada'}</p>
                        <div className="botones-estatus">
                            <button onClick={() => handleCambiarEstatus(2)}>Marcar como Atendida <FaCheckCircle /></button>
                            <button onClick={() => handleCambiarEstatus(3)}>Marcar como Cancelada <FaCircleXmark /></button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};


export default CitasContador;