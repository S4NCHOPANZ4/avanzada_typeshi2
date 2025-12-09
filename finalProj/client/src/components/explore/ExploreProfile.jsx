import React, { useState, useEffect } from 'react';
import CharacterDisplay from '../character/CharacterDisplay';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { BiHeart, BiX, BiCheck, BiMessageRounded } from 'react-icons/bi';

const ExploreProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [matchStatus, setMatchStatus] = useState('none'); // 'none', 'pending_outgoing', 'pending_incoming', 'matched'
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const navigate = useNavigate();

  // Verificar estado del match al cargar
  useEffect(() => {
    if (user) {
      checkMatchStatus();
    }
  }, [user]);

  const checkMatchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      
      // Primero verificar si ya son matches
      const matchesResponse = await apiRequest('/notification/my-matches');
      
      if (matchesResponse.success) {
        const isMatch = matchesResponse.matches.some(match => 
          (match._id || match.id) === (user._id || user.id)
        );
        
        if (isMatch) {
          setMatchStatus('matched');
          setIsLoadingStatus(false);
          return;
        }
      }

      // Verificar si hay solicitud pendiente (enviada por mí)
      const notificationsResponse = await apiRequest('/notification/my-notifications');
      
      if (notificationsResponse.success) {
        const hasOutgoingRequest = notificationsResponse.notifications.some(notification => 
          notification.type === 'match_request' && 
          notification.to_user === (user._id || user.id) &&
          !notification.read
        );
        
        const hasIncomingRequest = notificationsResponse.notifications.some(notification => 
          notification.type === 'match_request' && 
          notification.from_user?._id === (user._id || user.id) &&
          !notification.read
        );
        
        if (hasOutgoingRequest) {
          setMatchStatus('pending_outgoing');
        } else if (hasIncomingRequest) {
          setMatchStatus('pending_incoming');
        } else {
          setMatchStatus('none');
        }
      } else {
        setMatchStatus('none');
      }
    } catch (error) {
      console.error('Error checking match status:', error);
      setMatchStatus('none');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleMatchRequest = async (e) => {
    e.stopPropagation();
    if (loading || matchStatus !== 'none') return;
    
    setLoading(true);
    try {
      const response = await apiRequest('/notification/match/request', {
        method: 'POST',
        body: JSON.stringify({ targetUserId: user._id || user.id })
      });
      
      if (response.success) {
        setMatchStatus('pending_outgoing');
        console.log(`Solicitud de match enviada a ${user.name}`);
      }
    } catch (error) {
      console.error('Error al hacer match:', error);
      
      // Manejar errores específicos
      if (error.message?.includes('Ya existe una solicitud')) {
        setMatchStatus('pending_outgoing');
      } else if (error.message?.includes('Ya son matches')) {
        setMatchStatus('matched');
      } else {
        alert(error.message || 'Error al enviar solicitud de match');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = async (e) => {
    e.stopPropagation();
    if (loading) return;
    
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el match con ${user.name}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiRequest(`/notification/match/${user._id || user.id}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        setMatchStatus('none');
        console.log(`Match eliminado con ${user.name}`);
      }
    } catch (error) {
      console.error('Error al eliminar match:', error);
      alert(error.message || 'Error al eliminar el match');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (e) => {
    e.stopPropagation();
    if (loading) return;
    
    setLoading(true);
    try {
      // Necesitamos encontrar el ID de la notificación
      const notificationsResponse = await apiRequest('/notification/my-notifications');
      
      if (notificationsResponse.success) {
        const incomingRequest = notificationsResponse.notifications.find(notification => 
          notification.type === 'match_request' && 
          notification.from_user?._id === (user._id || user.id) &&
          !notification.read
        );
        
        if (incomingRequest) {
          const acceptResponse = await apiRequest(`/notification/match/accept/${incomingRequest._id}`, {
            method: 'POST'
          });
          
          if (acceptResponse.success) {
            setMatchStatus('matched');
            console.log(`Match aceptado con ${user.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Error al aceptar match:', error);
      alert(error.message || 'Error al aceptar el match');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    // TODO: Implementar navegación a chat
    alert(`Funcionalidad de chat con ${user.name} en desarrollo`);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user._id || user.id}`);
  };

  if (!user || isLoadingStatus) {
    return (
      <div className='w-full h-[200px] rounded-lg shadow-sm flex flex-col items-center justify-center p-3 bg-gray-50 animate-pulse'>
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const getButtonConfig = () => {
    switch (matchStatus) {
      case 'pending_outgoing':
        return {
          text: '⏳ Pendiente',
          className: 'bg-yellow-500 hover:bg-yellow-600 cursor-default',
          disabled: true,
          icon: null,
          onClick: null
        };
      case 'pending_incoming':
        return {
          text: 'Aceptar Match',
          className: 'bg-blue-500 hover:bg-blue-600',
          disabled: loading,
          icon: <BiCheck className="mr-1" />,
          onClick: handleAcceptMatch
        };
      case 'matched':
        return [

          {
            text: 'Unmatch',
            className: 'bg-gray-500 hover:bg-gray-600',
            disabled: loading,
            icon: <BiX className="mr-1" />,
            onClick: handleUnmatch,
            size: 'half'
          }
        ];
      default:
        return {
          text: loading ? '...' : 'Match',
          className: loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600',
          disabled: loading,
          icon: loading ? null : <BiHeart className="mr-1" />,
          onClick: handleMatchRequest
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div 
      className='w-full h-[200px] rounded-lg shadow-sm flex flex-col items-center p-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-100' 
      onClick={handleProfileClick}
    >
      <div>
        <CharacterDisplay 
          avatar={user.avatar || {
            bodyColor: "#ffd7ba",
            hairStyle: "hair1",
            hairColor: "#2c1b18",
            eyeStyle: "eyes1",
            mouthStyle: "mouth1",
            backgroundColor: "#4ade80"
          }} 
          size={80} 
        />
      </div>
      <div className='my-1 flex flex-col items-center w-full'>
        <p className='font-semibold text-center truncate w-full' title={user.name}>
          {user.name}
        </p>
        {user.major && (
          <p className='text-xs text-gray-500 text-center truncate w-full' title={user.major}>
            {user.major}
          </p>
        )}
        
        <div className='mt-2 w-full flex flex-col space-y-1'>
          {Array.isArray(buttonConfig) ? (
            // Para matched state: mostrar dos botones
            <div className="flex space-x-1">
              {buttonConfig.map((btn, index) => (
                <button
                  key={index}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  className={`flex-1 cursor-pointer ${btn.className} text-white font-semibold px-2 py-1 rounded-full transition-all ease-in-out flex items-center justify-center text-sm`}
                >
                  {btn.icon}
                  {btn.text}
                </button>
              ))}
            </div>
          ) : (
            // Para otros estados: mostrar un solo botón
            <button
              onClick={buttonConfig.onClick}
              disabled={buttonConfig.disabled}
              className={`cursor-pointer ${buttonConfig.className} text-white font-semibold px-4 py-1 rounded-full w-full transition-all ease-in-out flex items-center justify-center`}
            >
              {buttonConfig.icon}
              {buttonConfig.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreProfile;