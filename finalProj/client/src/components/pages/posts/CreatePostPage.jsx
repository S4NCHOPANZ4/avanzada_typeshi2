import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainNavbar from "../../navbar/MainNavbar";
import { apiRequest } from '../../../utils/api';
import { useSelector } from 'react-redux';

const CreatePostPage = () => {
  const { id: spaceIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [spaces, setSpaces] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaceIdFromParams || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSpaces, setFetchingSpaces] = useState(true);
  const [error, setError] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  const MAX_CHARACTERS = 300;

  useEffect(() => {
    fetchUserSpaces();
  }, []);

  useEffect(() => {
    if (spaceIdFromParams) {
      setSelectedSpaceId(spaceIdFromParams);
    }
  }, [spaceIdFromParams]);

  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  const fetchUserSpaces = async () => {
    setFetchingSpaces(true);
    try {
      const response = await apiRequest('/space/all/explore');
      console.log('Spaces response:', response); // DEBUG
      if (response.success) {
        // Filtrar solo los espacios donde el usuario es miembro
        const userSpaces = response.spaces.filter(space => {
          if (!currentUser || !space.members) return false;
          const userId = currentUser._id || currentUser.id;
          console.log('Checking space:', space.name, 'members:', space.members, 'userId:', userId); // DEBUG
          return space.members.some(member => {
            const memberId = member._id || member.id || member;
            console.log('Comparing:', memberId, '===', userId, 'result:', memberId === userId); // DEBUG
            return memberId === userId;
          });
        });
        console.log('User spaces:', userSpaces); // DEBUG
        setSpaces(userSpaces);
        
        if (!selectedSpaceId && userSpaces.length > 0) {
          setSelectedSpaceId(userSpaces[0]._id || userSpaces[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setError('Error al cargar tus foros');
    } finally {
      setFetchingSpaces(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting post with:', { selectedSpaceId, content, currentUser }); // DEBUG
    
    if (!selectedSpaceId) {
      setError('Selecciona un foro para publicar');
      return;
    }
    
    if (!content.trim()) {
      setError('El contenido es requerido');
      return;
    }

    if (content.length > MAX_CHARACTERS) {
      setError(`El contenido no puede exceder ${MAX_CHARACTERS} caracteres`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        space_id: selectedSpaceId,
        content: content
      };

      console.log('Post data:', postData); // DEBUG

      const response = await apiRequest('/post/create', {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      console.log('Create post response:', response); // DEBUG

      if (response.success) {
        // Volver a la página anterior (el foro)
        if (location.state?.from) {
          navigate(location.state.from);
        } else if (selectedSpaceId) {
          navigate(`/space/${selectedSpaceId}`);
        } else {
          navigate('/forum');
        }
      } else {
        setError(response.message || 'Error al publicar');
        console.error('Server response error:', response); // DEBUG
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.message, error.stack); // DEBUG
      setError(`Error al publicar: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
    }
  };

  const selectedSpace = spaces.find(space => (space._id || space.id) === selectedSpaceId);

  return (
    <div className="flex flex-col">
      <MainNavbar />
      
      <div className="flex w-full pt-[50px] md:pt-[50px]">
        <div className="flex-1"></div>
        
        <div className="w-[55%] p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Publicar</h1>
            {selectedSpace && (
              <p className="text-lg text-gray-600 mt-2">
                En: <span className="font-semibold text-red-500">{selectedSpace.name}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Usuario actual: {currentUser?.name} (ID: {currentUser?._id || currentUser?.id})
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-300 p-6">
            {/* Selector de foro */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar foro *
              </label>
              {fetchingSpaces ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando foros...</span>
                </div>
              ) : spaces.length === 0 ? (
                <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                  <p className="text-yellow-700">
                    No eres miembro de ningún foro. Únete a un foro primero para poder publicar.
                    <br />
                    <small>Foros disponibles pero no eres miembro: {spaces.length}</small>
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/meet')}
                    className="mt-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md"
                  >
                    Explorar foros
                  </button>
                </div>
              ) : (
                <select
                  value={selectedSpaceId}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un foro</option>
                  {spaces.map((space) => (
                    <option key={space._id || space.id} value={space._id || space.id}>
                      {space.name} ({space.members?.length || 0} miembros)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuerpo de texto *
              </label>
              <textarea
                id="content-textarea"
                value={content}
                onChange={handleContentChange}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="¿Qué quieres compartir con la comunidad?..."
                required
                style={{ resize: 'none' }}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Máximo {MAX_CHARACTERS} caracteres
                </p>
                <div className={`text-sm font-medium ${
                  characterCount > MAX_CHARACTERS ? 'text-red-600' : 
                  characterCount > MAX_CHARACTERS * 0.8 ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {characterCount}/{MAX_CHARACTERS}
                </div>
              </div>
              {characterCount > MAX_CHARACTERS && (
                <p className="text-red-600 text-sm mt-1">
                  Has excedido el límite de caracteres
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || content.length === 0 || content.length > MAX_CHARACTERS || !selectedSpaceId}
                  className={`px-6 py-2 rounded-md ${
                    loading || content.length === 0 || content.length > MAX_CHARACTERS || !selectedSpaceId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white font-semibold transition-colors`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publicando...
                    </div>
                  ) : 'Publicar'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Información de debug */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300 text-sm">
            <h3 className="font-semibold mb-2">Información de debug:</h3>
            <p>Usuario ID: {currentUser?._id || currentUser?.id}</p>
            <p>Foros donde soy miembro: {spaces.length}</p>
            <p>Foro seleccionado ID: {selectedSpaceId}</p>
            <p>Caracteres: {characterCount}/{MAX_CHARACTERS}</p>
          </div>
        </div>
        
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default CreatePostPage;