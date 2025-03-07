import { useState } from "react";
import { IoMenu } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { Home } from './Home';
import { About } from './About';
import { Services } from './Services';
import { Contact } from './Contact';
import './NavBar.css';
import { NotFound } from "./NotFound";
import logo from '../img/logo Sanher.jpeg';



export const Landing = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menuColor, setMenuColor] = useState("white");
    const navigate = useNavigate();

    
    const nombreUsuario = localStorage.getItem("nombre");
    const apellido1 = localStorage.getItem("apellido1");
    const apellido2 = localStorage.getItem("apellido2");
    const correo = localStorage.getItem("correo");
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setMenuColor(isSidebarOpen ? 'white' : '#f4a523');
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");  // Redirige al login después de cerrar sesión
    };


    return (
        <div className="landing-container">
            {/* NavBar */}
            <div className="nav-bar">
                <IoMenu className="icono-menu" color={menuColor} size={50} onClick={toggleSidebar} />
                <img src={logo} alt="Logo" className="logo-nav"/>
                <div className="opciones">
                    <ul>
                        <li><Link to="/landing/home" className="nav-link">Inicio</Link></li>
                        <li><Link to="/landing/services" className="nav-link">Servicios</Link></li>
                        <li><Link to="/landing/about" className="nav-link">Sobre Nosotros</Link></li>
                        <li><Link to="/landing/contact" className="nav-link">Contacto</Link></li>
                        
                    </ul>
                </div>

                {/* Barra lateral */}
                <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    
                    <ul>
                        <li>Agendar una cita</li>
                        <li>Mis Citas</li>
                        <li>Mi Perfil</li>
                    </ul>

                    <FaUserCircle size={150} className="icono-user"/>
                    <h3 className="nombre">{nombreUsuario} {apellido1} {apellido2}</h3>
                    <h5 className="correo">{correo}</h5>

                    <li onClick={handleLogout} className="logout">Cerrar Sesión</li>
                </div>
            </div>

            {/* Contenedor del contenido */}
            <div className="contenido">
                <Routes>
                    <Route path="home" element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="services" element={<Services />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
};