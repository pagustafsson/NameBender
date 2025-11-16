import React, { useMemo } from 'react';
import type { BlogPostData } from '../types';

interface BlogPostViewProps {
  post: BlogPostData;
  onBack: () => void;
  onHome: () => void;
}

const renderBodyContent = (body: string) => {
    const parts = body.split(/(\n\s*\*.*(?:\n\s*\*.*)*)/).filter(Boolean);
    return parts.map((part, index) => {
        if (part.trim().startsWith('*')) {
            const listItems = part.trim().split('\n').map(item => item.trim().substring(1).trim());
            return (
                <ul key={index} className="list-disc pl-6 my-4 space-y-2">
                    {listItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            );
        }
        return <p key={index}>{part}</p>;
    });
};

const BlogPostView: React.FC<BlogPostViewProps> = ({ post, onBack, onHome }) => {
  return (
    <div className="w-full max-w-4xl animate-fade-in">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <button onClick={onBack} className="text-sm text-zinc-400 hover:text-[#00ff99] transition-colors">
                &larr; Back to Articles
            </button>
            <button onClick={onHome} className="text-sm text-zinc-400 hover:text-[#00ff99] transition-colors">
                Go to Domain Search &rarr;
            </button>
        </div>

        <article>
            <header className="mb-12 border-b border-zinc-800 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-100 leading-tight">
                    {post.title}
                </h1>
            </header>

            <div className="prose prose-invert prose-lg text-zinc-300 max-w-none leading-relaxed space-y-8">
              <p className="text-xl italic text-zinc-400">{post.intro}</p>
              
              {post.sections.map((section, index) => (
                <section key={index}>
                    <h3 className="text-2xl font-bold text-slate-100 !mb-4">{section.heading}</h3>
                    <div className="space-y-4 text-zinc-300">
                        {renderBodyContent(section.body)}
                    </div>
                </section>
              ))}

              <section className="!mt-12 pt-8 border-t border-zinc-800">
                <h3 className="text-lg font-semibold text-[#00ff99] uppercase tracking-wider mb-4">The Takeaway</h3>
                <p className="text-xl font-medium text-slate-100">{post.takeaway}</p>
              </section>
            </div>
        </article>
    </div>
  );
};

export default BlogPostView;