import React, { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import logo from "../img/logo Sanher.jpeg";
import Spinner from "./Spinner"; // Importa el componente Spinner
import "./LoginRegister.css";
import axios from "axios";

const LoginRegister = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el spinner
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsRegister(!isRegister);
  };

  //------------------------------------------------------------------------------------------------------------
  //----------------------------------Register------------------------------------------------------------------
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    rol: "",
    correo: "",
    contrasenia: "",
    confirmarContrasenia: "",
  });

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    if (registerData.contrasenia !== registerData.confirmarContrasenia) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const usuario = {
      nombre: registerData.nombre,
      apellido1: registerData.apellido1,
      apellido2: registerData.apellido2,
      correo: registerData.correo,
      contrasenia: registerData.contrasenia,
      confirmarContrasenia: registerData.confirmarContrasenia,
      rol: "cliente",
    };

    try {
      setIsLoading(true); // Activar el spinner
      const response = await fetch(`${API_URL}/api/Usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert(error.message);
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  //-----------------------------------------------------------------------------------------------------------------------------------
  //---------------------------Login---------------------------------------------------------------------------------------------------
  const [loginData, setLoginData] = useState({
    correo: "",
    contrasenia: "",
  });

  const handleChangeLogin = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    const credenciales = {
      correo: loginData.correo,
      contrasenia: loginData.contrasenia,
    };

    try {
      setIsLoading(true); // Activar el spinner
      const response = await fetch(`${API_URL}/api/Usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credenciales),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("correo", data.correo);
        localStorage.setItem("apellido1", data.apellido1);
        localStorage.setItem("apellido2", data.apellido2);
        localStorage.setItem("idUsuario", data.idUsuario);
        localStorage.setItem("rol", data.rol);

        if (data.rol === 'CO' || data.rol === 'A') {
          try {
              
              const fechaActual = new Date();
              const fechaFormateada = fechaActual.toISOString().split('T')[0];
              
              const auditoriaData = {
                  idUsuario: data.idUsuario,
                  accion: "Inicio de sesión",
                  fecha: fechaFormateada, 
                  tablaAfectada: "Usuarios",
                  descripcion: `El usuario ${data.rol === 'CO' ? 'contador' : 'administrador'}: ${data.nombre} ${data.apellido1} ${data.apellido2} ha iniciado sesión`
              };
      
      
              await axios.post(`${API_URL}/api/Auditorias`, auditoriaData, {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${data.token}`
                  }
              });
              
          } catch (error) {
              console.error("Ha ocurrido un error al guardar la auditoria.");
          }
      }



        navigate("/landing");
      } else {
        throw new Error("No se recibió un token válido.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  return (
    <div className="container">
      {/* Mostrar el spinner como ventana flotante */}
      {isLoading && <Spinner />}

      {/* Formulario de Login */}
      <div className="form-section left-section">
        <h1 className="titulo">Registrarse</h1>
        <form onSubmit={handleSubmitRegister}>
          <label htmlFor="nombre">Nombre:</label>
          <div className="input-container">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={registerData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="apellido1">Apellido 1:</label>
          <div className="input-container">
            <input
              type="text"
              name="apellido1"
              placeholder="Apellido 1"
              value={registerData.apellido1}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="apellido2">Apellido 2:</label>
          <div className="input-container">
            <input
              type="text"
              name="apellido2"
              placeholder="Apellido 2"
              value={registerData.apellido2}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="correo">Correo Electrónico:</label>
          <div className="input-container">
            <input
              type="email"
              name="correo"
              placeholder="Correo Electrónico"
              value={registerData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="contrasenia">Contraseña:</label>
          <div className="input-container">
            <input
              type="password"
              name="contrasenia"
              placeholder="Contraseña"
              value={registerData.contrasenia}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="confirmarContrasenia">Confirmar Contraseña:</label>
          <div className="input-container">
            <input
              type="password"
              name="confirmarContrasenia"
              placeholder="Confirmar Contraseña"
              value={registerData.confirmarContrasenia}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={isLoading}>
            Crear cuenta
          </button>
        </form>
        <p>
          ¿Ya tienes una cuenta?{" "}
          <a onClick={toggleForm} className="toggle-btn">
            Inicia sesión aquí
          </a>
        </p>
      </div>

      {/* Panel móvil negro con logotipo */}
      <div className={`logo-panel ${isRegister ? "move-right" : "move-left"}`}>
        <img className="logo" src={logo} alt="" />
      </div>

      {/* Formulario de Registro */}
      <div className="form-section right-section">
        <h1 className="titulo">Iniciar Sesión</h1>
        <form onSubmit={handleSubmitLogin}>
          <label htmlFor="correo">Correo Electrónico:</label>
          <div className="input-container">
            <FaUser size={25} />
            <input
              type="email"
              name="correo"
              placeholder="Correo Electrónico"
              value={loginData.correo}
              onChange={handleChangeLogin}
              required
            />
          </div>

          <label htmlFor="contrasenia">Contraseña:</label>
          <div className="input-container">
            <RiLockPasswordFill size={25} />
            <input
              type="password"
              name="contrasenia"
              placeholder="Contraseña"
              value={loginData.contrasenia}
              onChange={handleChangeLogin}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            Iniciar sesión
          </button>
        </form>
        <p>
          ¿No tienes cuenta?{" "}
          <a onClick={toggleForm} className="toggle-btn">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;