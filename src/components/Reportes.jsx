import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import './Reportes.css';
import logo from '../img/logo Sanher.jpeg';

const Reportes = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [reporte, setReporte] = useState(null);
    const [filtros, setFiltros] = useState({
        startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
    });
    const [loading, setLoading] = useState(false);
    const [contadorInfo, setContadorInfo] = useState(null);

    useEffect(() => {
        setContadorInfo({
            id: localStorage.getItem("idUsuario"),
            nombre: `${localStorage.getItem("nombre")} ${localStorage.getItem("apellido1")} ${localStorage.getItem("apellido2")}`
        });
    }, []);

    const generarReporte = async () => {
        if (!contadorInfo?.id) return;

        setLoading(true);
        try {
            const params = {
                startDate: filtros.startDate,
                endDate: filtros.endDate,
                contadorId: contadorInfo.id
            };

            const response = await axios.get(`${API_URL}/api/Citas/reporte-contador`, { params });
            
            // Asegurar que las citas vengan en el formato correcto
            const citasFormateadas = response.data?.citas?.map(cita => ({
                ...cita,
                Estado: cita.estatus === 1 ? "Pendiente" : 
                       cita.estatus === 2 ? "Atendida" : 
                       cita.estatus === 3 ? "Cancelada" : "Desconocido"
            })) || [];

            setReporte({
                FechaInicio: response.data?.fechaInicio,
                FechaFin: response.data?.fechaFin,
                TotalAtendidas: response.data?.totalAtendidas,
                TotalCanceladas: response.data?.totalCanceladas,
                Contador: contadorInfo.nombre,
                Citas: citasFormateadas
            });


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
                        descripcion: `El usuario ${rol === 'CO' ? 'contador' : 'administrador'}: ${nombre} ha generado un reporte de citas.`
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
            console.error("Error generando reporte:", error);
            alert("Error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        generarReporte();
    };

    const imprimirReporte = async() => {
        // Agregar clase al body para el modo impresión
        document.body.classList.add('printing');
        
        // Crear y agregar el encabezado con logo
        const printHeader = document.createElement('div');
        printHeader.className = 'print-header';
        
        // Crear elemento img con estilos inline
        const logoImg = document.createElement('img');
        logoImg.src = logo;
        logoImg.alt = "Logo Empresa";
        logoImg.style.maxWidth = "70px"; // Tamaño más pequeño
        logoImg.style.height = "auto";
        logoImg.style.marginBottom = "10px";
        logoImg.className = "print-logo";
        
        const title = document.createElement('h2');
        title.textContent = 'Reporte de Citas';
        
        printHeader.appendChild(logoImg);
        printHeader.appendChild(title);
        
        const reportContainer = document.querySelector('.reporte-container');
        if (reportContainer) {
            reportContainer.prepend(printHeader);
        }
        
        // Imprimir
        window.print();
        
        // Limpiar después de imprimir
        setTimeout(() => {
            document.body.classList.remove('printing');
            printHeader.remove();
        }, 500);



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
                        accion: "Generación de reporte",
                        fecha: fechaFormateada,
                        tablaAfectada: "Citas",
                        descripcion: `El usuario ${rol === 'CO' ? 'contador' : 'administrador'}: ${nombre} ha realizado la impresion de un reporte en PDF.`
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

    return (
        <div className="reportes-container">
            <h1 className='title'>Reporte de Citas</h1>

            <form onSubmit={handleSubmit} className="filtros-form">
                <div className="form-group">
                    <label>Fecha Inicio:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filtros.startDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Fecha Fin:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filtros.endDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                

                <button type="submit" disabled={loading}>
                    {loading ? 'Generando...' : 'Generar Reporte'}
                </button>
            </form>

            {reporte && reporte.Citas && (
                <div className="reporte-container">
                    <div className="reporte-header">
                        <h2>REPORTE: {reporte.FechaInicio} - {reporte.FechaFin}</h2>
                        <p>TOTAL DE CITAS ATENDIDAS: {reporte.TotalAtendidas}</p>
                        <p>TOTAL DE CITAS CANCELADAS: {reporte.TotalCanceladas}</p>
                        <p>USUARIO RESPONSABLE: {reporte.Contador}</p>
                    </div>

                    <table className="reporte-table">
                        <thead>
                            <tr>
                                <th>CLIENTE</th>
                                <th>ASUNTO</th>
                                <th>FECHA</th>
                                <th>HORA</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reporte.Citas.map((cita, index) => (
                                <tr key={index}>
                                    <td>{cita.cliente}</td>
                                    <td>{cita.asunto}</td>
                                    <td>{cita.fecha}</td>
                                    <td>{cita.hora}</td>
                                    <td className={`estado-${cita.Estado.toLowerCase()}`}>
                                        {cita.Estado}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="reporte-footer">
                        <button onClick={imprimirReporte} className="print-button">
                            Imprimir Reporte
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reportes;