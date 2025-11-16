import React from 'react';

interface RegisterBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterBrandModal: React.FC<RegisterBrandModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="p-6 border-b border-zinc-800 shrink-0">
          <h2 id="register-modal-title" className="text-xl font-bold text-slate-100">Register Your Brand</h2>
          <p className="text-sm text-zinc-400 mt-1">A great name is an asset. Here's how to protect it.</p>
        </header>

        <main className="p-6 overflow-y-auto text-zinc-300 space-y-6">
            <div>
                <h3 className="font-semibold text-lg text-slate-100 mb-2">What is a Trademark?</h3>
                <p>A trademark is a sign capable of distinguishing the goods or services of one enterprise from those of other enterprises. It's your legal claim to a name, logo, or slogan in your specific field. Registering it gives you exclusive rights and legal recourse against infringement.</p>
            </div>
            
            <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold text-lg text-slate-100 mb-2">Essential Tools for Trademark Research</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-cyan-400">EUIPO</h4>
                        <p className="text-sm mb-2">The European Union Intellectual Property Office is the official body for registering trademarks that have effect across the entire EU. It's the starting point for protection in Europe.</p>
                        <a href="https://euipo.europa.eu/ohimportal/en/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#00ff99] hover:underline">
                            Visit EUIPO &rarr;
                        </a>
                    </div>
                     <div>
                        <h4 className="font-semibold text-cyan-400">TMview</h4>
                        <p className="text-sm mb-2">TMview is a free, global database of trademarks from over 70 intellectual property offices. It's an indispensable tool for checking if a name you're considering is already registered anywhere in the world.</p>
                        <a href="https://www.tmdn.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#00ff99] hover:underline">
                            Search on TMview &rarr;
                        </a>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400">USPTO</h4>
                        <p className="text-sm mb-2">The United States Patent and Trademark Office is the federal agency for granting U.S. patents and registering trademarks. If the United States is a primary market for your business, searching and registering with the USPTO is a critical step.</p>
                        <a href="https://www.uspto.gov/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#00ff99] hover:underline">
                            Explore the USPTO &rarr;
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold text-lg text-slate-100 mb-2">The Process</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li><strong>Search First:</strong> Before you get attached to a name, use TMview to see if it's already in use in your industry and target markets.</li>
                    <li><strong>Classify Your Goods/Services:</strong> Determine the correct NICE classes for your business. This is a critical step.</li>
                    <li><strong>File Your Application:</strong> Use the appropriate office (like EUIPO for Europe or USPTO for the US) to file your application.</li>
                    <li><strong>Monitor and Defend:</strong> Once registered, it's your responsibility to monitor for infringement and defend your mark.</li>
                </ol>
            </div>
        </main>
        
        <footer className="p-6 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RegisterBrandModal;