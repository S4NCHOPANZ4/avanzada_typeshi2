import React from "react";
import CharacterDisplay from "../character/CharacterDisplay";
import { BiCircle, BiCheckCircle } from "react-icons/bi";

const ContactSmCard = ({ 
  name, 
  avatar, 
  major,
  ig_user,
  isOnline = false, 
  isCurrentUser = false,
  onClick 
}) => {
  // Si no hay nombre, no mostrar nada (no mostrar John Doe por defecto)
  if (!name) {
    return null;
  }

  return (
    <div 
      onClick={onClick}
      className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-zinc-100 p-2 text-md rounded-full"
    >
      <div className="relative">
        <CharacterDisplay 
          avatar={avatar || {
            bodyColor: "#ffd7ba",
            hairStyle: "hair1",
            hairColor: "#2c1b18",
            eyeStyle: "eyes1",
            mouthStyle: "mouth1",
            backgroundColor: "#4ade80"
          }} 
          size={30} 
        />
        <div className="absolute -bottom-1 -right-1">
          {isOnline ? (
            <BiCheckCircle className="text-green-500 text-sm bg-white rounded-full" />
          ) : (
            <BiCircle className="text-gray-300 text-sm bg-white rounded-full" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {name}
          {isCurrentUser && <span className="text-gray-400 ml-1">(Tú)</span>}
        </p>
        {(major || ig_user) && (
          <p className="text-xs text-gray-500 truncate">
            {major ? `${major}` : ''}
            {major && ig_user ? ' • ' : ''}
            {ig_user ? `${ig_user}` : ''}
          </p>
        )}
      </div>
    </div>
  );
};

// Opcional: Si quieres mantener una versión por defecto para testing
export const ContactSmCardDefault = () => {
  return (
    <div className="flex items-center space-x-2 mb-2 cursor-not-allowed p-2 text-md rounded-full opacity-50">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-400">Usuario no disponible</p>
        <p className="text-xs text-gray-400">Cargando...</p>
      </div>
    </div>
  );
};

export default ContactSmCard;