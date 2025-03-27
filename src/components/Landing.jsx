import { useState, Suspense, lazy } from "react";
import { IoMenu } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import './NavBar.css';
import logo from '../img/logo Sanher.jpeg';
import axios from "axios";
import Spinner from "./Spinner";
import RolValidator from "./RolValidator";

// Importaciones dinámicas
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Services = lazy(() => import('./Services'));
const Contact = lazy(() => import('./Contact'));
const Agendar = lazy(() => import('./Agendar'));
const MisCitas = lazy(() => import('./MisCitas'));
const Profile = lazy(() => import('./Profile'));
const DashboardIN = lazy(() => import('./DashboardIN'));
const CitasContador = lazy(() => import('./CitasContador'));
const Horarios = lazy(() => import('./Horarios'));
const DashboardAdmin = lazy(() => import('./DashboardAdmin'));
const Users = lazy(() => import('./Users'));
const Recuento = lazy(() => import('./Recuento'));
const Reportes = lazy(() => import('./Reportes'));
const Auditorias = lazy(() => import('./Auditorias'));
const NotFound = lazy(() => import('./NotFound'));

export const Landing = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menuColor, setMenuColor] = useState("white");
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const nombreUsuario = localStorage.getItem("nombre");
    const apellido1 = localStorage.getItem("apellido1");
    const apellido2 = localStorage.getItem("apellido2");
    const correo = localStorage.getItem("correo");
    const rol = localStorage.getItem("rol");

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setMenuColor(isSidebarOpen ? 'white' : '#f4a523');
    };

    const handleLogout = async () => {
        const userId = localStorage.getItem("idUsuario");
        const token = localStorage.getItem("token");

        try {
            await axios.put(`${API_URL}/api/usuarios/update-last-connection/${userId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al actualizar la última conexión', error);
        }

        localStorage.clear();
        navigate("/");
    };

    const closeSidebar = () => {
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="landing-container" onClick={closeSidebar}>
            <div className="nav-bar">
                <IoMenu className="icono-menu" color={menuColor} size={50} onClick={toggleSidebar} />
                <img src={logo} alt="Logo" className="logo-nav" />
                <div className="opciones">
                    <ul>
                        <li><Link to="/landing/home" className="nav-link">Inicio</Link></li>
                        <li><Link to="/landing/services" className="nav-link">Servicios</Link></li>
                        <li><Link to="/landing/about" className="nav-link">Sobre Nosotros</Link></li>
                        <li><Link to="/landing/contact" className="nav-link">Contacto</Link></li>
                    </ul>
                </div>

                <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <ul>
                        <Link to="/landing/agendar" className="side-option"><li>Agendar una cita</li></Link>
                        <Link to="/landing/miscitas" className="side-option"><li>Mis Citas</li></Link>
                        <Link to="/landing/profile" className="side-option"><li>Mi Perfil</li></Link>
                        {(rol === 'CO' || rol === 'A') && (<Link to="/landing/intern" className="side-option"><li>Sistema Interno</li></Link>)}
                        {rol === 'A' && (<Link to="/landing/dashAdmin" className="side-option"><li>Administrador</li></Link>)}
                    </ul>

                    <FaUserCircle size={150} className="icono-user" />
                    <h3 className="nombre">{nombreUsuario} {apellido1} {apellido2}</h3>
                    <h5 className="correo">{correo}</h5>

                    <li onClick={handleLogout} className="logout">Cerrar Sesión</li>
                </div>
            </div>

            {/* Contenido con Suspense y spinner */}
            <div className="contenido">
                <Suspense fallback={<Spinner />}>
                    <Routes>
                        <Route path="home" element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="services" element={<Services />} />
                        <Route path="agendar" element={<Agendar />} />
                        <Route path="miscitas" element={<MisCitas />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="intern" element={<RolValidator allowedRoles={['CO', 'A']}><DashboardIN /></RolValidator>} />
                        <Route path="myschedule" element={<RolValidator allowedRoles={['CO', 'A']}><CitasContador /></RolValidator>} />
                        <Route path="horarios" element={<RolValidator allowedRoles={['CO', 'A']}><Horarios /></RolValidator>} />
                        <Route path="dashAdmin" element={<RolValidator allowedRoles={['A']}><DashboardAdmin /></RolValidator>} />
                        <Route path="users" element={<RolValidator allowedRoles={['A']}><Users /></RolValidator>} />
                        <Route path="recuento" element={<RolValidator allowedRoles={['A']}><Recuento /></RolValidator>} />
                        <Route path="report" element={<RolValidator allowedRoles={['CO', 'A']}><Reportes /></RolValidator>} />
                        <Route path="audit" element={<RolValidator allowedRoles={['A']}><Auditorias /></RolValidator>} />
                        <Route path="/" element={<Home />} />
                        <Route path="/*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
};