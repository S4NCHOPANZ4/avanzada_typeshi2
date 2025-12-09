import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchUserProfile } from '../../store/slices/authSlice';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Si no estamos autenticados, intentamos cargar el perfil
    if (!isAuthenticated && !loading) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center">
          <svg className="animate-spin h-8 w-8 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Verificando autenticación...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado después de cargar, redirigir al login
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido de la ruta
  return <Outlet />;
};

export default ProtectedRoute;