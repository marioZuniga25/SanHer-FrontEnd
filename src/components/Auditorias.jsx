import { useEffect, useState } from "react";
import "./Auditorias.css";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Auditorias = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAuditoria, setSelectedAuditoria] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const MySwal = withReactContent(Swal);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAuditorias();
    // Establecer fecha por defecto (últimos 30 días)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    setStartDate(defaultStartDate.toISOString().split('T')[0]);
    setEndDate(defaultEndDate.toISOString().split('T')[0]);
  }, []);

  const fetchAuditorias = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/Auditorias`);
      // Obtener nombres de usuarios para cada auditoría
      const auditoriasConNombres = await Promise.all(
        response.data.map(async (auditoria) => {
          try {
            const userResponse = await axios.get(`${API_URL}/api/Usuarios/${auditoria.idUsuario}`);
            return {
              ...auditoria,
              nombreUsuario: `${userResponse.data.nombre} ${userResponse.data.apellido1}`
            };
          } catch (error) {
            return {
              ...auditoria,
              nombreUsuario: "Usuario no encontrado"
            };
          }
        })
      );
      setAuditorias(auditoriasConNombres);
    } catch (error) {
      console.error("Error fetching auditorias:", error);
    }
  };

  // Filtros combinados
  const filteredAuditorias = auditorias.filter(
    (auditoria) =>
      (startDate === "" || auditoria.fecha >= startDate) &&
      (endDate === "" || auditoria.fecha <= endDate) &&
      (auditoria.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
       auditoria.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
       auditoria.tablaAfectada.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuditorias.slice(indexOfFirstItem, indexOfLastItem);

  const emptyRowsCount = itemsPerPage - currentItems.length;
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, index) => ({
    id: `empty-${index}`,
    isEmpty: true,
  }));

  const rowsToDisplay = [...currentItems, ...emptyRows];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleClearFilters = () => {
    setSearchTerm("");
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    setStartDate(defaultStartDate.toISOString().split('T')[0]);
    setEndDate(defaultEndDate.toISOString().split('T')[0]);
  };

  const handleRowClick = (auditoria) => {
    if (!auditoria.isEmpty) {
      setSelectedAuditoria(auditoria);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAuditoria(null);
  };

  return (
    <div className="auditorias-container">
      <div className="table-background">
        <h1>Registro de Auditorías</h1>
        <div className="filters">
          <div className="date-filters">
            <label>
              Fecha inicial:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Fecha final:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <label className="search-bar">
            Buscar:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Usuario, acción o tabla"
            />
          </label>

          <button 
            className="btn-clear-filters"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="table-container">
          <table className="tbl-auditorias">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Fecha</th>
                <th>Tabla Afectada</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {rowsToDisplay.map((row, index) =>
                row.isEmpty ? (
                  <tr key={row.id}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ) : (
                  <tr 
                    key={index}
                    onClick={() => handleRowClick(row)}
                    className="clickable-row"
                  >
                    <td>{row.nombreUsuario}</td>
                    <td>{row.accion}</td>
                    <td>{new Date(row.fecha).toLocaleDateString()}</td>
                    <td>{row.tablaAfectada}</td>
                    <td className="descripcion-cell">{row.descripcion}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(filteredAuditorias.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedAuditoria && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h2>Detalles de Auditoría</h2>
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Usuario:</span>
                <span>{selectedAuditoria.nombreUsuario}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Acción:</span>
                <span>{selectedAuditoria.accion}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha:</span>
                <span>{new Date(selectedAuditoria.fecha).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tabla Afectada:</span>
                <span>{selectedAuditoria.tablaAfectada}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Descripción:</span>
                <span className="detail-value">{selectedAuditoria.descripcion}</span>
              </div>
              {selectedAuditoria.datosAnteriores && (
                <div className="detail-row">
                  <span className="detail-label">Datos Anteriores:</span>
                  <pre className="detail-value">
                    {JSON.stringify(selectedAuditoria.datosAnteriores, null, 2)}
                  </pre>
                </div>
              )}
              {selectedAuditoria.datosNuevos && (
                <div className="detail-row">
                  <span className="detail-label">Datos Nuevos:</span>
                  <pre className="detail-value">
                    {JSON.stringify(selectedAuditoria.datosNuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditorias;