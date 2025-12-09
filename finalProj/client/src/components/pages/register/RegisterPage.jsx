import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CharacterCreator from '../../character/CharacterCreator';
import { registerUser } from '../../../utils/api';
import { setUser } from '../../../store/slices/authSlice';
import MinimalNavbar from '../../navbar/MinimalNavbar';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState({
    bodyColor: "#ffd7ba",
    hairStyle: "hair3",
    hairColor: "#2c1b18",
    eyeStyle: "eyes1",
    mouthStyle: "mouth1",
    backgroundColor: "#decd4aff"
  });
  
  // CORREGIDO: formData con los mismos nombres que los inputs
  const [formData, setFormData] = useState({
    name: '',          // Nombre completo (antes era nombres + apellidos)
    username: '',      // Nombre de usuario
    major: '',         // Carrera
    ig_user: '',       // Instagram
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Limpiar error general
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de campos obligatorios
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.username.trim()) newErrors.username = 'El username es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmar contraseña es obligatorio';

    // Validar email UD
    if (formData.email && !formData.email.includes('@udistrital.edu.co')) {
      newErrors.email = 'El email debe ser dominio udistrital.edu.co';
    }

    // Validar que las contraseñas coincidan
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar longitud de contraseña
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClick = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const allFieldsFilled = () => {
    // Campos requeridos para habilitar el botón
    const requiredFields = ['name', 'username', 'email', 'password', 'confirmPassword'];
    return requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  const handleAvatarComplete = async (avatarData) => {
    setAvatar(avatarData);
    await handleRegister(avatarData);
  };

  const handleRegister = async (avatarData) => {
    setLoading(true);
    try {
      // Preparar datos para enviar al backend
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        major: formData.major || '',
        ig_user: formData.ig_user || '',
        avatar: avatarData
      };

      const response = await registerUser(userData);

      if (response.success) {
        dispatch(setUser(response.user));
        navigate('/');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Error al registrar usuario' });
      setStep(1); // Volver al paso 1 si hay error
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({}); // Limpiar errores al volver
  };

  return (
    <div className='flex items-center justify-center h-screen default-background'>
      
      {step === 1 ? (
        <div className='bg-white h-[90%] w-[80%] flex items-center justify-center rounded-md justify-between'>
          <div className='flex-1 p-10 h-full space-y-3'>
            <p className='font-semibold text-2xl'>Crea tu cuenta UD connect</p>
            
            {/* Campo de Nombre Completo */}
            <div className='space-y-1'>
              <p className='font-semibold'>Nombre Completo</p>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="Juan Pérez"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Campo de Username */}
            <div className='space-y-1'>
              <p className='font-semibold'>Username</p>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="juanperez"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            {/* Campo de Carrera (Opcional) */}
            <div className='space-y-1'>
              <p className='font-semibold'>Carrera (Opcional)</p>
              <input 
                type="text" 
                name="major"
                value={formData.major}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="Ingeniería de Sistemas"
              />
            </div>

            {/* Campo de Instagram (Opcional) */}
            <div className='space-y-1'>
              <p className='font-semibold'>Instagram (Opcional)</p>
              <input 
                type="text" 
                name="ig_user"
                value={formData.ig_user}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="@juanperez"
              />
            </div>

            {/* Campo de Email */}
            <div className='space-y-1'>
              <p className='font-semibold'>Email <span className='text-sm font-light'>@udistrital.edu.co</span></p>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="usuario@udistrital.edu.co"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Campo de Contraseña */}
            <div className='space-y-1'>
              <p className='font-semibold'>Contraseña</p>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Campo de Confirmar Contraseña */}
            <div className='space-y-1'>
              <p className='font-semibold'>Confirmar Contraseña</p>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-3 py-2 focus:outline-none focus:ring-0' 
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            {/* Error general del servidor */}
            {errors.submit && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            {/* Botón Continuar */}
            <div className='mt-6'>
              <button 
                onClick={handleClick}
                className={`cursor-pointer w-full ${
                  allFieldsFilled() 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white font-semibold px-6 py-3 rounded-full transition-all ease-in-out flex items-center justify-center`}
                disabled={!allFieldsFilled() || loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        <div className='bg-white h-[90%] w-[80%] flex flex-col items-center justify-center rounded-md'>
          <div className="w-full p-6">
            <button 
              onClick={handleBack}
              className="mb-4 text-red-500 hover:text-red-600 font-semibold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a datos personales
            </button>
          </div>
          
          <div className="flex-1 w-full">
            <CharacterCreator onComplete={handleAvatarComplete} initialAvatar={avatar} />
          </div>
          
          {loading && (
            <div className="mt-6 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Creando tu cuenta...</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default RegisterPage;