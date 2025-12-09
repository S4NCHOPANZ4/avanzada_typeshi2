import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// import MinimalNavbar from '../../../navbar/MinimalNavbar';
import { loginUser } from '../../../utils/api';
import { setUser, setError } from '../../../store/slices/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localErrors[name]) {
      setLocalErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    dispatch(setError(null));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';

    if (formData.email && !formData.email.includes('@udistrital.edu.co')) {
      newErrors.email = 'Debe usar email @udistrital.edu.co';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(setError(null));
    
    try {
      const response = await loginUser(formData.email, formData.password);
      
      if (response.success) {
        dispatch(setUser(response.user));
        navigate('/'); // Redirigir al home después de login exitoso
      }
    } catch (error) {
      dispatch(setError(error.message || 'Error al iniciar sesión'));
    }
  };

  return (
    <div className='flex items-center justify-center h-screen default-background'>
      
      <div className='bg-white h-[70%] w-[90%] max-w-md flex flex-col items-center justify-center rounded-md p-8'>
        <div className='w-full'>
          <p className='font-semibold text-2xl text-center mb-8'>Iniciar Sesión</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <p className='font-semibold'>Email <span className='text-sm font-light'>@udistrital.edu.co</span></p>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-300' 
                placeholder="usuario@udistrital.edu.co"
                disabled={loading}
              />
              {localErrors.email && <p className="text-red-500 text-sm mt-1">{localErrors.email}</p>}
            </div>

            <div className='space-y-1'>
              <p className='font-semibold'>Contraseña</p>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className='bg-zinc-100 rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-300' 
                disabled={loading}
              />
              {localErrors.password && <p className="text-red-500 text-sm mt-1">{localErrors.password}</p>}
            </div>

            <div className='mt-6'>
              <button 
                type="submit"
                disabled={loading}
                className={`cursor-pointer w-full ${
                  loading 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white font-semibold px-6 py-3 rounded-full transition-all ease-in-out flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : 'Iniciar Sesión'}
              </button>
            </div>

            <div className='text-center mt-4'>
              <p className='text-gray-600'>
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-red-500 hover:text-red-600 font-semibold">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;