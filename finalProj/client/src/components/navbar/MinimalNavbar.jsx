import { useNavigate } from "react-router-dom";
import icon from "../../assets/icon_l.png";
import { CiUser } from "react-icons/ci";
import { IoAdd } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";

const MinimalNavbar = () => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-white w-full h-[50px] md:h-[60px] flex items-center justify-between
      px-2 md:px-[2rem] fixed z-[100] transition-transform duration-300 border-b border-stone-300`}
    >
      <div className=" h-[40px] cursor-pointer">
        <img src={icon} alt="" className="w-auto h-full" />
      </div>
    </div>
  );
};

export default MinimalNavbar;
