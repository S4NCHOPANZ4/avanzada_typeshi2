import React, { useState, useEffect } from 'react';
import ExploreForum from "../../explore/ExploreForum";
import ExploreProfile from "../../explore/ExploreProfile";
import MainNavbar from "../../navbar/MainNavbar";
import { apiRequest } from '../../../utils/api';
import { useSelector } from 'react-redux';

const MeetPage = () => {
  const [users, setUsers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' o 'spaces'
  
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Obtener usuarios
      const usersResponse = await apiRequest('/user/all');
      if (usersResponse.success) {
        // Filtrar el usuario actual si está en la lista
        const filteredUsers = usersResponse.users.filter(user => 
          (user._id || user.id) !== (currentUser?._id || currentUser?.id)
        );
        setUsers(filteredUsers);
      }

      // Obtener espacios
      const spacesResponse = await apiRequest('/space/all/explore');
      if (spacesResponse.success) {
        setSpaces(spacesResponse.spaces);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <MainNavbar />
        <div className="flex w-full pt-[50px] justify-center items-center min-h-[400px]">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <MainNavbar />

      <div className="flex w-full pt-[50px] md:pt-[50px]">
        <div className="flex-1"></div>

        <div className="w-[55%] p-4 flex flex-col items-center">
          
          {/* Pestañas de navegación */}
          <div className="flex w-full mb-6 border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'users'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personas ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('spaces')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'spaces'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Foros ({spaces.length})
            </button>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Contenido según pestaña activa */}
          {activeTab === 'users' ? (
            <>
              <h2 className="text-xl font-bold mb-4 w-full">Conoce a otros estudiantes</h2>
              {users.length === 0 ? (
                <div className="w-full text-center py-10">
                  <p className="text-gray-500">No hay usuarios para mostrar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {users.map((user) => (
                    <ExploreProfile key={user._id || user.id} user={user} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 w-full">Explora foros</h2>
              {spaces.length === 0 ? (
                <div className="w-full text-center py-10">
                  <p className="text-gray-500">No hay foros disponibles</p>
                  <button 
                    onClick={() => navigate('/create-forum')}
                    className="mt-4 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full transition-all"
                  >
                    Crear primer foro
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  {spaces.map((space) => (
                    <ExploreForum key={space._id || space.id} space={space} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default MeetPage;