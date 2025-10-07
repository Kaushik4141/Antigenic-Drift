import { FileText, Calendar } from 'lucide-react';
import type { ResearchPaper } from '../components/research';

interface DocumentCardProps {
  paper: ResearchPaper;
  onClick: () => void;
}

export default function DocumentCard({ paper, onClick }: DocumentCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-white transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
    >
      <div className="flex items-start gap-4">
        <div className="bg-white/10 p-3 rounded-lg">
          <FileText size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{paper.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <span className="bg-zinc-800 px-3 py-1 rounded-full">{paper.virus}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            <span>{formatDate(paper.uploadedAt)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-sm text-gray-500 truncate">{paper.fileName}</p>
      </div>
    </div>
  );
}
