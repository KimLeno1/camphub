import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  MoreVertical, 
  Search, 
  Filter, 
  Plus,
  TrendingUp,
  Globe,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Forum() {
  const { user, tenant, awardXP } = useAppContext();
  const [newPost, setNewPost] = useState('');
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      authorId: 'user-002',
      author: 'Sarah K.',
      authorRole: 'student',
      time: '2 hours ago',
      content: 'Can someone explain the difference between mitosis and meiosis simply? Im struggling with the phases.',
      tags: ['Biology', 'Foundational'],
      likes: 15,
      answers: 2,
      verified: true
    },
    {
      id: 2,
      authorId: 'user-003',
      author: 'Prof. David',
      authorRole: 'teacher',
      time: '4 hours ago',
      content: 'Just uploaded a comprehensive guide for the upcoming AI Ethics seminar. Check the Academy section.',
      tags: ['AI', 'Update'],
      likes: 42,
      answers: 8,
      verified: true
    }
  ]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosts([{
      id: Date.now(),
      authorId: user.id,
      author: 'You',
      authorRole: user.role,
      time: 'Just now',
      content: newPost,
      tags: ['General'],
      likes: 0,
      answers: 0,
      verified: false
    }, ...posts]);

    setNewPost('');
    awardXP(25, 'Contributed to institutional feed');
  };

  const handleLike = (id: number) => {
    awardXP(5, 'Acknowledged contribution');
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Community</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">Digital Hive Mind for {tenant.name}</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search discussions..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-sm w-full sm:w-64" />
           </div>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
              <Plus className="w-5 h-5" /> New Discussion
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bento-card bg-white p-6 border-slate-100">
            <form onSubmit={handlePost}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-indigo-100">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-4">
                  <textarea 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share an insight, ask a question, or post an update..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition resize-none min-h-[120px] outline-none"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                       <button type="button" className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition border border-slate-200">Attach Media</button>
                    </div>
                    <button 
                      type="submit"
                      disabled={!newPost.trim()}
                      className="bg-slate-900 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition shadow-xl shadow-slate-100"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {posts.map(post => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bento-card bg-white p-6 border-slate-100 flex flex-col md:flex-row gap-6 relative group text-left"
                >
                   <div className="flex flex-col items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="w-12 h-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1 hover:border-indigo-300 hover:bg-indigo-50 transition-all group/like"
                      >
                         <ThumbsUp className="w-5 h-5 text-slate-400 group-hover/like:text-indigo-600 transition-colors" />
                         <span className="text-[10px] font-black text-slate-500 group-hover/like:text-indigo-700">{post.likes}</span>
                      </button>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden border border-slate-200">
                              {post.author.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-slate-800 tracking-tight">{post.author}</span>
                                 {post.verified && <div className="w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{post.authorRole} • {post.time}</span>
                           </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition"><MoreVertical className="w-5 h-5" /></button>
                      </div>

                      <p className="text-sm font-medium text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                         {post.tags.map(tag => (
                           <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">#{tag}</span>
                         ))}
                      </div>

                      <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                         <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition">
                            <MessageCircle className="w-5 h-5" /> {post.answers} Comments
                         </button>
                         <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition">
                            <Globe className="w-5 h-5" /> Share
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bento-card bg-white border-slate-100 p-6 text-left">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                 <TrendingUp className="w-5 h-5 text-indigo-400" /> Trending Topics
              </h2>
              <div className="space-y-6">
                 {[
                   { tag: 'QuantumPhysics', posts: 124, growth: '+22%' },
                   { tag: 'CareerPrep', posts: 89, growth: '+15%' },
                   { tag: 'CampusHackathon', posts: 56, growth: '+40%' }
                 ].map((trend) => (
                   <div key={trend.tag} className="flex justify-between items-center group cursor-pointer">
                      <div>
                         <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">#{trend.tag}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{trend.posts} Active Members</p>
                      </div>
                      <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">{trend.growth}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition">
                 Explore All Channels
              </button>
           </div>

           <div className="bento-card bg-slate-900 text-white p-8 relative overflow-hidden text-left">
              <Globe className="absolute -left-12 -top-12 w-48 h-48 opacity-10" />
              <h3 className="text-xl font-bold mb-4 relative z-10">Sync Your Network</h3>
              <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed relative z-10">
                 CampusOS communities are verified institutional ecosystems. Connect with vetted faculty and high-performing students.
              </p>
              <button className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition relative z-10">
                 Find Mentors
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

