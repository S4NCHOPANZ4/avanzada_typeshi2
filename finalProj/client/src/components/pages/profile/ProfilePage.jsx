import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import CharacterDisplay from "../../character/CharacterDisplay";
import MainNavbar from "../../navbar/MainNavbar";
import PostDefault from "../posts/PostDefault";
import { apiRequest } from "../../../utils/api";
import { BiUserCheck, BiHeart, BiX, BiCheck } from "react-icons/bi";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchStatus, setMatchStatus] = useState("none"); // 'none', 'pending_outgoing', 'pending_incoming', 'matched'
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProfileData();
  }, [id, currentUser, isAuthenticated, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Función helper para obtener ID
      const getUserId = (user) => {
        return user?._id || user?.id;
      };

      const userId = id || getUserId(currentUser);

      if (!userId) {
        navigate("/");
        return;
      }

      // Verificar si es el perfil propio
      const isOwn = userId === getUserId(currentUser);
      setIsOwnProfile(isOwn);

      // Cargar datos del usuario
      if (isOwn) {
        setProfileUser(currentUser);
        // Cargar matches del usuario actual
        fetchUserMatches(currentUser._id || currentUser.id);
        // No verificar match status para perfil propio
        setMatchStatus("none");
      } else {
        try {
          const response = await apiRequest(`/user/${userId}`);
          if (response.success && response.user) {
            setProfileUser(response.user);
            // Cargar matches del perfil visitado
            fetchUserMatches(userId);
            // Verificar estado de match con este usuario
            checkMatchStatus(userId);
          } else {
            navigate("/");
            return;
          }
        } catch (apiError) {
          console.error("Error en apiRequest:", apiError);
          navigate("/");
          return;
        }
      }

      // Cargar posts del usuario
      await fetchUserPosts(userId);

    } catch (error) {
      console.error("Error en fetchProfileData:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener matches de un usuario
  const fetchUserMatches = async (userId) => {
    try {
      setLoadingMatches(true);
      // Usar el endpoint de notificaciones para obtener matches
      const response = await apiRequest("/notification/my-matches");
      
      if (response.success) {
        // Si es perfil propio, mostrar todos los matches
        if (userId === (currentUser?._id || currentUser?.id)) {
          setMatches(response.matches || []);
        } else {
          // Para otros perfiles, mostrar solo el número
          setMatches(response.matches || []);
        }
      }
    } catch (error) {
      console.error("Error cargando matches:", error);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Verificar estado de match con un usuario específico
  const checkMatchStatus = async (targetUserId) => {
    try {
      // Primero verificar si ya son matches
      const matchesResponse = await apiRequest("/notification/my-matches");
      
      if (matchesResponse.success) {
        const isMatch = matchesResponse.matches.some(match => 
          (match._id || match.id) === targetUserId
        );
        
        if (isMatch) {
          setMatchStatus("matched");
          return;
        }
      }

      // Verificar si hay solicitud pendiente
      const notificationsResponse = await apiRequest("/notification/my-notifications");
      
      if (notificationsResponse.success) {
        const hasOutgoingRequest = notificationsResponse.notifications.some(notification => 
          notification.type === "match_request" && 
          notification.to_user === targetUserId &&
          !notification.read
        );
        
        const hasIncomingRequest = notificationsResponse.notifications.some(notification => 
          notification.type === "match_request" && 
          notification.from_user?._id === targetUserId &&
          !notification.read
        );
        
        if (hasOutgoingRequest) {
          setMatchStatus("pending_outgoing");
        } else if (hasIncomingRequest) {
          setMatchStatus("pending_incoming");
        } else {
          setMatchStatus("none");
        }
      } else {
        setMatchStatus("none");
      }
    } catch (error) {
      console.error("Error verificando estado de match:", error);
      setMatchStatus("none");
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const response = await apiRequest(`/post/user/${userId}`);
      if (response.success) {
        setUserPosts(response.posts || []);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error("Error cargando posts:", error);
      setUserPosts([]);
    }
  };

  const handleMatchRequest = async () => {
    if (!profileUser || isOwnProfile || matchLoading) return;
    
    setMatchLoading(true);
    try {
      const response = await apiRequest("/notification/match/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: profileUser._id || profileUser.id
        })
      });
      
      if (response.success) {
        setMatchStatus("pending_outgoing");
      }
    } catch (error) {
      console.error("Error enviando solicitud de match:", error);
      alert(error.message || "Error al enviar solicitud de match");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleUnmatch = async () => {
    if (!profileUser || isOwnProfile || matchLoading) return;
    
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el match con ${profileUser.name}?`)) {
      return;
    }
    
    setMatchLoading(true);
    try {
      const response = await apiRequest(`/notification/match/${profileUser._id || profileUser.id}`, {
        method: "DELETE"
      });
      
      if (response.success) {
        setMatchStatus("none");
        // Actualizar lista de matches
        fetchUserMatches(currentUser._id || currentUser.id);
      }
    } catch (error) {
      console.error("Error eliminando match:", error);
      alert(error.message || "Error al eliminar el match");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleAcceptMatch = async () => {
    if (!profileUser || isOwnProfile || matchLoading) return;
    
    setMatchLoading(true);
    try {
      // Buscar la notificación de match
      const notificationsResponse = await apiRequest("/notification/my-notifications");
      
      if (notificationsResponse.success) {
        const incomingRequest = notificationsResponse.notifications.find(notification => 
          notification.type === "match_request" && 
          notification.from_user?._id === (profileUser._id || profileUser.id) &&
          !notification.read
        );
        
        if (incomingRequest) {
          const acceptResponse = await apiRequest(`/notification/match/accept/${incomingRequest._id}`, {
            method: "POST"
          });
          
          if (acceptResponse.success) {
            setMatchStatus("matched");
            // Actualizar lista de matches
            fetchUserMatches(currentUser._id || currentUser.id);
          }
        }
      }
    } catch (error) {
      console.error("Error aceptando match:", error);
      alert(error.message || "Error al aceptar el match");
    } finally {
      setMatchLoading(false);
    }
  };

  // Función para obtener el botón según el estado del match
  const getMatchButton = () => {
    if (isOwnProfile) return null;

    switch (matchStatus) {
      case "pending_outgoing":
        return (
          <button
            disabled
            className="cursor-not-allowed bg-yellow-500 text-white font-semibold px-6 py-2 rounded-full"
          >
            ⏳ Pendiente
          </button>
        );
      
      case "pending_incoming":
        return (
          <button
            onClick={handleAcceptMatch}
            disabled={matchLoading}
            className={`cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full transition-all ease-in-out flex items-center justify-center space-x-2 ${matchLoading ? "opacity-50" : ""}`}
          >
            {matchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <BiCheck size={20} />
                <span>Aceptar Match</span>
              </>
            )}
          </button>
        );
      
      case "matched":
        return (
          <button
            onClick={handleUnmatch}
            disabled={matchLoading}
            className={`cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-full transition-all ease-in-out flex items-center justify-center space-x-2 ${matchLoading ? "opacity-50" : ""}`}
          >
            {matchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <BiX size={20} />
                <span>Unmatch</span>
              </>
            )}
          </button>
        );
      
      default: // "none"
        return (
          <button
            onClick={handleMatchRequest}
            disabled={matchLoading}
            className={`cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full transition-all ease-in-out flex items-center justify-center space-x-2 ${matchLoading ? "opacity-50" : ""}`}
          >
            {matchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <BiHeart size={20} />
                <span>Match</span>
              </>
            )}
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <MainNavbar />
        <div className="flex w-full pt-[50px] md:pt-[50px] justify-center items-center h-[calc(100vh-50px)]">
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 mr-3 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <MainNavbar />
      <div className="flex w-full pt-[50px] md:pt-[50px]">
        <div className="flex-1"></div>
        <div className="w-[55%] p-4 flex flex-col items-center">
          <div className="w-full h-[200px] border-b border-zinc-300 flex items-center justify-between px-4">
            <div className="flex items-center space-x-6">
              {profileUser?.avatar ? (
                <CharacterDisplay avatar={profileUser.avatar} size={150} />
              ) : (
                <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center">
                  <span>Sin avatar</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-2xl">
                  {profileUser?.name || "Usuario"}
                </p>
                {profileUser?.major && (
                  <p className="text-sm text-gray-500">
                    <span className="text-zinc-700 font-semibold mr-1">
                      Carrera:
                    </span>
                    {profileUser.major}
                  </p>
                )}
                {profileUser?.ig_user && (
                  <p className="text-sm text-gray-500">
                    <span className="text-zinc-700 font-semibold mr-1">
                      Instagram:
                    </span>
                    {profileUser.ig_user}
                  </p>
                )}
                
                {/* Mostrar número de matches */}
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BiUserCheck />
                    <span>
                      {loadingMatches ? (
                        <span className="inline-block h-4 w-8 bg-gray-200 rounded animate-pulse"></span>
                      ) : (
                        <>
                          {matches.length} match{matches.length !== 1 ? "es" : ""}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col space-y-2">
              {/* Botón de Match/Unmatch/Aceptar según estado */}
              {!isOwnProfile && getMatchButton()}
              
              {isOwnProfile && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate("/createforum")}
                    className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-full transition-all ease-in-out"
                  >
                    Crear Foro
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="my-10 w-full">
            {userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <PostDefault
                  key={post._id || index}
                  post={post}
                  author={profileUser}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No hay publicaciones todavía</p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate("/create-post")}
                    className="mt-4 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full transition-all ease-in-out"
                  >
                    Crear primera publicación
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default ProfilePage;