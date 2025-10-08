import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const BrandPartners: React.FC = () => {
  const logos = [
    'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=150&h=50',
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=150&h=50',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=150&h=50',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150&h=50',
    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150&h=50',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150&h=50',
  ];

  useEffect(() => {
    const wrapper = document.querySelector(".logos-wrapper") as HTMLElement;
    const container = document.querySelector(".logos-container") as HTMLElement;

    if (wrapper && container) {
      const clone = wrapper.cloneNode(true);
      container.appendChild(clone);

      const totalWidth = wrapper.offsetWidth;

      gsap.to(".logos-wrapper", {
        x: `-${totalWidth}px`,
        duration: 12,
        ease: "none",
        repeat: -1
      });
    }
  }, []);

  return (
    <div className="brand-partners w-full h-[40vh] md:h-[65vh] flex flex-col items-center justify-center gap-[35px] md:gap-[55px]">
      <h2 className="syne text-[25px] lg:text-[30px] font-semibold text-white leading-[1em] text-center">
        Powered by
      </h2>

      <div className="logos-container w-[95%] lg:w-[1200px] border-[1px] border-solid border-[#ffffff73] rounded-[80px] flex items-center overflow-hidden">
        <div className="logos-wrapper flex">
          {logos.map((logo, index) => (
            <div key={index} className="img-box w-[150px] lg:w-[200px] md:w-[175px] h-[70px] md:h-[88px] p-[15px] border-r-[1px] border-solid border-[#ffffff73] shrink-0">
              <img className="w-full h-full object-contain filter grayscale brightness-0 invert opacity-70" src={logo} alt={`Logo ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandPartners;