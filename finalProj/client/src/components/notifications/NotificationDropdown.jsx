import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import CharacterDisplay from '../character/CharacterDisplay';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Polling cada 30 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await apiRequest('/notification/my-notifications');
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAcceptMatch = async (notificationId, fromUser) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/notification/match/accept/${notificationId}`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Actualizar lista de notificaciones
        await fetchNotifications();
        alert(`¡Ahora eres match con ${fromUser.name}!`);
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Error al aceptar el match');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMatch = async (notificationId) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/notification/match/reject/${notificationId}`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Actualizar lista de notificaciones
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('Error al rechazar el match');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      try {
        await apiRequest(`/notification/${notification._id}/read`, {
          method: 'PUT'
        });
        await fetchNotifications();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleViewProfile = (userId) => {
    setIsOpen(false);
    navigate(`/profile/${userId}`);
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'match_request':
        return `${notification.from_user.name} quiere hacer match contigo`;
      case 'match_accepted':
        return `${notification.from_user.name} aceptó tu solicitud de match`;
      case 'match_rejected':
        return `${notification.from_user.name} rechazó tu solicitud`;
      default:
        return 'Nueva notificación';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 30) return `Hace ${diffDays}d`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} sin leer</p>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(notification.from_user._id);
                      }}
                    >
                      <CharacterDisplay
                        avatar={notification.from_user.avatar}
                        size={40}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>

                      {/* Botones de acción para match_request */}
                      {notification.type === 'match_request' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptMatch(notification._id, notification.from_user);
                            }}
                            disabled={loading}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectMatch(notification._id);
                            }}
                            disabled={loading}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {/* Botón para ver perfil en otros tipos */}
                      {notification.type !== 'match_request' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(notification.from_user._id);
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Ver perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;