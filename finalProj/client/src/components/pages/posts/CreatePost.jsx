import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const maxChars = 200;

  // Cargar espacios disponibles
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSpaces = async () => {
      try {
        const response = await apiRequest('/space/');
        if (response.success) {
          setSpaces(response.spaces);
          // Seleccionar el primer espacio por defecto si existe
          if (response.spaces.length > 0 && !spaceId) {
            setSpaceId(response.spaces[0]._id || response.spaces[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
        setError('Error al cargar espacios');
      }
    };

    fetchSpaces();
  }, [isAuthenticated, navigate, spaceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('El contenido es requerido');
      return;
    }

    if (!spaceId) {
      setError('Selecciona un espacio');
      return;
    }

    if (content.length > maxChars) {
      setError(`Máximo ${maxChars} caracteres`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/post/create', {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          space_id: spaceId
        })
      });

      if (response.success) {
        navigate('/');
      } else {
        setError('Error al crear el post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-[95%]  bg-gray-100">
      <div className="bg-white p-6 rounded-lg  w-full">
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selector de espacio */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Espacio</label>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Selecciona un espacio</option>
              {spaces.map((space) => (
                <option 
                  key={space._id || space.id} 
                  value={space._id || space.id}
                >
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de contenido */}
          <div className="mb-4">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué estás pensando?"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                rows="4"
                maxLength={maxChars}
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {content.length}/{maxChars}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading || !content.trim() || !spaceId}
              className={`px-4 py-2 rounded text-white ${
                loading || !content.trim() || !spaceId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;