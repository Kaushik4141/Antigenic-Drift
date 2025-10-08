import React from 'react';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  pdfFileName: string;
}

const Blogs: React.FC = () => {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "New Omicron Subvariants 'Nimbus' and 'Stratus' Fueling Fall COVID-19 Surge by Boosting Transmissibility and Immune Evasion.",
      author: "Krishna Mohan Agarwal",
      date: "Dec 07 ,2006",
      category: "Research paper",
      imageUrl: "blog 1.jpg",
      pdfFileName: "research paper.pdf"
    },
    {
      id: 2,
      title: "Research Confirms Rhinovirus-C (RV-C) as a Major Cause of Severe Lower Respiratory Infection in Children.",
      author: "Michael Carter",
      date: "july 27, 2006",
      category: "Research paper",
      imageUrl: "/blog2.jpg",
      pdfFileName: "research paper.pdf"
    },
    {
      id: 3,
      title: "Flu Viruses Show Antigenic Drift in Non-Vaccine Component (NA); COVID-19 Pandemic May Have Created an Immunity Gap.",
      author: "John Davis",
      date: "april 18, 2006",
      category: "Research paper",
      imageUrl: "/blog 3.jpg",
      pdfFileName: "research paper.pdf"
    }
  ];

  // Function to handle PDF opening
  const handleOpenPdf = (pdfFileName: string) => {
    // Open PDF in a new tab
    window.open(`/${pdfFileName}`, '_blank');
  };

  // Function to handle "Read All Paper" button click
  const handleReadAllPapers = () => {
    window.open('/research paper.pdf', '_blank');
  };

  return (
    <div id="blogs" className="blogs w-full py-[100px] flex flex-col items-center gap-[50px] lg:gap-[80px] bg-contain bg-center bg-no-repeat"
         style={{
           backgroundImage: 'url()'
         }}>
      <div className="blogs-head flex flex-col items-center gap-[28px]">
        <h2 className="syne text-[25px] lg:text-[30px] font-semibold leading-[1em] text-white text-center">
          Dive into our Research Paper
        </h2>
        <button 
          className="syne hover-btn text-[14px] lg:text-[16px] font-bold leading-[1em] text-white rounded-[50px] py-[18px] px-[30px] lg:py-[17px] lg:px-[33px] cursor-pointer flex items-center gap-[8px] relative"
          onClick={handleReadAllPapers}
        >
          <div className="red-circle w-[12px] h-[12px] bg-[#FF000D] rounded-full"></div>
          <span>Read All Paper</span>
        </button>
      </div>

      <div className="blogs-cards-container w-[95%] lg:w-[var(--box-width)] flex flex-col lg:flex-row items-center justify-between gap-[25px] lg:gap-0">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-card w-full lg:w-[31.5%] transition-all duration-500 transform-gpu hover:translate-y-[-13px]">
            <div className="blog-img w-full h-[343px] overflow-hidden relative">
              <img 
                className="w-full h-full object-cover rounded-[20px] transition-all duration-400 hover:filter hover:grayscale hover:object-[50%_10%]" 
                src={post.imageUrl} 
                alt={post.title}
              />
              <button 
                className="syne w-[120px] h-[120px] flex items-center justify-center text-center rounded-full text-[15px] text-white font-semibold leading-[1em] uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.3)] backdrop-blur-sm opacity-0 transition-all duration-600 hover:opacity-100 cursor-pointer" 
                onClick={() => handleOpenPdf(post.pdfFileName)}
              >
                Read Paper
              </button>
            </div>
            <div className="blog-content w-full p-[8px] pt-[13px] flex flex-col items-start gap-[12px]">
              <span className="inter text-[12px] text-[#ff7a3b] font-light leading-[1em] uppercase">
                {post.category}
              </span>
              <h3 className="syne text-[18px] font-medium text-white leading-[1.3em]">
                {post.title}
              </h3>
              <div className="blog-date w-full flex items-center gap-[13px]">
                <span className="inter text-[15px] text-[#ffffff80] font-light leading-[1em] capitalize">
                  {post.author}
                </span>
                <div className="blog-circle w-[4px] h-[4px] bg-[#ffffff80] rounded-full"></div>
                <span className="inter text-[15px] text-[#ffffff80] font-light leading-[1em]">
                  {post.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;