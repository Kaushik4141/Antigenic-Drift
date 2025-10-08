import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How does the model predict antigenic drift?",
      answer: "Our model uses a deep learning architecture (e.g., recurrent neural networks or transformers) trained on millions of viral genomic sequences to identify non-synonymous mutations that confer immune escape."
    },
    {
      id: 2,
      question: "What data sources does the AI use?",
      answer: "We ingest public viral sequence data from databases like GISAID and NCBI, along with metadata on viral lineage, geographic location, and host immune pressure."
    },
    {
      id: 3,
      question: "How far in advance can the model predict a new variant?",
      answer: "Our current prediction horizon is 3 to 9 months for high-impact strains, allowing public health agencies crucial lead time for pre-emptive vaccine design"
    },
    {
      id: 4,
      question: "What is the model's accuracy (F1 Score)?",
      answer: "The model maintains a rolling F1 score of over 90% in identifying key immune-evasive mutations in circulating Influenza and SARS-CoV-2 strains."
    },
    {
      id: 5,
      question: "Which viruses are currently being tracked?",
      answer: "We are actively tracking Influenza A (H1N1 and H3N2), SARS-CoV-2, and key emerging threats like Zika and select Ebola species for early warning."
    },
    {
      id: 6,
      question: "How can this model be used in vaccine development?",
      answer: "By providing the projected sequence of the dominant future strain, the model directly informs the selection of the most appropriate vaccine antigen months ahead of time."
    }
  ];

  useEffect(() => {
    const items = document.querySelectorAll('.faq-item');
    
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          duration: 0.7,
          ease: "power3.out",
          "--faq-gradient-x": "50%",
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          duration: 0.5,
          ease: "power2.out",
          "--faq-gradient-x": "0%",
        });
      });
    });
  }, []);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div id="faq" className="faq w-full pt-[100px] pb-[0] lg:py-[100px] px-[10px] md:px-0 flex flex-col items-center gap-[60px] bg-contain bg-center bg-no-repeat"
         style={{
           backgroundImage: 'url()'
         }}>
      <h2 className="syne text-[25px] lg:text-[30px] font-semibold leading-[1em] text-white text-center">
        Curious? Check Out the Scoop! (FAQs)
      </h2>

      <div className="faq-main w-full md:w-[750px] flex flex-col items-start gap-[10px]">
        {faqData.map((faq) => (
          <div key={faq.id} className={`faq-item w-full border-[1px] border-solid border-[#ffffff4d] px-[24px] rounded-[20px] backdrop-blur-sm ${openFAQ === faq.id ? 'open' : ''}`}>
            <button 
              className="faq-question w-full text-left text-white pt-[24px] pb-[26px] flex justify-between items-center cursor-pointer transition-all duration-500"
              onClick={() => toggleFAQ(faq.id)}
            >
              <span className="syne text-[18px] font-semibold leading-[1.2em] text-white">
                {faq.question}
              </span>
              <span className={`faq-arrow transition-transform duration-500 ${openFAQ === faq.id ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-[25px] h-[25px] fill-white" />
              </span>
            </button>
            <div 
              className={`inter faq-answer text-[#ffffffcc] font-light text-[15px] leading-[1.4em] overflow-hidden transition-all duration-500 ease-in-out ${
                openFAQ === faq.id 
                  ? 'max-h-96 pb-[26px]' 
                  : 'max-h-0'
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;