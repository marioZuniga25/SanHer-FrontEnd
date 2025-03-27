import { useEffect, useState } from "react";
import "./MisCitas.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const idUsuario = localStorage.getItem("idUsuario");
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    const response = await axios.get(
      `${API_URL}/api/Citas/MisCitas?id=${idUsuario}`
    );
    setCitas(response.data);
  };

  const handleCloseModal = () => {
    setCitaSeleccionada(false);
  };

  const handleCancel = async (idCita) => {
    console.log("El horario con id " + idCita + " se cancelará.");
    const result = await MySwal.fire({
      title: <strong>¿Estás seguro de cancelar la cita?</strong>,
      html: <i>¡No podrás deshacer esta acción!</i>,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, Cancelarla",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${API_URL}/api/Citas/${idCita}/cancelar`);
        console.log("El horario con id " + idCita + " se canceló.");
        Swal.fire(
          "¡Cita Cancelada!",
          "La cita ha sido cancelada correctamente.",
          "success"
        );
        fetchCitas();
        handleCloseModal();
      } catch (error) {
        console.error("Error al cancelar la cita: ", error);
        Swal.fire(
          "Error",
          error.response?.data || "Error al cancelar la cita.",
          "error"
        );
      }
    }
  };

  return (
    <div className="mis-citas-container">
      <h1>Mis Citas</h1>
      <div className="citas-container-divs">
        <div className="citas-list">
          <ul>
            {citas.map((cita, index) => (
              <li key={index} onClick={() => setCitaSeleccionada(cita)}>
                <div className="cita-card-c">
                  <h2>
                    {new Date(cita.fecha).toLocaleDateString("es-MX", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {citaSeleccionada && (
          <div className="detalle-cita">
            <h2>
              Cita del{" "}
              {new Date(citaSeleccionada.fecha).toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <br />
            <p>
              <strong>Nombre:</strong> {citaSeleccionada.nombre} 
            </p>
            <p>
              <strong>Hora:</strong> {citaSeleccionada.hora}
            </p>
            <p>
              <strong>Asunto:</strong> {citaSeleccionada.asunto}
            </p>
            <p>
              <strong>Teléfono:</strong> {citaSeleccionada.telefono}
            </p>
            <p>
              <strong>Estatus:</strong>{" "}
              {citaSeleccionada.estatus === 1
                ? "Agendada"
                : citaSeleccionada.estatus === 2
                ? "Atendida"
                : "Cancelada"}
            </p>
            <IoClose
              className="close-detail"
              size={30}
              onClick={() => handleCloseModal()}
            />
            <button className="btn-cancel" onClick={() => handleCancel(citaSeleccionada.id)}>Cancelar Cita</button>
          </div>
        )}
      </div>
    </div>
  );
};


export default MisCitas;