import './DashboardAdmin.css';
import { AiOutlineAudit } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { VscChecklist } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {

    const navigate = useNavigate();

    const handleOption = (route) => {
        navigate('/landing/'+route);
    }

  return (
    <>
      <div className="admin-dash-container">
        <div className="admin-option" onClick={() => handleOption('audit')}><h1>Auditoria</h1> <AiOutlineAudit size={100} color='#f7b130'/></div>
        <div className="admin-option" onClick={() => handleOption('users')}><h1>Usuarios</h1> <FaUsers size={100} color='#f7b130'/></div>
        <div className="admin-option"onClick={() => handleOption('recuento')}><h1>Recuento de Citas</h1> <VscChecklist size={100} color='#f7b130'/></div>
      </div>
    </>
  )
}

export default DashboardAdmin
