import React, { useEffect, useState } from "react";
import { BiHomeAlt2, BiHeart, BiGridAlt, BiPlus, BiUser, BiChevronRight } from "react-icons/bi";
import ContactSmCard from "../../contacts/ContactSmCard";
import { ContactSmCardDefault } from "../../contacts/ContactSmCard"; // Importar la versión default si existe
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiRequest } from "../../../utils/api";

const HomeSideContent = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserMatches();
      
      // Refrescar matches cada 30 segundos
      const interval = setInterval(fetchUserMatches, 30000);
      return () => clearInterval(interval);
    } else {
      setMatches([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("/notification/my-matches");
      
      console.log("Matches API Response:", response); // DEBUG
      
      if (response.success) {
        // Filtrar matches que tengan datos básicos (nombre y avatar)
        const validMatches = (response.matches || []).filter(match => 
          match && (match.name || match.email)
        );
        
        // Limitar a máximo 4 matches
        const limitedMatches = validMatches.slice(0, 4);
        setMatches(limitedMatches);
      } else {
        setMatches([]);
        setError("No se pudieron cargar los matches");
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
      setError("Error al cargar los matches");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId) => {
    navigate(`/profile/${matchId}`);
  };

  const handleViewAllMatches = () => {
    navigate("/matches");
  };

  const handleRefreshMatches = () => {
    fetchUserMatches();
  };

  return (
    <div className="ml-2">
      {/* Navegación principal */}
      <div 
        onClick={() => navigate("/")} 
        className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-md rounded-full"
      >
        <BiHomeAlt2 />
        <p className="font-semibold">Inicio</p>
      </div>
      
      <div
        onClick={() => navigate("/meet")}
        className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-md rounded-full"
      >
        <BiHeart />
        <p className="font-semibold">Conocer</p>
      </div>
      
      <div 
        onClick={() => navigate('/meet')}  
        className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-md rounded-full"
      >
        <BiGridAlt />
        <p className="font-semibold">Explorar Comunidades</p>
      </div>
      
      <div 
        onClick={() => navigate('/createforum')} 
        className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-md rounded-full"
      >
        <BiPlus />
        <p className="font-semibold">Iniciar comunidad</p>
      </div>

      {/* Sección de matches con botón de refresh */}
      <div className="flex justify-between items-center my-2">
        <p className="font-semibold text-lg">Mis Matches</p>
        <div className="flex items-center space-x-2">
          {matches.length > 0 && (
            <button 
              onClick={handleRefreshMatches}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Actualizar matches"
            >
              ↻
            </button>
          )}
          {matches.length >= 4 && (
            <button 
              onClick={handleViewAllMatches}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
            >
              Ver todos
              <BiChevronRight />
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {/* Mostrar skeletons solo para carga inicial */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-2 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-2">
            <p className="text-red-500 text-sm mb-2">{error}</p>
            <button 
              onClick={handleRefreshMatches}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            {/* Usuario actual SIEMPRE primero */}
            {isAuthenticated && user && (
              <ContactSmCard 
                key="current-user"
                name={user.name}
                avatar={user.avatar}
                major={user.major}
                isOnline={true}
                isCurrentUser={true}
                onClick={() => navigate(`/profile/${user._id || user.id}`)}
              />
            )}
            
            {/* Matches reales del usuario */}
            {matches.length > 0 ? (
              matches.map((match) => (
                <ContactSmCard 
                  key={match._id || match.id}
                  name={match.name}
                  avatar={match.avatar}
                  major={match.major}
                  ig_user={match.ig_user}
                  isOnline={true}
                  onClick={() => handleMatchClick(match._id || match.id)}
                />
              ))
            ) : (
              // Cuando no hay matches, mostrar opciones
              <>
                <div 
                  onClick={() => navigate('/meet')}
                  className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-sm rounded-full border border-dashed border-gray-300 text-gray-600"
                >
                  <BiHeart className="text-red-500" />
                  <p className="flex-1">Encuentra nuevos matches</p>
                </div>
                
                <div 
                  onClick={() => navigate('/user/all')}
                  className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-sm rounded-full border border-dashed border-gray-300 text-gray-600"
                >
                  <BiUser className="text-blue-500" />
                  <p className="flex-1">Explorar usuarios</p>
                </div>
              </>
            )}
            
            {/* Mostrar contador si hay exactamente 4 matches */}
            {matches.length === 4 && (
              <div 
                onClick={handleViewAllMatches}
                className="flex items-center justify-center space-x-1 mb-2 cursor-pointer hover:bg-zinc-50 p-2 text-sm rounded-full border border-dashed border-gray-300 text-gray-600"
              >
                <BiUser className="text-blue-500" />
                <span>Ver más matches</span>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default HomeSideContent;