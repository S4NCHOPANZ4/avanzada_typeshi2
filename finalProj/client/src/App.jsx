import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import HomePage from "./components/pages/Home/HomePage";
import RegisterPage from "./components/pages/register/RegisterPage";
import LoginPage from "./components/pages/login/LoginPage"; // Necesitarás crear esto
import ProfilePage from "./components/pages/profile/ProfilePage";
import ForumPage from "./components/pages/forum/ForumPage";
import MeetPage from "./components/pages/meet/MeetPage";
import CreateForum from "./components/pages/forum/CreateForum";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Componente para rutas protegidas
import CreatePostPage from "./components/pages/posts/CreatePostPage";
import PostDetailPage from "./components/pages/posts/PostDetailPage";

function App() {
  return (
    <Provider store={store}>
      <div className="bg-zinc-50 min-h-[100vh]">
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas - Requieren autenticación */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/space/:id" element={<ForumPage />} />
              <Route path="/createforum" element={<CreateForum />} />
              <Route path="/create-post/:id?" element={<CreatePostPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/meet" element={<MeetPage />} />
              <Route path="/" element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
