import { useState, useEffect } from "react";
import { IoLogoGithub, IoMdClose } from "react-icons/io";
import { MdOutlineMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DefaultButton from "./buttons/DefaultButton.jsx";

const MainNavbar = () => {

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false)
  let lastScrollY = 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`bg-white w-full h-[50px] md:h-[65px] flex items-center justify-between px-3 md:px-[2rem] fixed z-[100] transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div onClick={()=>navigate('/')} className="text-[2rem] md:text-[3rem] cursor-pointer">
        <IoLogoGithub />
      </div>
      <div className="hidden h-full md:flex font-semibold items-center space-x-2 [&>p]:h-[80%] [&>p]:flex [&>p]:items-center [&>p]:hover:bg-neutral-50 [&>p]:px-[.5rem] [&>p]:rounded-md [&>p]:cursor-pointer">
        <p onClick={()=>navigate('/contactanos')} className="transition-transform duration-100 ease-in-out hover:scale-102">
          Contactanos
        </p>
        <p onClick={()=>navigate('/servicios')}  className="cursor-pointer transition-transform duration-100 ease-in-out hover:scale-102">
          Servicios
        </p>
        <p onClick={()=>navigate('/nosotros')}  className="cursor-pointer transition-transform duration-100 ease-in-out hover:scale-102">
          Nosotros
        </p>
        <DefaultButton text={"Consultar"} px={"px-3"} py={"py-2"} onClick={() => navigate('/consultarCaso')} animated={true}/>
        <DefaultButton text={"Nuestro Blog"} color={"bg-yellow-950"} px={"px-3"} py={"py-2"} onClick={() => navigate('/consultarCaso')} animated={true}/>
      </div>
      <div className="md:hidden flex items-center justify-center h-[100%] aspect-square  rounded-md relative transition-all duration-200 ease-in-out cursor-pointer">
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl w-full h-full">
          <MdOutlineMenu className={`${!isOpen ? "" : "hidden"} text-black text-2xl `} />
          <IoMdClose className={`${isOpen ? "" : "hidden"} text-black text-2x`} />
        </button>
        <div className={`${isVisible && isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}  absolute w-[200px] top-[110%] bg-white
         right-0 text-right  rounded-md  transition-all duration-200 ease-in-out 
         [&>p]:py-2 [&>p]:px-[1rem] font-semibold [&>p]:hover:bg-zinc-100 overflow-hidden text-sm  [&>p]:hover:text-zinc-800 overflow-hidden  [&>p]:transition-all  duration-50  ease-in-out`}>
          <p onClick={() => navigate('/')}>
            Inicio
          </p>
          <p onClick={() => navigate('/servicios')}>
            Servicios
          </p>
          <p onClick={() => navigate('/nosotros')}>
            Nosotros
          </p>
          <p onClick={() => navigate('/contactanos')}>
            Contactanos
          </p>
          <p onClick={() => navigate('/consultarCaso')} className="bg-stone-800 text-white transition-all  duration-500  ease-in-out">Consultar Caso</p>
          <p onClick={() => navigate('/blog')}>
            Nuestro Blog
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainNavbar;
