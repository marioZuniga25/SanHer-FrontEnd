import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Agendar.css';

export const Agendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [citas, setCitas] = useState({});
    const [diasNoLaborables, setDiasNoLaborables] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', telefono: '', horario: '' });
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchDiasNoLaborables();
        fetchCitas();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchHorariosDisponibles(selectedDate);
        }
    }, [selectedDate]);

    const fetchDiasNoLaborables = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Citas/diasnolaborables`);
            setDiasNoLaborables(response.data);
        } catch (error) {
            console.error('Error al obtener días no laborables', error);
        }
    };

    const fetchCitas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Citas`);
            setCitas(response.data);
        } catch (error) {
            console.error('Error al obtener citas', error);
        }
    };

    const fetchHorariosDisponibles = async (fecha) => {
        try {
            const diaSemana = new Date(fecha).getDay();
            const response = await axios.get(`${API_URL}/api/horarios?dia=${diaSemana}`);
            setHorariosDisponibles(response.data);
        } catch (error) {
            console.error('Error al obtener horarios disponibles', error);
        }
    };

    const esDiaNoLaborable = (dateKey) => {
        const fecha = new Date(dateKey);
        const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
        const esFeriado = diasNoLaborables.some(d => d.fecha === dateKey);
        return esFinDeSemana || esFeriado;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos a enviar:', {
            fecha: selectedDate,
            ...formData
        });
        try {
            await axios.post(`${API_URL}/api/Citas`, {
                fecha: selectedDate,
                ...formData
            });
            alert('Cita agendada con éxito');
            fetchCitas();
            setFormData({ nombre: '', correo: '', horario: '' });
            setSelectedDate(null);
        } catch (error) {
            console.error('Error al agendar la cita', error);
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const citasDelDia = citas[dateKey] || [];
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

    return (
        <div className="container">
            <div className="calendar">
                <div className="header">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                    <h2>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
                </div>
                <div className="days-grid">{renderCalendar()}</div>
            </div>
            {selectedDate && (
                <div className="form-container">
                    <h3>Agendar Cita para {selectedDate}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Nombre:
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                        </label>
                        <label>
                            Correo:
                            <input type="number" name="telefono" value={formData.telefono} onChange={handleInputChange} required />
                        </label>
                        <label>
                            Horario:
                            <select name="horario" value={formData.horario} onChange={handleInputChange} required>
                                <option value="">Seleccione un horario</option>
                                {horariosDisponibles.map((horario, index) => (
                                    <option key={index} value={horario.id}>{horario.horaInicio} - {horario.horaFin}</option>
                                ))}

                            </select>
                        </label>
                        <button type="submit">Agendar Cita</button>
                    </form>
                </div>
            )}
        </div>
    );
};
