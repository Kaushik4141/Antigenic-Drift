import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  useEffect(() => {
    const footerInner = document.querySelector('.footer-inner');
    if (footerInner) {
      const enter = () => {
        gsap.to('.footer-inner', {
          '--footer-bg-value': '90% 0%',
          duration: 1,
          ease: 'power3.out',
        } as any);
      };
      const leave = () => {
        gsap.to('.footer-inner', {
          '--footer-bg-value': '3.7% 0%',
          duration: 1,
          ease: 'power3.out',
        } as any);
      };
      footerInner.addEventListener('mouseenter', enter);
      footerInner.addEventListener('mouseleave', leave);
      return () => {
        footerInner.removeEventListener('mouseenter', enter);
        footerInner.removeEventListener('mouseleave', leave);
      };
    }
  }, []);

  return (
    <div className="footer w-full mt-[110px] px-[10px] pb-[65px] md:px-0 flex flex-col items-center relative bg-contain bg-center bg-no-repeat"
         style={{ backgroundImage: 'url()' }}>
      <div className="footer-inner relative overflow-hidden w-[var(--box-width)] p-[10px] pb-[15px] md:p-[20px] flex flex-col items-center gap-[10px] rounded-[40px]"
           style={{
             background: 'radial-gradient(133% 150% at var(--footer-bg-value, 3.7% 0%), rgb(255, 122, 59), rgb(255, 115, 0) 0%, rgba(255, 255, 255, 0.03) 38%)'
           }}>
        <div className="footer-top w-[95%] lg:w-full flex flex-col items-center gap-[30px]">
          <div className="flex items-center gap-2 text-white my-[15px]">
            <span className="syne text-3xl font-bold">Antigenic Drift</span>
          </div>
          
          <div className="w-full flex flex-col items-center p-[30px] md:px-[58px] md:py-[47px] border-[1px] border-solid border-[#ffffff4d] rounded-[40px] bg-[#ffffff0a]">
            <h1 className="syne text-[30px] md:text-[40px] lg:text-[80px] text-white font-bold leading-[1em] text-center w-[100%] lg:w-[80%]">
              Anticipate Tomorrow's Threats. Build Today's Immunity.
            </h1>
            <h5 className="syne text-[16px] md:text-[20px] lg:text-[26px] text-[#ffffffcc] text-center font-semibold leading-[1.2em] md:leading-[1em] mt-[24px] mb-[51px] w-[80%] lg:w-full">
              Our platform provides real-time, data-driven forecasts of viral evolution, allowing researchers to get ahead of the next pandemic threat.
            </h5>
            <Link to="/predict" className="syne text-[16px] md:text-[17px] lg:text-[20px] leading-[1em] font-bold text-white border-[1px] border-solid border-[#fff] rounded-[50px] w-full md:w-[651px] flex flex-row items-center justify-center gap-[5px] transition-all duration-500 hover:gap-[350px]">
              <span className="btn-text pl-[10px] py-[25px] md:py-[30px] md:pl-[30px]">Let's Predict</span>
              <span className="btn-icon flex items-center justify-center transform rotate-90 bg-transparent h-[74px] w-[74px] md:h-[74px] md:w-[74px] rounded-full transition-all duration-400 hover:rotate-45 hover:bg-[rgba(255,255,255,0.15)]">
                <ArrowUp className="w-[25px] h-[25px]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;