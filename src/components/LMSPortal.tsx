import React, { useState } from 'react';
import { BookOpen, Video, FileText, Headphones, Play, CheckCircle, ExternalLink, ShieldAlert, AlertCircle, MessageCirclePlus } from 'lucide-react';
import { motion } from 'motion/react';
import { LMSModule } from '../types';

const DEFAULT_LMS_MODULES: LMSModule[] = [
  {
    id: "mod-1",
    title: "English Grammar Logic SVO - Pendahuluan Konseptual",
    type: "pdf",
    durationOrPages: "14 Halaman PDF",
    category: "Grammar Logic (Goal 3)",
    description: "Panduan revolusioner membongkar tabrakan struktur bahasa Indonesia dengan tata kalimat dasar bahasa Inggris.",
    goalReference: "Menguasai Konsep Dasar Pembelajaran Bahasa Inggris",
    fileUrl: "Grammar_Logic_Concept_Book.pdf"
  },
  {
    id: "mod-2",
    title: "Video Panduan: Mengurangi Grammar Anxiety di Ruang Publik",
    type: "video",
    durationOrPages: "18 Menit Video",
    category: "Psikologi Belajar (Goal 5)",
    description: "Drs. Eddy Sudarmadji mengupas tuntas teknik Neuro Linguistic Programming (NLP) untuk menaruh sauh (anchor) percaya diri pembelajar.",
    goalReference: "Mengembangkan Kepercayaan Diri dan Keberanian Berbahasa",
    fileUrl: "https://www.youtube.com/watch?v=JATC-Psychology"
  },
  {
    id: "mod-3",
    title: "Audio Terapi Linguistik: Berpikir Langsung dalam Bahasa Inggris",
    type: "audio",
    durationOrPages: "12 Menit Podcast",
    category: "Mindset & Paradigm (Goal 1)",
    description: "Dengarkan latihan bawah sadar (subconscious programming) untuk mematikan penerjemah di kepala Anda (no more brain-translation).",
    goalReference: "Mengembangkan Pola Pikir dan Paradigma Bahasa Inggris",
    fileUrl: "audio_mindset_therapy.mp3"
  },
  {
    id: "mod-4",
    title: "Modul Sertifikasi Instruktur: Microteaching & Pengelolaan Kelas",
    type: "pdf",
    durationOrPages: "22 Halaman PDF",
    category: "Instructor Program (Goal 7)",
    description: "Panduan praktis menguasai 5 Contemporary Methodologies untuk diajarkan kembali kepada pembelajaran baru Anda.",
    goalReference: "Menjadi Instruktur Bahasa Inggris",
    fileUrl: "Instructor_Microteaching_Handbook.pdf"
  }
];

export default function LMSPortal({ isLoggedIn = false, memberStatus, modules = DEFAULT_LMS_MODULES }: { isLoggedIn: boolean; memberStatus?: string; modules?: LMSModule[] }) {
  const [selectedModule, setSelectedModule] = useState<LMSModule | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>(['mod-1']);

  const activeModule = selectedModule && modules.some(m => m.id === selectedModule.id)
    ? modules.find(m => m.id === selectedModule.id)!
    : (modules[0] || null);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedModules(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-12 h-14 text-amber-500 mx-auto" />
        <h4 className="font-serif text-xl font-bold text-brand-blue">
          Akses Terbatas - Silakan Login Anggota
        </h4>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">
          Materi Pembelajaran (LMS), unduhan PDF, simulasi audio, serta instruksi kelas live virtual hanya dapat diakses oleh anggota resmi terdaftar yang telah login.
        </p>
        <p className="text-[10px] text-gray-400 font-sans italic">
          *Belum menjadi anggota? Sila lakukan "Pendaftaran Anggota Baru" di navigasi utama secara gratis.
        </p>
      </div>
    );
  }

  if (isLoggedIn && memberStatus !== 'Selesai') {
    return (
      <div className="bg-amber-50/70 rounded-2xl border border-amber-300 p-8 text-center max-w-xl mx-auto space-y-4 font-sans">
        <ShieldAlert className="w-12 h-14 text-amber-600 mx-auto animate-pulse" />
        <h3 className="font-serif text-lg font-bold text-brand-blue">
          {memberStatus === 'Ditolak' ? 'Akses Pendaftaran Ditolak ❌' : 'Akses Pendaftaran Sedang Ditinjau ⏳'}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
          Maaf, seluruh fasilitas belajar digital (LMS) dinonaktifkan sementara karena keanggotaan Anda saat ini berstatus <strong>{memberStatus === 'Ditolak' ? 'Ditolak' : 'Pending Peninjauan'}</strong>.
        </p>
        <p className="text-[10px] text-neutral-500">
          Silakan tunggu persetujuan dari Administrator JATC Indonesia atau hubungi Admin via Whatsapp untuk bantuan verifikasi akun Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-800" id="lms-hub-section">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white rounded-xl border border-neutral-200 p-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#a18241] font-mono tracking-wider">JATC Learning Hub (LMS)</span>
          <h2 className="font-serif text-2xl font-bold text-brand-blue mt-0.5">Pembelajaran Modul Belajar Digital</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Akses materi PDF, podcast, dan info Zoom webinar Anda.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0b2240]/5 rounded-xl px-4 py-2.5">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div className="text-xs font-sans">
            <span className="font-bold text-brand-blue">Progres Belajar:</span> {completedModules.filter(id => modules.some(m => m.id === id)).length} dari {modules.length} Selesai
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module lists */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-sm h-[520px] overflow-y-auto custom-scrollbar">
          <h4 className="font-serif font-bold text-brand-blue text-sm border-b pb-2">Daftar Modul Tersedia:</h4>
          
          {modules.map(mod => {
            const isCompleted = completedModules.includes(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                  activeModule?.id === mod.id
                    ? 'border-brand-gold bg-brand-gold/5 shadow-inner'
                    : 'border-neutral-150 bg-neutral-50/50 hover:bg-neutral-50'
                }`}
              >
                <div className="mt-1">
                  {mod.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                  {mod.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                  {mod.type === 'audio' && <Headphones className="w-5 h-5 text-purple-500" />}
                  {mod.type === 'link' && <ExternalLink className="w-5 h-5 text-teal-500" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-bold font-mono text-[#a18241] uppercase tracking-wide">
                      {mod.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleComplete(mod.id, e)}
                      className={`text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full border transition-all truncate shrink-0 ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-white text-gray-500 border-neutral-200 hover:border-brand-gold'
                      }`}
                    >
                      {isCompleted ? '✓ Selesai' : 'Tandai Selesai'}
                    </button>
                  </div>
                  
                  <h5 className="font-sans font-bold text-xs text-brand-blue leading-normal">
                    {mod.title}
                  </h5>
                  <p className="text-[10px] text-gray-400 font-sans line-clamp-1">
                    {mod.durationOrPages} • Untuk target: {mod.goalReference}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected module viewer simulator */}
        <div className="lg:col-span-7">
          {activeModule ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5 h-[520px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <span className="px-2 py-0.5 bg-[#0b2240]/5 rounded text-[10px] font-mono text-brand-blue font-bold">
                    {activeModule.type.toUpperCase()} VIEWER
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-blue mt-2">
                    {activeModule.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans mt-1">
                    Mengakomodasi Learning Goal: <span className="font-medium text-brand-gold">{activeModule.goalReference}</span>
                  </p>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-sans line-clamp-4">
                  {activeModule.description}
                </p>

                {/* Medium Simulator */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 flex flex-col items-center justify-center min-h-[180px] shadow-inner relative">
                  {activeModule.type === 'pdf' && (
                    <div className="text-center space-y-3">
                      <FileText className="w-12 h-14 text-red-500 mx-auto" />
                      <div className="space-y-1">
                        <span className="block font-bold text-xs font-sans text-brand-blue">{activeModule.fileUrl}</span>
                        <span className="block text-[10px] text-gray-400 font-sans">Dokumen panduan referensi resmi JATC</span>
                      </div>
                      <button
                        onClick={() => alert(`Simulasi Download Berhasil! Mengambil berkas: ${activeModule.fileUrl}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold font-sans hover:bg-brand-blue/90 shadow transition-all cursor-pointer"
                      >
                        Unduh Materi PDF
                      </button>
                    </div>
                  )}

                  {activeModule.type === 'video' && (
                    <div className="text-center space-y-3 w-full">
                      <div className="absolute inset-0 bg-neutral-900 rounded-xl flex items-center justify-center p-4">
                        <div className="text-center space-y-2 text-white">
                          <Video className="w-10 h-10 text-brand-gold mx-auto animate-pulse" />
                          <span className="block text-xs font-bold text-neutral-200">Video Player Simulator JATC</span>
                          <span className="block text-[10px] text-neutral-400 max-w-sm mx-auto font-sans">
                            "{activeModule.title}"
                          </span>
                          <button
                            onClick={() => alert(`Memutar video ${activeModule.fileUrl}`)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-neutral-900 rounded text-xs font-bold font-sans hover:bg-brand-gold/90 transition-all cursor-pointer mt-2"
                          >
                            <Play className="w-3.5 h-3.5 fill-neutral-900" /> Putar Video
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule.type === 'audio' && (
                    <div className="text-center space-y-3">
                      <Headphones className="w-12 h-12 text-purple-500 mx-auto" />
                      <div className="space-y-1">
                        <span className="block font-bold text-xs text-brand-blue">{activeModule.fileUrl}</span>
                        <span className="block text-[10px] text-gray-400">Meditasi bawah sadar: NLP Anchor Pola Bahasa Inggris</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setAudioPlaying(!audioPlaying)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow transition-all cursor-pointer ${
                            audioPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {audioPlaying ? 'Matikan Podcast' : 'Mulai Podcast Latihan'}
                        </button>
                      </div>
                      {audioPlaying && (
                        <div className="flex gap-1 justify-center items-end h-5 mt-2">
                          <div className="w-1 bg-[#a18241] h-3 animate-bounce" style={{animationDelay: '0.1s'}} />
                          <div className="w-1 bg-[#a18241] h-5 animate-bounce" style={{animationDelay: '0.3s'}} />
                          <div className="w-1 bg-[#a18241] h-2 animate-bounce" style={{animationDelay: '0.5s'}} />
                          <div className="w-1 bg-[#a18241] h-4 animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                      )}
                    </div>
                  )}

                  {activeModule.type === 'link' && (
                    <div className="text-center space-y-3">
                      <ExternalLink className="w-12 h-12 text-teal-500 mx-auto" />
                      <div className="space-y-1">
                        <span className="block font-bold text-xs text-brand-blue">{activeModule.title}</span>
                        <span className="block text-[10px] text-gray-400">Tautan referensi luar platform atau sesi langsung</span>
                      </div>
                      <a
                        href={activeModule.fileUrl.startsWith('http') ? activeModule.fileUrl : `https://${activeModule.fileUrl}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold font-sans hover:bg-teal-700 shadow transition-all cursor-pointer"
                      >
                        Kunjungi Tautan <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Sesi Live Virtual info (Integrasi Zoom/Meet) - (Learning Goal 7) */}
              <div className="bg-blue-50/50 rounded-xl border border-blue-200/50 p-4 space-y-2">
                <div className="flex items-start gap-1.5 text-xs text-blue-900">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Kelas Virtual Live (Zoom & Google Meet):</span> 
                    <p className="text-[11px] leading-relaxed text-gray-600 font-sans mt-0.5">
                      Setiap calon instruktur wajib mengikuti sesi praktek mengajar mikro (microteaching) langsung di hadapan Drs. Eddy Sudarmadji. Link webinar Zoom harian akan dipublish dalam grup pembelajaran WhatsApp Mitra Anda.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => window.open(`https://wa.me/6281234567890?text=Halo%2520Admin%2520John%2520Andersen,%2520saya%2520anggota%2520terdaftar%2520ingin%252520meminta%2520link%2520Zoom%2520sesi%2520berikutnya`)}
                    className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Hubungi Admin via WA <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-gray-400 font-sans min-h-[300px]">
              Sila pilih salah satu materi di samping kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
