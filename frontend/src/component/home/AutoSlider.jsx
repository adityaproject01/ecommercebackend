import React, { useState, useEffect } from "react";
import homecss from './home.module.css'; 
import banner1 from "../../images/banner/51.bg.jpg";
import banner2 from "../../images/banner/52.jpg";
import banner3 from "../../images/banner/53.jpg";
import banner4 from "../../images/banner/54.jpg";
import banner5 from "../../images/banner/55.jpg";
import banner6 from "../../images/banner/56.jpg";
import banner7 from "../../images/banner/59.png";


const images = [banner1, banner2, banner3, banner4,banner5,banner6,banner7];

const AutoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className={`${homecss['slider-container']} `}>
      <img
      className={`${homecss['slider-container-styles']}`}
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
      />
    </div>
  );
};
export default AutoSlider;
