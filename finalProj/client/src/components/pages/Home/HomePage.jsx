import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MainNavbar from "../../navbar/MainNavbar";
import PostDefault from "../posts/PostDefault";
import HomeSideContent from "./HomeSideContent";
import { apiRequest } from "../../../utils/api";
import CreatePost from "../posts/CreatePost";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/post/recent');
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <MainNavbar />
      <div className="flex w-full pt-[50px] md:pt-[50px] ">
        <div className="flex-1 ">
          <div
            className="fixed top-[50px] md:top-[60px] w-[calc((100vw-55%)/2)] h-[calc(100vh-50px)] md:h-[calc(100vh-60px)] 
              bg-zinc-50 p-4 overflow-y-auto border-r border-zinc-200"
          >
            <HomeSideContent />
          </div>
        </div>
        <div className="w-[55%] p-4 flex flex-col items-center ">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 w-full">
              <div className="flex items-center mb-4">
                <svg className="animate-spin h-8 w-8 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando publicaciones...</span>
              </div>
              
              {/* Placeholders de carga que coinciden con el diseño */}
              <div className="w-full space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-full border border-zinc-300 rounded-lg bg-white animate-pulse">
                    <div className="p-4 flex space-x-2 items-center border-b border-zinc-200">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post, index) => (
                <PostDefault 
                  key={post._id || index} 
                  post={post}
                />
              ))}
            </>
          ) : (
            <div className="w-full text-center py-10">
              <div className="mb-4">
                <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No hay publicaciones todavía</p>
              <p className="text-gray-400 mb-6">Sé el primero en compartir algo con la comunidad</p>
            </div>
          )}
        </div>

        <div className="flex-1 p-4"></div>
      </div>
    </div>
  );
};

export default HomePage;