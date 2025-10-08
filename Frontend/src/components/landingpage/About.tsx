import React from 'react';

const About: React.FC = () => {
  return (
    <div id="about" className="concept-parent w-full flex justify-center relative mt-[100px] mb-[75px] lg:pb-[100px]">
      <div className="concept w-[var(--box-width)] flex items-center lg:items-[unset] flex-col lg:flex-row z-50 gap-[25px] md:gap-0 lg:pb-[100px]">
        <div className="concept-heading h-full w-[95%] lg:w-[33%] flex flex-col md:flex-row lg:flex-col justify-between items-center md:items-start relative">
          <h2 className="syne text-[30px] font-semibold text-white leading-[1.2em] lg:sticky top-[50px] mb-7 lg:mb-[100px]">
          About the Model & Methodology
          </h2>

          
        </div>

        <div className="about-content w-[95%] lg:w-[67%] flex flex-col gap-[15px] lg:gap-[30px]">
          <h2 className="inter text-[30px] md:text-[36px] text-[#ffffff80] font-light leading-[1.2em] tracking-[-1.5px] md:tracking-[-3px]">
            Our AI model utilizes a blend of cutting-edge machine learning{' '}
            <span className="text-white"> and deep neural networks, trained on massive datasets of viral genomic sequences. </span>{' '}
            We analyze key surface proteins to calculate evolutionary pressure {' '}
            <span className="text-white">and predict the timing and location of significant antigenic shifts.</span>
          </h2>
          <p className="inter text-[17px] text-[#fffc] font-light leading-[1.4em]">
            The primary goal is to provide a preemptive early-warning system. By accurately anticipating viral drift, our predictions can inform global public health decisions, accelerate vaccine design, and optimize the deployment of resources to mitigate future pandemic threats.
          </p>

          <div className="counts w-full flex items-center justify-center lg:justify-[unset] flex-wrap mt-[0px] lg:mt-[40px]">
            <div className="count-box w-[100%] md:w-[40%] flex items-center justify-center relative">
              <h2 className="syne text-[90px] font-bold count-number">15+</h2>
              <p className="syne w-full text-[17px] font-bold text-white uppercase text-center absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                Years of experience
              </p>
            </div>

            <div className="count-box w-[100%] md:w-[40%] flex items-center justify-center relative">
              <h2 className="syne text-[90px] font-bold count-number">200+</h2>
              <p className="syne w-full text-[17px] font-bold text-white uppercase text-center absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                Repeated Clients
              </p>
            </div>

            <div className="count-box w-[100%] md:w-[40%] flex items-center justify-center relative">
              <h2 className="syne text-[90px] font-bold count-number">478</h2>
              <p className="syne w-full text-[17px] font-bold text-white uppercase text-center absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                Completed Projects
              </p>
            </div>

            <div className="count-box w-[100%] md:w-[40%] flex items-center justify-center relative">
              <h2 className="syne text-[90px] font-bold count-number">350+</h2>
              <p className="syne w-full text-[17px] font-bold text-white uppercase text-center absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                Happy Clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;