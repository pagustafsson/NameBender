import React from 'react';
import type { BlogPostData } from '../types';
import BlogPreview from './BlogPreview';

interface BlogSectionProps {
  posts: BlogPostData[];
  onSelectPost: (post: BlogPostData) => void;
  onHome: () => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ posts, onSelectPost, onHome }) => {
  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-slate-100">
          Why brands matter
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A collection of thoughts on strategy, identity, and the art of being remembered.
        </p>
         <button 
            onClick={onHome}
            className="mt-6 text-sm text-[#00ff99] hover:underline"
        >
            &larr; Back to Domain Search
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms`}}>
              <BlogPreview post={post} onReadMore={() => onSelectPost(post)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;