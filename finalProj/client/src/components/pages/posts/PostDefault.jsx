import { useState, useEffect } from "react";
import CharacterDisplay from "../../character/CharacterDisplay";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiRequest } from "../../../utils/api";
import { 
  BiChat, 
  BiLike, 
  BiShareAlt, 
  BiSend,
  BiTrash,
  BiDotsVertical 
} from "react-icons/bi";

const PostDefault = ({ post, author, showComments = true }) => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [postLikes, setPostLikes] = useState(post?.likes || []);
  const [likingPost, setLikingPost] = useState(false);

  // Si se pasa el post como prop, usar datos reales
  const postData = post || {
    content: "Este es un contenido de ejemplo para la publicación...",
    date: new Date().toISOString(),
    author_id: author || {
      name: "Usuario Ejemplo",
      avatar: {
        bodyColor: "#ffd7ba",
        hairStyle: "hair3",
        hairColor: "#2c1b18",
        eyeStyle: "eyes1",
        mouthStyle: "mouth1",
        backgroundColor: "#decd4aff"
      }
    }
  };

  // Verificar si el usuario actual es el autor
  const isAuthor = currentUser && postData.author_id?._id === currentUser._id;
  const isLiked = postLikes.some(likeId => 
    likeId.toString() === (currentUser?._id || currentUser?.id)?.toString()
  );

  useEffect(() => {
    if (showComments && postData._id) {
      fetchComments();
    }
  }, [postData._id, showComments]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await apiRequest(`/comments/post/${postData._id}?limit=3`);
      
      if (response.success) {
        setComments(response.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const handleLikePost = async () => {
    if (!isAuthenticated || likingPost) return;
    
    setLikingPost(true);
    try {
      const response = await apiRequest(`/post/${postData._id}/like`, {
        method: "POST"
      });
      
      if (response.success) {
        if (response.action === "liked") {
          setPostLikes([...postLikes, currentUser._id || currentUser.id]);
        } else {
          setPostLikes(postLikes.filter(likeId => 
            likeId.toString() !== (currentUser?._id || currentUser?.id)?.toString()
          ));
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPost(false);
    }
  };
const handleSubmitComment = async (e) => {
  e.preventDefault();
  if (!isAuthenticated || !newComment.trim() || sendingComment) return;
  
  setSendingComment(true);
  try {
    console.log("Enviando comentario:", {
      postId: postData._id,
      content: newComment,
      userId: currentUser?._id
    });
    
    const response = await apiRequest("/comments/create", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: newComment,
        post_id: postData._id
      })
    });
    
    console.log("Respuesta del servidor:", response);
    
    if (response.success && response.comment) {
      setComments([response.comment, ...comments]);
      setNewComment("");
      
      // También actualizar el contador de comentarios en el post
      // Esto es opcional pero útil
    } else {
      console.error("Respuesta no exitosa:", response);
      alert(response.message || "Error al enviar comentario");
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    console.error("Error details:", error.message);
    alert(error.message || "Error al enviar comentario");
  } finally {
    setSendingComment(false);
  }
};

  const handleDeleteComment = async (commentId) => {
    
    try {
      const response = await apiRequest(`/comments/${commentId}`, {
        method: "DELETE"
      });
      
      if (response.success) {
        setComments(comments.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Error al eliminar comentario");
    }
  };

  const handleViewPost = () => {
    if (postData._id) {
      navigate(`/post/${postData._id}`);
    }
  };

  return (
    <div className="w-[90%] my-4 border border-zinc-300 rounded-lg bg-white">
      {/* Encabezado del post */}
      <div className="p-4 flex space-x-2 items-center border-b border-zinc-200">
        <Link to={`/profile/${postData.author_id?._id || ''}`}>
          {postData.author_id?.avatar ? (
            <CharacterDisplay avatar={postData.author_id.avatar} size={40} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          )}
        </Link>
        <div className="flex-1">
          <Link to={`/profile/${postData.author_id?._id || ''}`}>
            <p className="font-semibold hover:text-red-500 cursor-pointer">
              {postData.author_id?.name || 'Usuario Anónimo'}
            </p>
          </Link>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500">
              {postData.date ? formatDate(postData.date) : 'Hoy'}
            </p>
            {postData.space_id?.name && (
              <>
                <span className="text-xs text-gray-300">•</span>
                <span onClick={() => navigate(`/space/${postData.space_id.id}`)} className="text-xs text-red-500 font-medium cursor-pointer">
                  
                  {postData.space_id.name}
                </span>
              </>
            )}
            {isAuthor && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Tu publicación
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <div onClick={handleViewPost} className="p-4 cursor-pointer">
        <p className="text-gray-800 whitespace-pre-line">{postData.content}</p>
      </div>

      {/* Estadísticas del post */}
      <div className="px-4 py-2 border-t border-zinc-200 flex justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{comments.length} comentarios</span>
        </div>
      </div>



      {/* Sección de comentarios (si está habilitada) */}
      {showComments && isAuthenticated && (
        <div className="border-t border-zinc-200 p-4">
          {/* Formulario para nuevo comentario */}
          <form onSubmit={handleSubmitComment} className="flex space-x-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={sendingComment}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || sendingComment}
              className="cursor-pointer bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-full transition-all ease-in-out flex items-center"
            >
              {sendingComment ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <BiSend className="text-lg" />
              )}
            </button>
          </form>

          {/* Lista de comentarios */}
          {loadingComments ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.slice(0, showAllComments ? comments.length : 3).map((comment) => (
                <div  key={comment._id} className="flex space-x-2 group">
                  <Link to={`/profile/${comment.author_id?._id || ''}`}>
                    {comment.author_id?.avatar ? (
                      <CharacterDisplay avatar={comment.author_id.avatar} size={32} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/profile/${comment.author_id?._id || ''}`}>
                            <p className="font-semibold text-sm hover:text-red-500 cursor-pointer">
                              {comment.author_id?.name || 'Anónimo'}
                            </p>
                          </Link>
                          <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(comment.author_id?._id === currentUser?._id || isAuthor) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Eliminar comentario"
                            >
                              <BiTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>

                        <button className="hover:text-red-500">Responder</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mostrar más/ver todos */}
              {comments.length > 3 && !showAllComments && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Ver {comments.length - 3} comentarios más
                  </button>
                  <span className="mx-2 text-gray-300">•</span>
                  <button
                    onClick={handleViewPost}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Ver todos los comentarios
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-2">Sé el primero en comentar</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostDefault;