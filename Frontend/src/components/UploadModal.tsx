import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (paper: { title: string; virus: string; file: File }) => void;
}

const virusOptions = [
  'COVID-19',
  'Influenza',
  'HIV',
  'Ebola',
  'Zika',
  'Dengue',
  'Hepatitis',
  'Herpes',
  'HPV',
  'Measles',
  'Mumps',
  'Rabies',
  'Other',
];

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [virus, setVirus] = useState('');
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !virus || !file) {
      alert('Please fill in all fields');
      return;
    }

    onUpload({ title, virus, file });

    setTitle('');
    setVirus('');
    setFile(null);
  };

  const handleClose = () => {
    setTitle('');
    setVirus('');
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Upload Research Paper</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition-colors"
              placeholder="Enter paper title"
              required
            />
          </div>

          <div>
            <label htmlFor="virus" className="block text-sm font-medium mb-2">
              Virus
            </label>
            <select
              id="virus"
              value={virus}
              onChange={(e) => setVirus(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition-colors"
              required
            >
              <option value="">Select a virus</option>
              {virusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium mb-2">
              Research Paper
            </label>
            <div className="relative">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                required
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                <Upload size={20} />
                {file ? file.name : 'Choose file'}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
