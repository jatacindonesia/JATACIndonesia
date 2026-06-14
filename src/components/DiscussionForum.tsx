import React, { useState } from 'react';
import { Send, User, Bot, ThumbsUp, ShieldCheck, Heart, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ForumPost {
  id: string;
  studentName: string;
  text: string;
  analyzedFeedback?: {
    tenseFound: string;
    score: number;
    notes: string;
  };
  likes: number;
  date: string;
}

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: "f-1",
    studentName: "Mohammad Muslih, S.H., M.M.",
    text: "I am learning English grammatical logic with Drs. Eddy Sudarmadji at JATC Indonesia.",
    analyzedFeedback: {
      tenseFound: "Present Continuous Tense (S + am/is/are + V-ing)",
      score: 100,
      notes: "Sangat bagus! SVO terpasang rapi, penggunaan auxiliary verb 'am' sangat presisi dipadukan verb 'learning'."
    },
    likes: 4,
    date: "2026-06-13"
  },
  {
    id: "f-2",
    studentName: "Aisyah, M.Pd.",
    text: "He do not understand why Indonesian mindset blocks English fluency.",
    analyzedFeedback: {
      tenseFound: "Simple Present Tense (But with Subject-Verb Agreement error)",
      score: 75,
      notes: "Hampir tepat. Karena subjeknya adalah 'He', kita sebaiknya menggunakan aux 'does not' bukan 'do not' ('He does not understand...'). Latih terus, Anda sangat berani!"
    },
    likes: 2,
    date: "2026-06-14"
  }
];

export default function DiscussionForum({ isLoggedIn = false, currentUserName = "Tamu" }: { isLoggedIn: boolean; currentUserName: string }) {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Sila Login Anggota untuk menulis dan mengirim praktek berbahasa Inggris.");
      return;
    }
    if (!inputText.trim()) return;

    setAnalyzing(true);

    // Simulate grammatical analysis after 1.5 seconds
    setTimeout(() => {
      const sentence = inputText.trim().toLowerCase();
      
      let tenseFound = "Simple Present Tense";
      let score = 90;
      let notes = "Pola kalimat teratur dengan baik. Terus pertahankan keberanian berbicara langsung tanpa menerjemahkan!";

      // Basic rule heuristics for interactive simulation
      if (sentence.includes("am learning") || sentence.includes("is speaking") || sentence.includes("are practicing") || sentence.includes("ing ")) {
        tenseFound = "Present Continuous Tense (S + am/is/are + V-ing)";
        score = 98;
        notes = "Hebat! Penggunaan struktur Continuous memperlihatkan Anda menguasai ikatan waktu aktif.";
      } else if (sentence.includes("have learned") || sentence.includes("has mastered") || sentence.includes("have attended")) {
        tenseFound = "Present Perfect Tense (S + have/has + V3)";
        score = 100;
        notes = "Sempurna! Anda berhasil menceritakan pengalaman lampau berefek sekarang dengan Present Perfect.";
      } else if (sentence.includes("will learn") || sentence.includes("will be") || sentence.includes("shall")) {
        tenseFound = "Simple Future Tense (S + will + V1)";
        score = 96;
        notes = "Bagus sekali! Rencana masa depan terkatup kokoh dalam grammar logic modern Anda.";
      } else if (sentence.includes("eddy teach") || sentence.includes("he learn") || sentence.includes("she write")) {
        tenseFound = "Simple Present Tense (Subject-Verb Agreement Alert)";
        score = 80;
        notes = "Hati-hati, untuk subjek tunggal orang ketiga (Eddy, He, She), tambahkan sufiks -s/es pada kata kerja aktif Anda ('Eddy teaches', 'He learns', 'She writes').";
      } else if (sentence.split(' ').length < 3) {
        tenseFound = "Tidak Terdeteksi (Kekurangan SVO)";
        score = 60;
        notes = "Ingatlah metodologi Ke-4: Struktur bahasa Inggris minimal memiliki Subject dan Verb operasional yang jelas.";
      }

      const newPost: ForumPost = {
        id: `f-${Math.random()}`,
        studentName: currentUserName || "Anggota Aktif",
        text: inputText.trim(),
        analyzedFeedback: {
          tenseFound,
          score,
          notes
        },
        likes: 0,
        date: new Date().toISOString().substring(0, 10)
      };

      setPosts(prev => [newPost, ...prev]);
      setInputText('');
      setAnalyzing(false);
    }, 1200);
  };

  const likePost = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6" id="forum-section">
      <div className="border-b pb-4">
        <span className="px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold text-[10px] uppercase font-mono font-bold">
          Confidence Practice Arena
        </span>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-blue mt-1.5 flex items-center gap-2">
          Forum Diskusi & Praktek Komunitas
        </h3>
        <p className="text-xs text-gray-400 mt-1 font-sans">
          Masyarakat belajar JATC saling mendukung. Tulis sebuah kalimat bahasa Inggris pilihan Anda, submit, dan saksikan evaluasi dari sistem tata bahasa logis kami.
        </p>
      </div>

      {/* Write Input Form */}
      <form onSubmit={handlePostSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-2">
            Salurkan Keberanian Anda (Tulis Kalimat Praktek):
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={analyzing}
            placeholder={
              isLoggedIn
                ? "Tulis kalimat bahasa Inggris Anda di sini (Contoh: I am learning 16 tenses with Drs. Eddy Sudarmadji...)"
                : "Silakan login anggota untuk bergabung menulis kalimat di dalam forum praktek ini."
            }
            className="w-full text-sm rounded-xl border border-neutral-300 p-3.5 bg-neutral-50 focus:bg-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all font-sans min-h-[90px] disabled:opacity-70"
          />
        </div>

        {isLoggedIn ? (
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400">
              *Setelah disubmit, sistem akan menganalisis tenses secara real-time.
            </span>
            <button
              type="submit"
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-sans rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menganalisis...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Kirim & Analisis
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Akses Menulis Dikunci:</span> Silakan lakukan <span className="font-semibold text-brand-blue">Login Anggota</span> atau lakukan <span className="font-semibold text-brand-blue">Pendaftaran Anggota</span> untuk berpartisipasi.
            </div>
          </div>
        )}
      </form>

      {/* Discussion List */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h4 className="font-serif font-bold text-gray-600 text-xs uppercase tracking-wider">Kiriman Terbaru Anggota ({posts.length}):</h4>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 pin-scrollbar custom-scrollbar">
          {posts.map(post => (
            <div key={post.id} className="bg-neutral-50/70 border border-neutral-200/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold leading-none select-none">
                    {post.studentName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-brand-blue font-sans leading-tight">{post.studentName}</div>
                    <div className="text-[9px] text-gray-400 font-mono leading-none">{post.date}</div>
                  </div>
                </div>
                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center gap-1 text-[11px] font-sans font-medium text-gray-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-lg hover:border-gray-300 transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3 text-[#a18241]" /> Liked ({post.likes})
                </button>
              </div>

              <div className="font-serif text-[13px] text-neutral-800 italic bg-white/70 rounded-lg p-2.5 border border-dashed border-neutral-200 px-3.5">
                "{post.text}"
              </div>

              {/* Automatic Grammar Evaluator */}
              {post.analyzedFeedback && (
                <div className="bg-brand-blue/[0.04] border border-brand-blue/10 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-brand-blue font-bold font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                    <span>JATC Grammar Logic Evaluator:</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#a18241] font-semibold">
                    Struktur: {post.analyzedFeedback.tenseFound} • Akurasi: {post.analyzedFeedback.score}%
                  </div>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    {post.analyzedFeedback.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export type { ForumPost };
