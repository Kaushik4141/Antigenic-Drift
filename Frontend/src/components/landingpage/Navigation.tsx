import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`w-[var(--full-width)] flex items-center justify-center fixed top-[30px] z-[9999] ${isOpen ? 'active' : ''}`}>
      <header className="w-[85%] lg:w-[950px] rounded-[44px] py-[6px] pl-[20px] pr-[7px] bg-[#0d0d0d33] transition-all duration-300 ease-in-out overflow-hidden">
        <div className="header-top flex items-center justify-between">
          <div className="logo">
            <div className="flex items-center gap-2 text-white">
              
              <span className="syne text-xl font-bold">Antigenic Drift</span>
            </div>
          </div>
          <div className="links flex items-center gap-[10px]">
            <ul className="hidden lg:flex items-center nav-menu">
              <li className="px-[16px] py-[14px] rounded-[50px]">
                <Link className="syne flex text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/world">Map</Link>
              </li>
              <li className="px-[16px] py-[14px] rounded-[50px]">
                <Link className="syne flex text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/predict">Prediction</Link>
              </li>
              <li className="px-[16px] py-[14px] rounded-[50px]">
                <Link className="syne flex text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/research">Researchers</Link>
              </li>
             
              <li className="px-[16px] py-[14px] rounded-[50px]">
                <Link className="syne flex text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/predict">Login</Link>
              </li>
            </ul>
            <Link to="/predict" className="syne text-[#0d0d0d] bg-white text-[16px] leading-[1em] font-bold px-[33px] py-[17px] items-center gap-[7px] rounded-[50px] cursor-pointer hidden lg:flex">
             
            </Link>
            <div 
              className={`hamburger lg:hidden ${isOpen ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        </div>
        
        <div className={`mobile-menu flex flex-col items-center w-full gap-4 max-h-0 opacity-0 ${isOpen ? 'active' : ''}`}>
          <ul className="flex flex-col items-center w-full gap-2">
            <li className="px-[16px] py-[14px] rounded-[50px] w-full text-center">
              <Link className="syne flex justify-center text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/research" onClick={closeMenu}>Researchers</Link>
            </li>
            <li className="px-[16px] py-[14px] rounded-[50px] w-full text-center">
              <Link className="syne flex justify-center text-[16px] font-semibold leading-[1em] text-[#ffffffcc]" to="/predict" onClick={closeMenu}>Login</Link>
            </li>
            
          </ul>
          <Link to="/predict" onClick={closeMenu} className="syne text-[#0d0d0d] bg-Purple text-[16px] leading-[1em] font-bold px-[33px] py-[17px] rounded-[50px] cursor-pointer">
            Sign Up
          </Link>
        </div>
      </header>
    </nav>
  );
};

export default Navigation;