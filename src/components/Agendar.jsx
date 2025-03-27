import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Agendar.css';

const Agendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [citas, setCitas] = useState({});
    const [diasNoLaborables, setDiasNoLaborables] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        horaInicio: '',
        horaFin: '',
        asunto: ''
    });
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
            const response = await axios.get(`${API_URL}/api/Horarios/disponibles?dia=${diaSemana}&fecha=${fecha}`);
            
            // Verifica la respuesta del backend
            console.log("Horarios disponibles:", response.data);

            // Asigna los horarios al estado
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
    
        if (name === "horario") {
            // Dividir el valor seleccionado en horaInicio y horaFin
            const [horaInicio, horaFin] = value.split('-');
            setFormData({
                ...formData,
                horaInicio: horaInicio.trim(),
                horaFin: horaFin.trim()
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Obtener el idUsuario del localStorage
            const idUsuario = localStorage.getItem('idUsuario'); // Asegúrate de guardar el idUsuario en el localStorage al iniciar sesión
    
            // Crear el objeto con los datos a enviar
            const datosCita = {
                idUsuario: parseInt(idUsuario), // Convertir a número
                fecha: selectedDate,
                horaInicio: formData.horaInicio,
                horaFin: formData.horaFin,
                telefono: formData.telefono,
                estatus: 1, // Estatus por defecto
                asunto: formData.asunto
            };
    
            // Imprimir los datos en la consola
            console.log("Datos a enviar:", datosCita);
    
            // Enviar los datos al backend
            const response = await axios.post(`${API_URL}/api/Citas`, datosCita);
            
            alert('Cita agendada con éxito');
            fetchCitas();
            setFormData({ nombre: '', telefono: '', horaInicio: '', horaFin: '', asunto: '' });
            setSelectedDate(null);
        } catch (error) {
            console.error('Error al agendar la cita', error);
            alert(error.response?.data || 'Error al agendar la cita');
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
        <>
            <h1 className='title'>Agendar Cita</h1>
            <div className="container-agendar">
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
                        <form onSubmit={handleSubmit}>
                            <label>Fecha Seleccionada: {selectedDate}</label>
                            
                            <label>
                                Teléfono:
                                <input type="number" name="telefono" value={formData.telefono} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Horario:
                                <select name="horario" value={formData.horario} onChange={handleInputChange} required>
                                    <option value="">Seleccione un horario</option>
                                    {horariosDisponibles.map((horario, index) => (
                                        <option key={index} value={`${horario.horaInicio}-${horario.horaFin}`}>
                                            {horario.horaInicio} - {horario.horaFin}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>Asunto: <br />
                                <textarea name="asunto" className='asunto' value={formData.asunto} onChange={handleInputChange}></textarea>
                            </label>
                            <button type="submit" className='btn-agendar'>Agendar Cita</button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default Agendar;