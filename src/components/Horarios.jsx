import { useEffect, useState } from 'react';
import './Horarios.css';
import axios from 'axios';
import { FaCalendar } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const Horarios = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const [horarios, setHorarios] = useState([]);
  const idContador = localStorage.getItem("idUsuario");
  const [selectedDay, setSelectedDay] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
  const MySwal = withReactContent(Swal);
  const [formData, setFormData] = useState({
    id: 0,
    idContador: idContador,
    diaSemana: 'Lunes',
    horaInicio: '',
    horaFin: '',
    disponibilidad: ''
  });

  useEffect(() => {
    if (selectedDay) {
      fetchHorariosContador(selectedDay);
    }
  }, [selectedDay]);

  const fetchHorariosContador = async (dia) => {

    try {
      const response = await axios.get(`${API_URL}/api/Horarios/mishorarios?idContador=${idContador}&dia=${dia}`);
      setHorarios(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error al obtener las citas del dia: ' + selectedDay + " error: ", error);
    }

  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

  };

  const handleSubmitHorario = async (e) => {
    
    const datosHorario = {
      id: 0,
      idContador: idContador,
      diaSemana: formData.diaSemana,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      disponibilidad: ''

    }
    console.log("Datos a enviar del horario: " + JSON.stringify(datosHorario));

    try {
      await axios.post(`${API_URL}/api/Horarios`, datosHorario);
      console.log("Horario Registrado con Exito.");
      alert('Horario guardado con exito.');
      handleCloseModal();
      fetchHorariosContador(selectedDay);
      setFormData({ idContador: idContador, horaInicio: '', horaFin: null });
    } catch (error) {
      console.error('Error al guardar el horario: ', error);
      alert(error.response?.data || 'Error al guardar el horario.');
    }
  }

  const handleDaySelected = (day) => {
    setSelectedDay(day);
    console.log("Dia seleccionado: " + day);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }

  const handleDelete = async (idHorario) => {
    const result = await MySwal.fire({
      title: <strong>¿Estás seguro de eliminar este horario?</strong>,
      html: <i>¡No podrás deshacer esta acción!</i>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        
        await axios.delete(`${API_URL}/api/Horarios/${idHorario}`);
        console.log('El horario con id ' + idHorario + ' se eliminó.');
        Swal.fire(
          '¡Horario Eliminado!',
          'El horario ha sido eliminado correctamente.',
          'success'
        );
        fetchHorariosContador(selectedDay);
      } catch (error) {
        console.error('Error al eliminar el horario: ', error);
        Swal.fire(
          'Error',
          error.response?.data || 'Error al eliminar el horario.',
          'error'
        );
      }
    }
  };


  return (
    <>
      <h1 className='title'>Mis Horarios</h1>
      <div className="horarios-container">
        <div className="dias-semana">
          {diasSemana.map((dia, index) => (
            <div key={index} className="dia" onClick={() => handleDaySelected(dia)}>
              <div className="icon-container">
                <FaCalendar size={100} />
                <h1 className="dia-inicial" >{dia[0]}</h1>
              </div>
            </div>
          ))}
        </div>


        <div className="horarios-list-container">
          <div className="horarios-list">
            {selectedDay === "" ? (
              <h2 style={{ color: 'black', textAlign: 'center', marginTop: '35%' }}>
                Selecciona el día de la semana que deseas editar los horarios.
              </h2>
            ) : (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedDay}</h2>
                <ul>
                  {horarios.map((horario, index) => (
                    <div className='horario-card' key={index}>
                      <li className='horario' key={index} value={`${horario.horaInicio}-${horario.horaFin}`}>
                        {horario.horaInicio} - {horario.horaFin}
                      </li> <FaTrashAlt size={20} style={{ alignSelf: 'center', marginLeft: 10 }} className='btn-delete' onClick={() => handleDelete(horario.id)} />
                    </div>
                  ))}
                </ul>
              </>
            )}

            <button className='btn-agregar-horario' onClick={() => setIsModalOpen(true)}>Agregar Horario</button>
          </div>
        </div>

        {isModalOpen && (
          <div className="add-horario-modal">
            <IoClose className='close-modal' size={30} onClick={() => handleCloseModal()} />
            <h2>Agregar Nuevo Horario</h2>
            <form>
              <select name="diaSemana" id="diaSemana" onChange={handleInputChange} required>

                {diasSemana.map((dia, index) => (<option key={index} value={dia}>{dia}</option>))}

              </select>
              <br />
              <div className="horas-container">
                <label>Hora Inicio: <input type="time" name='horaInicio' onChange={handleInputChange} required /></label>
                <label>Hora Fin: <input type="time" name='horaFin' onChange={handleInputChange} required /></label>
              </div>
            </form>
            <button className='btn-save' onClick={() => handleSubmitHorario()}>Guardar</button>

          </div>)}

      </div>
    </>
  )

}

export default Horarios;