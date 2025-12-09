import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../../../utils/api'; // Asegúrate de tener esta importación

const CreateForum = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreForo: '',
    descripcion: '',
    tipo: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const tipos = [
    "Académico",
    "Recreativo", 
    "Random",
    "Informativo",
    "Ventas",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar error del servidor cuando el usuario empiece a escribir
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombreForo.trim()) newErrors.nombreForo = "El nombre del foro es obligatorio";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!formData.tipo) newErrors.tipo = "Debes seleccionar un tipo de foro";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const allFieldsFilled = () => {
    return (
      formData.nombreForo.trim() !== '' &&
      formData.descripcion.trim() !== '' &&
      formData.tipo.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      // Preparar datos para enviar al backend
      const forumData = {
        name: formData.nombreForo.trim(),
        description: formData.descripcion.trim(),
        // Puedes añadir el tipo como metadata si tu modelo lo soporta
        // type: formData.tipo
      };

      // Llamar al endpoint para crear espacio
      const response = await apiRequest('/space/create', {
        method: 'POST',
        body: JSON.stringify(forumData)
      });

      console.log("Respuesta del backend:", response);

      if (response.success) {
        console.log("Foro creado exitosamente:", response.space);
        // Redirigir al home o al espacio creado
        navigate('/');
      } else {
        setServerError(response.message || 'Error al crear el foro');
      }
    } catch (error) {
      console.error("Error al crear foro:", error);
      setServerError(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="flex items-center justify-center h-screen default-background">
      <div className="bg-white h-[90%] w-[80%] p-10 rounded-md shadow-md flex flex-col justify-between">
        
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center">Crear Nuevo Foro</h1>
          <p className="text-gray-600 text-center mt-2">
            Crea un espacio para compartir ideas y conectar con otros estudiantes
          </p>
        </div>

        {/* Error del servidor */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {serverError}
          </div>
        )}

        {/* FORM */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-4 flex-grow">

          {/* Nombre foro */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Nombre del Foro *</label>
            <input
              type="text"
              name="nombreForo"
              value={formData.nombreForo}
              onChange={handleChange}
              className="bg-zinc-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ej: Programadores UD, Música en la U, etc."
              disabled={loading}
            />
            {errors.nombreForo && <p className="text-red-500 text-sm mt-1">{errors.nombreForo}</p>}
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="bg-zinc-100 rounded-md px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Describe el propósito de este foro..."
              disabled={loading}
            ></textarea>
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
          </div>

          {/* Tipo */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tipo *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="bg-zinc-100 rounded-md px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
          </div>

        </div>

        {/* BOTONES */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleCancel}
            disabled={loading}
            className={`cursor-pointer flex-1 ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
            } text-white font-semibold px-6 py-3 rounded-full transition-all`}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!allFieldsFilled() || loading}
            className={`cursor-pointer flex-1 ${
              allFieldsFilled() && !loading
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-400 cursor-not-allowed"
            } text-white font-semibold px-6 py-3 rounded-full transition-all flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : 'Crear Foro'}
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            * Todos los foros creados serán públicos para todos los estudiantes de la UD.
            Los administradores se reservan el derecho de moderar el contenido.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CreateForum;