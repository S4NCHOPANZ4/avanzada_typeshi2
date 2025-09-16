import React from "react";

// type DefaultButtonProps = {
//   text?: string;
//   textColor?: string;
//   color?: string;
//   w?: string;
//   h?: string;
//   px?: string;
//   py?: string;
//   m?: string;
//   animated?: boolean;
//   onClick?: () => void;
// };

const DefaultButton = ({color, w,h,px,py,m,textColor,animated, text}) => {
  return (
    // onClick={onClick}
    // 
    <button  
    className={`${animated && "font-normal transition-transform duration-200 ease-in-out hover:scale-105"} ${color} ${w} ${h} ${px} ${py} ${m} ${textColor} rounded-sm cursor-pointer`}> 
      {text}
    </button>
  );
};

export default DefaultButton;
