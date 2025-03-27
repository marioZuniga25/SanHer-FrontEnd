
import './Home.css';
import img1 from '../img/img1.png';

const Home = () => {
  return (
    <>

      <div className="home-content">

        <img src={img1} alt="imagen 1" className='img1' />
        <div className="home-text">
          <h1>BIENVENIDO A SANHER</h1>
          <h2>¿Buscas un aliado para tomar decisiones financieras inteligentes?</h2>
          <br />
          <p>En SanHer, no solo llevamos tus cuentas: te asesoramos para que tu negocio crezca con confianza.

            ✅ ¿Qué puedes hacer aquí? <br /> <br />
            <li>🗓️ Agendar consultas personalizadas con expertos en fiscalidad, auditoría y más.</li>
            <li>💼 Recibir asesorías estratégicas: desde optimización de impuestos hasta planeación financiera.</li>
            <li>🔍 Resolver dudas complejas: sin términos enredados, solo soluciones claras.</li>
          </p>
        </div>
      </div>

    </>
  )
}

export default Home;