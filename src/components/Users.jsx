import { useEffect, useState } from "react";
import "./Users.css";
import axios from "axios";
import { FaTrashAlt, FaRedo } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // Nuevo estado para el filtro de estatus
  const MySwal = withReactContent(Swal);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/Usuarios`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Función para reactivar usuario
  const handleReactivate = async (userId) => {
    const result = await MySwal.fire({
      title: <strong>¿Reactivar este usuario?</strong>,
      html: <i>El usuario volverá a estar activo en el sistema</i>,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`${API_URL}/api/Usuarios/${userId}/reactivar`);
        Swal.fire(
          "¡Usuario reactivado!",
          "El usuario ha sido reactivado correctamente.",
          "success"
        );
        fetchUsers(); // Actualizar la lista de usuarios
      } catch (error) {
        console.error("Error al reactivar usuario:", error);
        Swal.fire(
          "Error",
          error.response?.data || "Error al reactivar el usuario.",
          "error"
        );
      }
    }
  };

  // Filtros combinados
  const filteredUsers = users.filter(
    (user) =>
      (selectedRol === "" || user.rol.toLowerCase() === selectedRol) &&
      (selectedStatus === "" || user.estatus.toString() === selectedStatus) &&
      (user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Número de elementos por página

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Completar con filas vacías si hay menos de 10 registros
  const emptyRowsCount = itemsPerPage - currentItems.length;
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, index) => ({
    id: `empty-${index}`,
    isEmpty: true,
  }));

  const rowsToDisplay = [...currentItems, ...emptyRows];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (idUser) => {
    const result = await MySwal.fire({
      title: <strong>¿Estás seguro de eliminar este Usuario?</strong>,
      html: <i>¡Puedes reactivar el usuario después!</i>,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/Usuarios/${idUser}`);
        Swal.fire(
          "Usuario Eliminado!",
          "El Usuario ha sido eliminado correctamente.",
          "success"
        );
        fetchUsers();
      } catch (error) {
        console.error("Error al eliminar el usuario: ", error);
        Swal.fire(
          "Error",
          error.response?.data || "Error al eliminar el usuario.",
          "error"
        );
      }
    }
  };


  const handleEdit = (user) => {
    MySwal.fire({
      title: `Editar Rol de ${user.nombre}`,
      html:
        `<div class="swal2-edit-form">
          <input class="swal2-input" placeholder="Nombre" value="${user.nombre}" disabled>
          <input class="swal2-input" placeholder="Apellido Paterno" value="${user.apellido1}" disabled>
          <input class="swal2-input" placeholder="Apellido Materno" value="${user.apellido2 || ''}" disabled>
          <input class="swal2-input" placeholder="Correo" value="${user.correo}" disabled>
          <select id="swal-input-rol" class="swal2-select">
            <option value="cliente" ${user.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
            <option value="CO" ${user.rol === 'CO' ? 'selected' : ''}>Contador</option>
            <option value="A" ${user.rol === 'A' ? 'selected' : ''}>Administrador</option>
          </select>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          rol: document.getElementById('swal-input-rol').value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`${API_URL}/api/Usuarios/${user.id}/rol`, {
            nuevoRol: result.value.rol
          });

          Swal.fire(
            '¡Rol actualizado!',
            `El rol de ${user.nombre} ha sido modificado a ${getRolDisplayName(result.value.rol)}`,
            'success'
          );
          fetchUsers();
        } catch (error) {
          Swal.fire(
            'Error',
            error.response?.data?.message || 'Error al actualizar el rol',
            'error'
          );
        }
      }
    });
  };

  // Función auxiliar para mostrar nombres de roles
  const getRolDisplayName = (rol) => {
    switch (rol) {
      case 'CO': return 'Contador';
      case 'A': return 'Administrador';
      default: return 'Cliente';
    }
  };


  return (
    <div className="users-container">
      <div className="table-background">
        <h1>Tabla de Usuarios</h1>
        <div className="filters">
          <select
            className="select-rol"
            value={selectedRol}
            onChange={(e) => setSelectedRol(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="cliente">Cliente</option>
            <option value="co">Contador</option>
            <option value="a">Administrador</option>
          </select>



          <label className="search-bar">
            Buscar:{" "}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, correo o rol"
            />
          </label>

          <select
            className="select-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>

        <div className="table-container">
          <table className="tbl-users">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Último acceso</th>
                <th>Acciones</th>
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
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td>
                      {row.nombre} {row.apellido1} {row.apellido2}
                    </td>
                    <td>{row.correo}</td>
                    <td>
                      {row.rol === "cliente"
                        ? "Cliente"
                        : row.rol === "CO"
                          ? "Contador"
                          : "Administrador"}
                    </td>
                    <td>
                      {row.estatus === 1 ? (
                        <span className="status-active">Activo</span>
                      ) : (
                        <span className="status-inactive">Inactivo</span>
                      )}
                    </td>
                    <td>{row.fechaRegistro}</td>
                    <td>{row.ultimaConexion}</td>
                    <td className="acciones">
                      {row.estatus === 0 ? (
                        <FaRedo
                          size={18}
                          className="btn-reactivate"
                          onClick={() => handleReactivate(row.id)}
                          title="Reactivar usuario"
                        />
                      ) : (
                        (row.rol === 'cliente' || row.rol === 'CO') && (
                          <FaTrashAlt
                            size={18}
                            className="btn-delete"
                            onClick={() => handleDelete(row.id)}
                            title="Desactivar usuario"
                          />
                        )
                      )}
                      <TiPencil
                        size={22}
                        className="btn-edit-user"
                        onClick={() => handleEdit(row)}
                        title="Cambiar rol"
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(filteredUsers.length / itemsPerPage) },
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


      <div className="user-modal">
        <form action="">

        </form>
      </div>

    </div>
  );
};

export default Users;