import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import CharacterDisplay from '../character/CharacterDisplay';
import NotificationDropdown from '../notifications/NotificationDropdown.jsx';
import img from "../../assets/icon_l.png";

const MainNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-zinc-300 z-50">
      <div className="flex items-center h-full justify-between px-4 py-2">
        <div className="flex h-full items-center space-x-4 ml-5">
          <img onClick={()=> navigate('/')} src={img} className='h-[45px] cursor-pointer'></img>

        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Dropdown de notificaciones */}
              <NotificationDropdown />
              
              <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80">
                {user.avatar ? (
                  <CharacterDisplay avatar={user.avatar} size={45} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                )}
                <span className="font-semibold">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-1 rounded-full"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-semibold text-gray-700 hover:text-red-500"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded-full"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;