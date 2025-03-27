import { useState, useEffect } from 'react';
import './Profile.css';
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    apellido1: '',
    apellido2: '',
    ultimaConexion: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Obtener el idUsuario del localStorage
  const userId = localStorage.getItem('idUsuario');
  const token = localStorage.getItem('token'); // Asumiendo que el token también está en el localStorage

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setFormData({
            nombre: userData.nombre,
            apellido1: userData.apellido1,
            apellido2: userData.apellido2,
            correo: userData.correo,
            ultimaConexion: new Date(userData.ultimaConexion).toLocaleString()
          });
        } else {
          alert("Error al cargar los datos del usuario.");
        }
      }
    };

    fetchUserData();
  }, [userId, token, API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleEdit = (status) => {
    if (status === 1) {
      setIsEditing(true);
      setIsChangingPassword(false);
    } else if (status === 2) {
      // Mostrar un cuadro de diálogo para ingresar la contraseña actual
      const currentPassword = prompt("Por favor, ingresa tu contraseña actual para confirmar los cambios:");
      if (currentPassword) {
        setPasswordData({ ...passwordData, currentPassword });
        saveProfileChanges(currentPassword);
      } else {
        alert("Debes ingresar tu contraseña actual para guardar los cambios.");
      }
    } else if (status === 3) {
      setIsEditing(false);
    }
  };

  const handleEditPassword = () => {
    setIsChangingPassword(true);
    setIsEditing(false);
  }

  const handleChangePassword = () => {
    
    if (passwordData.newPassword === passwordData.confirmNewPassword) {
      savePasswordChanges();
    } else {
      alert("Las contraseñas no coinciden.");
    }
  };

  const saveProfileChanges = async (currentPassword) => {
    const response = await fetch(`${API_URL}/api/usuarios/update-profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        correo: formData.correo,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        currentPassword: currentPassword
      })
    });

    if (response.ok) {
      setIsEditing(false);
      alert("Perfil actualizado correctamente.");
    } else {
      alert("Error al actualizar el perfil. Verifica tu contraseña actual.");
    }
  };

  const savePasswordChanges = async () => {
    const response = await fetch(`${API_URL}/api/usuarios/change-password/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      })
    });

    if (response.ok) {
      setIsChangingPassword(false);
      alert("Contraseña cambiada correctamente.");
    } else {
      alert("Error al cambiar la contraseña. Verifica tu contraseña actual.");
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-form">
          <FaUserCircle size={150} className="icono-user-profile" />

          {isEditing ? (
            <form>
              <label>Nombre: <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} /></label> <br />
              <label>Apellido 1: <input type="text" name="apellido1" value={formData.apellido1} onChange={handleInputChange} /></label> <br />
              <label>Apellido 2: <input type="text" name="apellido2" value={formData.apellido2} onChange={handleInputChange} /></label> <br />
              <label>Correo: <input type="text" name="correo" value={formData.correo} onChange={handleInputChange} /></label><br />
              <p><strong>Última Conexión:</strong> {formData.ultimaConexion}</p> <br />
              <div className='btn-container'>
                <button type="button" className='btn-edit-datos' onClick={() => handleEdit(2)}>Guardar Mis Datos</button>
                <button type="button" className='btn-edit-datos' onClick={() => handleEditPassword()}>Cambiar Contraseña</button>
                <button onClick={() => handleEdit(3)} className='btn-edit-datos'>Cancelar</button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido1} {formData.apellido2}</p>
              <p><strong>Correo:</strong> {formData.correo}</p>
              <p><strong>Última Conexión:</strong> {formData.ultimaConexion}</p>
              <div className='btn-container'>
                <button onClick={() => handleEdit(1)} className='btn-edit-datos'>Editar Datos</button>
              </div>
            </div>
          )}

          {isChangingPassword && (
            <div className='pswd-change-container'>
              <h2>Cambiar Contraseña</h2>
              <label>Contraseña Actual: <br /> <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} /></label> <br />
              <label>Nueva Contraseña: <br /> <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} /></label><br />
              <label>Confirmar Nueva Contraseña: <br /> <input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} /></label><br />
              <div className='btn-container'>
                <button type="button" className='btn-edit-datos' onClick={handleChangePassword}>Cambiar Contraseña</button>
                <button type="button" className='btn-edit-datos' onClick={() => setIsChangingPassword(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;