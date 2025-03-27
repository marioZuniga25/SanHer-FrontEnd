import './Services.css';
import img2 from '../img/img2.png';
import img3 from '../img/img3.png';

const Services = () => {
  return (
    <>
      <div className="service-1">
        <img src={img2} alt="" />
        <div className="text1">
          <h1>Servicio 1</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
            Qui ratione numquam, accusamus, repellat exercitationem quaerat 
            minus excepturi rerum incidunt, eos tempora possimus odit doloremque eius?
            Veniam ducimus impedit reiciendis sint?</p>
        </div>
      </div>

      <div className="service-2">
        <div className="text2">
          <h1>Servicio 2</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
            Qui ratione numquam, accusamus, repellat exercitationem quaerat 
            minus excepturi rerum incidunt, eos tempora possimus odit doloremque eius?
            Veniam ducimus impedit reiciendis sint?</p>
        </div>
        <img src={img3} alt="" />
      </div>

      <div className="service-3">

      </div>
    </>
  )
}
export default Services;