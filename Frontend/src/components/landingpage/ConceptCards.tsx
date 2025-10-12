import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

interface ConceptCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  details: {
    left: string[];
    right: string[];
  };
}

const ConceptCards: React.FC = () => {
  const [openCard, setOpenCard] = useState<number | null>(null);

  const conceptCards: ConceptCard[] = [
    {
      id: 1,
      title: "Ebola_Clade_B",
      description: "EBOV exhibits a high mutation rate, and adaptive mutations in its glycoprotein can increase infectivity in human cells. Prevention relies on approved vaccines (for Zaire ebolavirus), strict infection control, rapid contact tracing, and safe burial protocols",
      imageUrl: "/ebola.jpg",
      details: {
        left: [
          "• Concept Development",
          "• Location Scouting", 
          "• Casting and Talent Selection",
          "• Wardrobe and Styling"
        ],
        right: [
          "• Budgeting and Scheduling",
          "• Equipment Rental",
          "• Storyboarding and Shot List"
        ]
      }
    },
    {
      id: 2,
      title: "Influenza_A_H1N1_Subtype_X",
      description: "Influenza A H1N1 constantly evolves through Antigenic Drift (small mutations in HA/NA proteins) and Antigenic Shift\\ (major genetic reassortment) to evade immunity and enhance growth. Prevention is primarily achieved through annual vaccination and non-pharmaceutical interventions like hand hygiene and avoiding close contact with sick individuals.",
      imageUrl: "/influ.jpg",
      details: {
        left: [
          "• Cinematography",
          "• Drone Videography",
          "• Live Streaming",
          "• Steadicam and Gimbal Work"
        ],
        right: [
          "• Multi-Camera Setup",
          "• Time-Lapse and Slow Motion",
          "• Green Screen and Chroma Key",
          "• Dynamic Webinars"
        ]
      }
    },
    {
      id: 3,
      title: "Zika_Variant_Alpha", 
      description: "Zika virus mutations enhance its growth and spread, particularly the V473M change increasing transmission; prevention relies on mosquito control and avoiding travel to affected areas.",
      imageUrl: "zika.jpg",
      details: {
        left: [
          "• Zika Mutations:** Genetic changes, e.g., V473M, boost virus growth and spread.",
          "• Audio Enhancement",
          "• 3D Animation and CGI",
          "• Subtitles and Closed Captions"
        ],
        right: [
          "• Whiteboard Animation",
          "• DVD and Blu-ray Authoring",
          "• Distribution Services",
          "• Archiving and Backup"
        ]
      }
    },
    {
      id: 4,
      title: "Rhinovirus_Type_A", 
      description: "Rhinovirus exhibits rapid mutation and over 160 serotypes, making it highly adaptable and facilitating constant growth; prevention focuses on frequent hand washing and avoiding contact with infected respiratory droplets.",
      imageUrl: "/rhino.jpg",
      details: {
        left: [
          "• Color Grading",
          "• Audio Enhancement",
          "• 3D Animation and CGI",
          "• Subtitles and Closed Captions"
        ],
        right: [
          "• Whiteboard Animation",
          "• DVD and Blu-ray Authoring",
          "• Distribution Services",
          "• Archiving and Backup"
        ]
      }
    },
    {
      id: 5,
      title: "Sars_Like_Coron_V_2025", 
      description: "SARS-like coronaviruses mutate rapidly, particularly in the Spike protein, leading to variants with Increased transmissibility and growth. Prevention relies on up-to-date vaccination, improved ventilation, masking, and rigorous public health surveillance to control its spread.",
      imageUrl: "/sars.jpg",
      details: {
        left: [
          "• Color Grading",
          "• Audio Enhancement",
          "• 3D Animation and CGI",
          "• Subtitles and Closed Captions"
        ],
        right: [
          "• Whiteboard Animation",
          "• DVD and Blu-ray Authoring",
          "• Distribution Services",
          "• Archiving and Backup"
        ]
      }
    }
    
  ];

  useEffect(() => {
    const cards = document.querySelectorAll('.concept-cards .concept-card');

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          "--gradient-x": "50%",
          duration: 0.7,
          ease: "power3.out"
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          "--gradient-x": "0%", 
          duration: 0.5,
          ease: "power2.out"
        });
      });
    });
  }, []);

  const toggleCard = (cardId: number) => {
    setOpenCard(openCard === cardId ? null : cardId);
  };

  return (
    <div id="albums" className="concept-parent w-full flex justify-center relative mt-[100px]">
      <div className="concept w-[var(--box-width)] flex flex-col lg:flex-row items-center lg:items-[unset] gap-[25px] md:gap-0 z-50 pb-[100px]">
        <div className="concept-heading h-full w-[95%] lg:w-[33%] flex flex-col lg:flex-col md:flex-row justify-between items-center md:items-start relative">
          <h2 className="syne text-[25px] lg:text-[30px] font-semibold text-white leading-[1.2em] lg:sticky top-[50px] mb-7 lg:mb-[100px] text-center md:text-start">
            Diseases:<br/>
            
          </h2>

          <Link to="/predict" className="syne hover-btn text-[14px] lg:text-[16px] font-bold leading-[1em] text-white rounded-[50px] py-[18px] px-[30px] lg:py-[17px] lg:px-[33px] cursor-pointer flex items-center gap-[8px] relative">
            <div className="red-circle w-[12px] h-[12px] bg-[#FF000D] rounded-full"></div>
            <span>Explore Features</span>
          </Link>
        </div>

        <div className="concept-cards w-[95%] lg:w-[67%] flex flex-col gap-[30px]">
          {conceptCards.map((card) => (
            <div 
              key={card.id}
              className={`concept-card w-full p-[40px] rounded-[30px] flex flex-col items-start gap-[21px] cursor-pointer relative ${openCard === card.id ? 'open' : ''}`}
              onClick={() => toggleCard(card.id)}
            >
              <img 
                className="w-[220px] h-[260px] absolute top-[-180px] right-[30px] rounded-[20px] transition-all duration-700 ease-out opacity-0 transform rotate-4" 
                src={card.imageUrl} 
                alt={card.title}
              />

              <h3 className="syne text-[26px] text-transparent font-semibold leading-[1em]">
                {card.title}
              </h3>
              <p className="inter text-[19px] font-normal leading-[1.5em] text-[rgba(255,255,255,0.8)]">
                {card.description}
              </p>
              
              <div className={`concept-card-details w-full flex flex-col md:flex-row gap-[0px] md:gap-[175px] overflow-hidden transition-all duration-400 ease-in-out ${openCard === card.id ? 'opacity-1' : 'opacity-0 h-0'}`}>
                <p className="inter text-[12px] font-normal leading-[2em] text-white uppercase">
                  {card.details.left.map((item, index) => (
                    <React.Fragment key={index}>
                      {item}
                      {index < card.details.left.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p className="inter text-[12px] font-normal leading-[2em] text-white uppercase">
                  {card.details.right.map((item, index) => (
                    <React.Fragment key={index}>
                      {item}
                      {index < card.details.right.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConceptCards;