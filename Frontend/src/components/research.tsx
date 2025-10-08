import { useState, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import UploadModal from './UploadModal';
import DocumentCard from './DocumentCard';

export interface ResearchPaper {
  _id: string;
  title: string;
  virus: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string | Date;
  summary?: string;
}

function Research() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || '';

  // Load existing papers from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/research`);
        if (!res.ok) throw new Error('Failed to load research papers');
        const data = await res.json();
        setPapers(data);
      } catch (e) {
        console.warn('Could not fetch research papers:', (e as any)?.message || e);
      }
    })();
  }, []);

  const handleUpload = async (paper: { title: string; virus: string; file: File }) => {
    try {
      const formData = new FormData();
      formData.append('title', paper.title);
      formData.append('virus', paper.virus);
      formData.append('file', paper.file);

      const res = await fetch(`${API_BASE}/api/research`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const doc: ResearchPaper = await res.json();
      setPapers((prev) => [doc, ...prev]);
      setIsModalOpen(false);
    } catch (e) {
      alert(`Upload failed: ${(e as any)?.message || e}`);
    }
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
                key={paper._id}
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

export default Research;
