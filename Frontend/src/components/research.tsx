import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import UploadModal from './components/UploadModal';
import DocumentCard from './components/DocumentCard';

export interface ResearchPaper {
  id: string;
  title: string;
  virus: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
}

function research() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);

  const handleUpload = (paper: Omit<ResearchPaper, 'id' | 'uploadedAt'>) => {
    const newPaper: ResearchPaper = {
      ...paper,
      id: Date.now().toString(),
      uploadedAt: new Date(),
    };
    setPapers([newPaper, ...papers]);
    setIsModalOpen(false);
  };

  const handleOpenPaper = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Research Papers</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <Upload size={20} />
            Upload Paper
          </button>
        </div>

        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FileText size={64} className="mb-4" />
            <p className="text-xl">No research papers uploaded yet</p>
            <p className="text-sm mt-2">Click "Upload Paper" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <DocumentCard
                key={paper.id}
                paper={paper}
                onClick={() => handleOpenPaper(paper.fileUrl)}
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

export default research;
