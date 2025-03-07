import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

export const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = (e) => {
        e.preventDefault(); // Evita que el Link navegue a la ruta especificada
        navigate(-1); // Navega a la ruta anterior
    };
    return (
        <>
            <div className="container-nf">

                <div className="not-found">
                    <h1>404</h1>
                    <p>Página no encontrada</p>
                    <Link  onClick={handleGoBack} className="home-link">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    )
}
