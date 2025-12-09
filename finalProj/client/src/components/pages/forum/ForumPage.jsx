import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavbar from "../../navbar/MainNavbar";
import PostDefault from "../posts/PostDefault";
import { apiRequest } from '../../../utils/api';
import { useSelector } from 'react-redux';

const ForumPage = () => {
  const { id } = useParams(); // Obtiene el ID del espacio de la URL
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      fetchSpaceDetails();
      fetchSpacePosts();
    }
  }, [id]);

  const fetchSpaceDetails = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/space/${id}`);
      if (response.success) {
        setSpace(response.space);
        
        // Verificar si el usuario actual es miembro
        if (currentUser && response.space.members) {
          const userId = currentUser._id || currentUser.id;
          const member = response.space.members.find(member => 
            (member._id || member.id) === userId
          );
          setIsMember(!!member);
        }
      }
    } catch (error) {
      console.error('Error fetching space details:', error);
      setError('Error al cargar el foro');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpacePosts = async () => {
    try {
      const response = await apiRequest(`/post/space/${id}`);
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleJoin = async () => {
    if (joining) return;
    
    setJoining(true);
    try {
      if (isMember) {
        // Salir del espacio
        await apiRequest(`/space/${id}/leave`, {
          method: 'POST'
        });
        setIsMember(false);
        // Actualizar la lista de miembros
        fetchSpaceDetails();
      } else {
        // Unirse al espacio
        await apiRequest(`/space/${id}/join`, {
          method: 'POST'
        });
        setIsMember(true);
        // Actualizar la lista de miembros
        fetchSpaceDetails();
      }
    } catch (error) {
      console.error('Error al unirse/salir del espacio:', error);
      setError('Error al realizar la acción');
    } finally {
      setJoining(false);
    }
  };

  const handleCreatePost = () => {
    // Navegar a la página de crear publicación
    navigate(`/create-post/${id}`, { 
      state: { 
        from: `/space/${id}`,
        spaceName: space?.name 
      } 
    });
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
            <span>Cargando foro...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex flex-col">
        <MainNavbar />
        <div className="flex w-full pt-[50px] justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Foro no encontrado</p>
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
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Encabezado del foro */}
          <div className="w-full border-b border-zinc-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h1 className="font-semibold text-2xl text-gray-800">{space.name}</h1>
                {space.description && (
                  <p className="text-gray-600 mt-2">{space.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center">
                    <span className="text-zinc-700 font-semibold mr-1">Miembros:</span>
                    <span className="text-gray-600">{space.members?.length || 0}</span>
                  </div>
                  
                  {space.creator_id && (
                    <div className="flex items-center">
                      <span className="text-zinc-700 font-semibold mr-1">Creador:</span>
                      <span className="text-gray-600">{space.creator_id.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-zinc-700 font-semibold mr-1">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isMember ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isMember ? 'Miembro' : 'No miembro'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3 ml-4">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className={`cursor-pointer ${
                    isMember 
                      ? 'bg-gray-500 hover:bg-gray-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white font-semibold px-6 py-2 rounded-full w-[200px] transition-all ease-in-out
                  ${joining ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {joining ? '...' : isMember ? 'Salir del foro' : 'Unirse al foro'}
                </button>
                
                {/* Botón para publicar - solo visible para miembros */}
                {isMember && (
                  <button
                    onClick={handleCreatePost}
                    className="cursor-pointer bg-red-500 hover:bg-red-600 
                      text-white font-semibold px-6 py-2 rounded-full w-[200px] transition-all ease-in-out
                      flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar aquí
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sección de publicaciones */}
          <div className="w-full">
            {/* Encabezado de publicaciones */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Publicaciones {posts.length > 0 && `(${posts.length})`}
              </h2>
              

            </div>

            {/* Lista de publicaciones o mensaje vacío */}
            {posts.length === 0 ? (
              <div className="text-center py-16 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay publicaciones aún</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Sé el primero en compartir algo en este foro. ¡Inicia una conversación interesante!
                </p>
                {isMember && (
                  <button
                    onClick={handleCreatePost}
                    className="cursor-pointer bg-red-500 hover:bg-red-600 
                      text-white font-semibold px-8 py-3 rounded-full transition-all ease-in-out
                      inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear primera publicación
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostDefault key={post._id || post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default ForumPage;