import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainNavbar from "../../navbar/MainNavbar";
import CharacterDisplay from "../../character/CharacterDisplay";
import { apiRequest } from "../../../utils/api";
import { 
  BiArrowBack, 
  BiLike, 
  BiChat, 
  BiShareAlt, 
  BiSend,
  BiTrash,
  BiDotsVertical,
  BiHeart 
} from "react-icons/bi";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [postLikes, setPostLikes] = useState([]);
  const [likingPost, setLikingPost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPostData();
      fetchPostComments();
    }
  }, [postId]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/post/${postId}`);
      
      if (response.success) {
        setPost(response.post);
        setPostLikes(response.post.likes || []);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPostComments = async (pageNum = 1) => {
    try {
      setLoadingComments(true);
      const response = await apiRequest(`/comments/post/${postId}?page=${pageNum}&limit=10`);
      
      if (response.success) {
        if (pageNum === 1) {
          setComments(response.comments);
        } else {
          setComments(prev => [...prev, ...response.comments]);
        }
        setHasMore(response.pagination.page < response.pagination.pages);
        setPage(pageNum);
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
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim() || sendingComment) return;
    
    setSendingComment(true);
    try {
      const response = await apiRequest("/comments/create", {
        method: "POST",
        body: JSON.stringify({
          content: newComment,
          post_id: postId
        })
      });
      
      if (response.success) {
        setComments([response.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(error.message || "Error al enviar comentario");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) return;
    
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

  const handleLikePost = async () => {
    if (!isAuthenticated || likingPost) return;
    
    setLikingPost(true);
    try {
      const response = await apiRequest(`/post/${postId}/like`, {
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

  const handleLoadMore = () => {
    fetchPostComments(page + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <MainNavbar />
        <div className="flex w-full pt-[50px] justify-center items-center h-[calc(100vh-50px)]">
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 mr-3 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando publicación...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = currentUser && post.author_id?._id === currentUser._id;
  const isLiked = postLikes.some(likeId => 
    likeId.toString() === (currentUser?._id || currentUser?.id)?.toString()
  );

  return (
    <div className="flex flex-col">
      <MainNavbar />
      <div className="flex w-full pt-[50px] md:pt-[50px]">
        <div className="flex-1"></div>
        <div className="w-[55%] p-4">
          {/* Botón para volver */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <BiArrowBack className="mr-2" />
            Volver
          </button>

          {/* Publicación principal */}
          <div className="border border-zinc-300 rounded-lg bg-white mb-6">
            {/* Encabezado */}
            <div className="p-4 flex space-x-2 items-center border-b border-zinc-200">
              <button
                onClick={() => navigate(`/profile/${post.author_id?._id || ''}`)}
                className="flex items-center space-x-2"
              >
                {post.author_id?.avatar ? (
                  <CharacterDisplay avatar={post.author_id.avatar} size={40} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                )}
              </button>
              <div className="flex-1">
                <button
                  onClick={() => navigate(`/profile/${post.author_id?._id || ''}`)}
                  className="font-semibold hover:text-red-500 text-left"
                >
                  {post.author_id?.name || 'Usuario Anónimo'}
                </button>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">
                    {post.date ? formatDate(post.date) : 'Hoy'}
                  </p>
                  {post.space_id?.name && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-red-500 font-medium">
                        {post.space_id.name}
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

            {/* Contenido */}
            <div className="p-4">
              <p className="text-gray-800 whitespace-pre-line text-lg">{post.content}</p>
            </div>

            {/* Estadísticas */}
            <div className="px-4 py-2 border-t border-zinc-200 flex justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>{comments.length} comentarios</span>
              </div>
            </div>

            {/* Acciones */}
         
          </div>

          {/* Sección de comentarios */}
          <div className="border border-zinc-300 rounded-lg bg-white">
            <div className="p-4 border-b border-zinc-200">
              <h3 className="font-semibold text-lg">Comentarios ({comments.length})</h3>
            </div>

            {/* Formulario para nuevo comentario */}
            {isAuthenticated && (
              <div className="p-4 border-b border-zinc-200">
                <form onSubmit={handleSubmitComment} className="flex space-x-2">
                  {currentUser?.avatar && (
                    <CharacterDisplay avatar={currentUser.avatar} size={40} />
                  )}
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
              </div>
            )}

            {/* Lista de comentarios */}
            <div className="p-4">
              {loadingComments && comments.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
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
                <>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex space-x-2 group">
                        <button
                          onClick={() => navigate(`/profile/${comment.author_id?._id || ''}`)}
                          className="flex-shrink-0"
                        >
                          {comment.author_id?.avatar ? (
                            <CharacterDisplay avatar={comment.author_id.avatar} size={40} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => navigate(`/profile/${comment.author_id?._id || ''}`)}
                                    className="font-semibold hover:text-red-500 text-left"
                                  >
                                    {comment.author_id?.name || 'Anónimo'}
                                  </button>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 mt-2">{comment.content}</p>
                                
                                {/* Acciones del comentario */}
                                <div className="flex items-center space-x-3 mt-3 text-sm text-gray-500">
                                  <button className="hover:text-red-500">Me gusta</button>
                                  <button className="hover:text-red-500">Responder</button>
                                  {comment.likesCount > 0 && (
                                    <span>{comment.likesCount} me gusta</span>
                                  )}
                                </div>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón para cargar más */}
                  {hasMore && (
                    <div className="text-center mt-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingComments}
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-full transition-all ease-in-out"
                      >
                        {loadingComments ? 'Cargando...' : 'Cargar más comentarios'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <BiChat className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No hay comentarios todavía</p>
                  {isAuthenticated && (
                    <p className="text-gray-400 text-sm mt-1">Sé el primero en comentar</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default PostDetailPage;