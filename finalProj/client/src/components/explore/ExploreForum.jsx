import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { useSelector } from 'react-redux';

const ExploreForum = ({ space }) => {
  const [loading, setLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(space.members?.length || 0);
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  // Verificar si el usuario actual ya es miembro
  const checkIfJoined = () => {
    if (!currentUser || !space.members) return false;
    
    const userId = currentUser._id || currentUser.id;
    return space.members.some(member => 
      (member._id || member.id) === userId
    );
  };

  useState(() => {
    setIsJoined(checkIfJoined());
  }, [currentUser, space]);

  const handleJoin = async (e) => {
    e.stopPropagation(); // Prevenir navegación
    if (loading) return;
    
    setLoading(true);
    try {
      if (isJoined) {
        // Salir del espacio
        await apiRequest(`/space/${space._id || space.id}/leave`, {
          method: 'POST'
        });
        setIsJoined(false);
        setMemberCount(prev => prev - 1);
      } else {
        // Unirse al espacio
        await apiRequest(`/space/${space._id || space.id}/join`, {
          method: 'POST'
        });
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error al unirse/salir del espacio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForumClick = () => {
    // Redirigir a la página del foro/espacio
    navigate(`/space/${space._id || space.id}`);
  };

  if (!space) return null;

  return (
    <div className='w-full my-3 border border-zinc-200 rounded-lg hover:shadow-md transition-shadow p-4'>
      <div className='flex justify-between items-center'>
        <div onClick={handleForumClick} className='cursor-pointer flex-grow'>
          <p className="font-semibold text-xl">{space.name}</p>
          
          {space.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {space.description}
            </p>
          )}
          
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span className="font-semibold mr-2">Miembros:</span>
            <span>{memberCount}</span>
            
            {space.creator_id && (
              <>
                <span className="mx-2">•</span>
                <span className="font-semibold mr-1">Creador:</span>
                <span>{space.creator_id.name}</span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={handleJoin}
          disabled={loading}
          className={`cursor-pointer ml-4 ${
            isJoined 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
          } text-white font-semibold px-4 py-2 rounded-full min-w-[100px] transition-all ease-in-out whitespace-nowrap`}
        >
          {loading ? '...' : isJoined ? 'Salir' : 'Unirse'}
        </button>
      </div>
    </div>
  );
};

export default ExploreForum;