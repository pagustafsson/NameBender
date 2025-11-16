import React from 'react';

interface RegisterBrandViewProps {
  onHome: () => void;
}

const RegisterBrandView: React.FC<RegisterBrandViewProps> = ({ onHome }) => {
  return (
    <div className="w-full max-w-4xl animate-fade-in">
        <div className="mb-8 flex justify-start items-center">
            <button onClick={onHome} className="text-sm text-[#00ff99] hover:underline">
                &larr; Back to Domain Search
            </button>
        </div>

        <article>
            <header className="mb-12 border-b border-zinc-800 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-100 leading-tight">
                    Register Your Brand
                </h1>
                <p className="mt-4 text-xl italic text-zinc-400">A great name is an asset. Here's how to protect it.</p>
            </header>

            <div className="prose prose-invert prose-lg text-zinc-300 max-w-none leading-relaxed space-y-8">
                <section>
                    <h3 className="text-2xl font-bold text-slate-100 !mb-4">What is a Trademark?</h3>
                    <p>A trademark is a sign capable of distinguishing the goods or services of one enterprise from those of other enterprises. It's your legal claim to a name, logo, or slogan in your specific field. Registering it gives you exclusive rights and legal recourse against infringement.</p>
                </section>
                
                <section>
                    <h3 className="text-2xl font-bold text-slate-100 !mb-4">Essential Tools for Trademark Research</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-cyan-400 !my-2 text-xl">EUIPO</h4>
                            <p className="mb-2">The European Union Intellectual Property Office is the official body for registering trademarks that have effect across the entire EU. It's the starting point for protection in Europe.</p>
                            <a href="https://euipo.europa.eu/ohimportal/en/" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-[#00ff99] hover:underline">
                                Visit EUIPO &rarr;
                            </a>
                        </div>
                         <div>
                            <h4 className="font-semibold text-cyan-400 !my-2 text-xl">TMview</h4>
                            <p className="mb-2">TMview is a free, global database of trademarks from over 70 intellectual property offices. It's an indispensable tool for checking if a name you're considering is already registered anywhere in the world.</p>
                            <a href="https://www.tmdn.org/tmview/welcome" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-[#00ff99] hover:underline">
                                Search on TMview &rarr;
                            </a>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-2xl font-bold text-slate-100 !mb-4">The Process</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li><strong>Search First:</strong> Before you get attached to a name, use TMview to see if it's already in use in your industry and target markets.</li>
                        <li><strong>Classify Your Goods/Services:</strong> Determine the correct NICE classes for your business. This is a critical step.</li>
                        <li><strong>File Your Application:</strong> Use the appropriate office (like EUIPO for Europe or USPTO for the US) to file your application.</li>
                        <li><strong>Monitor and Defend:</strong> Once registered, it's your responsibility to monitor for infringement and defend your mark.</li>
                    </ol>
                </section>
            </div>
        </article>
    </div>
  );
};

export default RegisterBrandView;