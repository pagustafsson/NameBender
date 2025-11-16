import React from 'react';
import type { BlogPostData } from '../types';

interface BlogPreviewProps {
  post: BlogPostData;
  onReadMore: () => void;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ post, onReadMore }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col h-full transition-all hover:border-zinc-700/80">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-100 mb-2">{post.title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed flex-grow">{post.intro}</p>
        <div className="mt-4">
            <button
                onClick={onReadMore}
                className="font-semibold text-sm text-[#00ff99] hover:underline"
            >
                Read More &rarr;
            </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;