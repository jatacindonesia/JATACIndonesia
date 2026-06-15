import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, RefreshCw, Printer, AlertTriangle, ShieldCheck, Download, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member } from '../types';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}


const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Apa hambatan terbesar utama pembelajar Indonesia menurut metodologi Drs. Eddy Sudarmadji?",
    options: [
      "Kurangnya kosa kata (vocabulary) akademik yang rumit.",
      "Kecenderungan menerjemahkan per kata di kepala dengan membawa 'mindset dan paradigma' Bahasa Indonesia ke Bahasa Inggris.",
      "Tidak tersedianya kamus fisik yang lengkap di dalam kelas.",
      "Bentuk logat atau dialek kedaerahan yang terlalu kental."
    ],
    correctAnswerIndex: 1,
    explanation: "Ketika pembelajar belajar bahasa Inggris, mereka seringkali masih memikirkan polanya dengan pola susunan kalimat Indonesia. Mindset yang benar adalah mengubah pola pikir langsung ke tata bahasa target (direct thinking)."
  },
  {
    id: 2,
    question: "Manakah formula pola kalimat yang tepat untuk mengekspresikan 'Present Perfect Tense'?",
    options: [
      "S + am/is/are + V-ing",
      "S + will + V1",
      "S + have/has + V3",
      "S + had + V3"
    ],
    correctAnswerIndex: 2,
    explanation: "Present Perfect Tense dibentuk dengan Subject + Auxiliary (have/has) + Past Participle (V3)."
  },
  {
    id: 3,
    question: "Bagaimanakah prinsip dasar dari 'Psychological Approach' dalam menanggulangi 'grammar trauma'?",
    options: [
      "Pembelajaran dihukum push-up setiap kali melakukan kesalahan tata bahasa.",
      "Pembelajaran dipaksa membaca kamus tebal selama 12 jam tanpa henti.",
      "Menciptakan kondisi mental dan emosi yang aman, menurunkan kecemasan, serta memulihkan rasa percaya diri pembelajaran lebih dulu.",
      "Menghindari pengajaran grammar sama sekali selamanya."
    ],
    correctAnswerIndex: 2,
    explanation: "Pendekatan Psikologis memfokuskan mental pembelajaran aman dan nyaman agar otak terbuka penuh menerima asimilasi linguistik tanpa dibayangi ketakutan dikritik."
  },
  {
    id: 4,
    question: "Bagaimana cara merancang kalimat bahasa Inggris yang benar tanpa menerjemahkan secara harfiah?",
    options: [
      "Menerjemahkan kata per kata lalu dibalik susunannya dengan perasaan.",
      "Memahami Grammar Logic (SVO terikat ikatan waktu dan auxiliary) dan menyandarkannya langsung ke paradigma Inggris.",
      "Membaca terjemahan novel Indonesia dalam bahasa Jepang terlebih dahulu.",
      "Selalu menggunakan to be 'is' di semua kata kerja aktif."
    ],
    correctAnswerIndex: 1,
    explanation: "Memahami Grammar Logic dan memprogram pola pikir langsung menggunakan struktur bahasa target (SVO terstruktur) merupakan kunci kelancaran mutlak."
  },
  {
    id: 5,
    question: "Seseorang berhak lulus dinyatakan layak lulus sertifikasi kelayakan Instruktur Bahasa Inggris (Learning Goal 7) apabila...",
    options: [
      "Mampu menghafal daftar kata kerja berat tanpa tahu cara pakainya.",
      "Menguasai tenses, memahami 5 metodologi kontemporer, menunjukkan rasa percaya diri yang tenang, serta sanggup membimbing pembelajaran lain secara komunikatif.",
      "Memiliki jam mengajar konvensional minimal 85 tahun di sekolah negeri.",
      "Dapat menerjemahkan teks Indonesia ke Inggris dalam waktu kurang dari 0.1 detik."
    ],
    correctAnswerIndex: 1,
    explanation: "Kelulusan sertifikasi instruktur kontemporer didasarkan pada pemahaman aplikatif atas metodologi, tenses, dan kepemimpinan pembelajaran komunikatif."
  }
];

export default function InteractiveQuiz({ loggedInMember }: { loggedInMember?: Member | null }) {
  const [userName, setUserName] = useState(loggedInMember ? loggedInMember.name : '');
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (loggedInMember) {
      setUserName(loggedInMember.name);
    }
  }, [loggedInMember]);

  // Restart
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setIsQuizStarted(false);
    setShowExplanation(false);
  };

  if (loggedInMember && loggedInMember.status !== 'Selesai') {
    return (
      <div className="bg-amber-50/70 rounded-2xl border border-amber-300 p-8 text-center max-w-xl mx-auto space-y-4 font-sans">
        <Lock className="w-12 h-14 text-amber-500 mx-auto animate-pulse" />
        <h4 className="font-serif text-xl font-bold text-[#0b2240]">
          Ujian Kompetensi Dikunci 🔒
        </h4>
        <p className="text-xs text-neutral-600 leading-relaxed font-sans max-w-md mx-auto">
          Maaf, portal evaluasi kelayakan sertifikasi keinstrukturan digital dinonaktifkan sementara karena keanggotaan Anda saat ini berstatus <strong>{loggedInMember.status === 'Ditolak' ? 'Ditolak' : 'Pending Peninjauan'}</strong>.
        </p>
        <p className="text-[10px] text-neutral-500 font-sans">
          Silakan hubungi Administrator JATC Indonesia via Whatsapp untuk bantuan verifikasi akun Anda.
        </p>
      </div>
    );
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Sila masukkan nama lengkap beserta gelar akademik Anda terlebih dahulu.');
      return;
    }
    setIsQuizStarted(true);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < ASSESSMENT_QUESTIONS.length) {
      alert('Sila jawab ke-5 pertanyaan terlebih dahulu.');
      return;
    }
    setIsQuizSubmitted(true);
  };

  // Score calculations
  const calculateCorrectCount = () => {
    let count = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        count++;
      }
    });
    return count;
  };

  const score = (calculateCorrectCount() / ASSESSMENT_QUESTIONS.length) * 100;
  const isPassed = score >= 80; // set 80% passing grade (at least 4 correct)

  // Certificate printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 shadow-sm font-sans max-w-4xl mx-auto" id="quiz-anchor">
      {!isQuizStarted ? (
        <form onSubmit={handleStart} className="space-y-6 max-w-lg mx-auto py-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center">
              <Award className="w-8 h-8 text-brand-gold" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-brand-blue">
              Portal Ujian Sertifikasi Instruktur Digital
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-sans">
              Uji pemahaman Anda tentang <span className="font-semibold text-brand-blue">16 Tenses, Logic, dan 5 Metodologi Kontemporer Drs. Eddy Sudarmadji</span> untuk memperoleh Sertifikat Kompetensi Digital resmi JATC Indonesia.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">
                Nama Anggota Lengkap (Dengan Gelar Academik):
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="contoh: Mohammad Muslih, S.H., M.M."
                className="w-full rounded-xl border border-neutral-300 p-3 text-sm bg-neutral-50 focus:bg-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all font-sans font-medium"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 font-sans">
                *Nama ini akan disalin persis ke dalam piagam sertifikat kelulusan digital Anda.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-sans cursor-pointer"
          >
            Mulai Ujian Kompetensi
          </button>
        </form>
      ) : !isQuizSubmitted ? (
        // ACTIVE QUIZ INTERFACE
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-brand-gold uppercase">Ujian Keinstrukturan:</div>
              <h4 className="font-serif text-lg font-bold text-brand-blue mt-0.5">Pertanyaan {currentQuestionIndex + 1} dari 5</h4>
            </div>
            <span className="text-xs font-sans font-semibold bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full">
              Terjawab: {Object.keys(selectedAnswers).length}/5
            </span>
          </div>

          {/* Question Text */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h5 className="font-sans font-semibold text-base text-neutral-900 leading-relaxed">
              {ASSESSMENT_QUESTIONS[currentQuestionIndex].question}
            </h5>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {ASSESSMENT_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-start gap-3 ${
                  selectedAnswers[currentQuestionIndex] === idx
                    ? 'border-brand-gold bg-brand-gold/5 text-brand-blue shadow-inner'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedAnswers[currentQuestionIndex] === idx ? 'border-brand-gold bg-brand-gold text-white' : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === idx && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-sans leading-relaxed">{option}</span>
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-5">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-sans font-semibold bg-neutral-200 text-gray-700 hover:bg-neutral-300 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              Kembali
            </button>

            {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-sans font-bold bg-brand-gold text-neutral-900 hover:bg-brand-gold/90 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Kirim Pembahasan
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-5 py-2 text-xs font-sans font-semibold bg-brand-blue text-white hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      ) : (
        // RESULTS AND DIGITAL CERTIFICATION GENERATOR
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            {isPassed ? (
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            <h4 className="font-serif text-2xl font-bold text-brand-blue">
              {isPassed ? 'Selamat! Anda Dinyatakan LULUS' : 'Maaf, Anda Belum Memenuhi Nilai Kelulusan'}
            </h4>
            <p className="text-sm text-gray-500 font-sans max-w-md mx-auto">
              Skor Anda adalah <span className="font-bold text-brand-blue">{score}%</span> (Sarat kelulusan minimal 80%, yaitu minimal 4 jawaban benar).
            </p>
          </div>

          {/* Certificate Board overlay - prints dynamically */}
          {isPassed && loggedInMember ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-8 border-double border-[#0b2240] p-6 sm:p-10 rounded-xl relative shadow-2xl overflow-hidden print:border-4 print:shadow-none"
              id="certificate-print-area"
            >
              {/* Gold borders */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-brand-gold/30 pointer-events-none" />
              
              {/* Background badge motif */}
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#c5a059]/5 rounded-full pointer-events-none" />

              <div className="text-center space-y-6 relative z-10 print:space-y-4">
                <div className="flex flex-col items-center">
                  <span className="font-serif text-[11px] font-bold tracking-[0.25em] text-[#a18241] uppercase">
                    CERTIFICATE OF COMPETENCY
                  </span>
                  <div className="w-20 h-0.5 bg-[#a18241] mt-2 mb-1" />
                  <span className="font-sans text-[8px] text-gray-400 uppercase tracking-widest font-bold">
                    JOHN ANDERSEN TRAINING AND CONSULTING
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs italic text-gray-500 font-serif">Sertifikat ini dengan bangga dianugerahkan kepada:</p>
                  <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-brand-blue tracking-wide border-b border-dashed border-[#a18241]/40 pb-2 max-w-xl mx-auto">
                    {userName}
                  </h1>
                </div>

                <div className="max-w-lg mx-auto text-center space-y-1">
                  <p className="text-[11px] text-gray-600 leading-normal font-sans">
                    Atas partisipasi aktif dan kompetensi luar biasa yang ditunjukkan dalam menyelesaikan asesmen komprehensif kelembagaan:
                  </p>
                  <p className="text-xs font-bold text-brand-blue font-sans italic">
                    "Webinar Series: Two Day English Learning Revolution (12-Hour Method)"
                  </p>
                  <p className="text-[10px] text-gray-500 font-sans leading-normal">
                    Meliputi penguasaan 16 English Tenses, English Grammar Logic SVO, dan adaptasi 5 Contemporary Teaching Methodologies kontemporer Mr. Eddy Sudarmadji. Dinyatakan berkompeten sebagai instruktur pembantu.
                  </p>
                </div>

                {/* Footer of Certificate */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 max-w-lg mx-auto class-print-row">
                  <div className="text-left space-y-1">
                    <span className="text-[8px] font-mono block text-gray-400 uppercase">NO. REGISTRASI SERTI:</span>
                    <span className="font-mono text-[10px] text-brand-blue font-bold tracking-wide">JATC-REVO-2026-{Math.floor(Math.random() * 90000) + 10000}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[8px] font-mono block text-gray-400 uppercase">MASTER TRAINER & FOUNDER:</span>
                    <div className="italic font-serif text-[11px] font-bold text-brand-blue mt-0.5">Drs. Eddy Sudarmadji MM.,MBA.</div>
                    <span className="text-[8px] block text-gray-500 font-sans leading-none mt-0.5">John Andersen Training & Consulting</span>
                  </div>
                </div>

                {/* Visual Gold Stamp */}
                <div className="absolute left-6 bottom-6 flex items-center gap-1 opacity-75 print:opacity-100">
                  <ShieldCheck className="w-10 h-10 text-brand-gold shrink-0" />
                  <div className="text-[6px] text-left font-mono text-gray-500 uppercase leading-none">
                    <span className="font-bold text-brand-blue block">VERIFIED STATUS</span>
                    <span>ONLINE CERTIFICATION</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isPassed ? (
            <div className="bg-amber-50 text-amber-900 border border-[#a18241]/30 rounded-2xl p-6 text-center space-y-3 font-sans max-w-md mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-[#a18241] mx-auto" />
              <h5 className="font-bold text-xs font-serif text-[#0b2240]">Ujian Lulus! Sila Login Anggota</h5>
              <p className="text-[11px] leading-relaxed text-gray-600">
                Selamat! Anda berhasil mencapai skor kelulusan <strong className="text-brand-blue">{score}%</strong>. Untuk memproses dan mencetak piagam sertifikat kelulusan digital resmi JATC Anda, mohon pastikan Anda telah terdaftar dan login ke halaman **Login** di menu navigasi atas.
              </p>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isPassed && loggedInMember && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-sans font-bold hover:bg-brand-blue/90 shadow transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Piagam/Sertifikat
              </button>
            )}

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> {isPassed ? 'Ulangi Ujian' : 'Coba Lagi'}
            </button>
          </div>

          {/* Review Answers Area */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 text-xs font-sans font-semibold text-brand-blue hover:text-brand-gold transition-colors focus:outline-none"
            >
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              {showExplanation ? 'Sembunyikan Pembahasan Soal' : 'Lihat Kunci Jawaban & Pembahasan Detil'}
            </button>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {ASSESSMENT_QUESTIONS.map((q, idx) => {
                    const selectedIdx = selectedAnswers[idx];
                    const isCorrect = selectedIdx === q.correctAnswerIndex;
                    return (
                      <div key={q.id} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h6 className="font-sans font-bold text-xs text-neutral-800">
                            {q.id}. {q.question}
                          </h6>
                          {isCorrect ? (
                            <span className="p-1 rounded-full bg-green-100 text-green-700"><CheckCircle className="w-4 h-4" /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-red-100 text-red-700"><XCircle className="w-4 h-4" /></span>
                          )}
                        </div>
                        <div className="text-xs font-sans text-gray-600 mt-1">
                          <p><span className="font-semibold text-neutral-800">Jawaban Anda:</span> {selectedIdx !== undefined ? q.options[selectedIdx] : 'Tidak dijawab'}</p>
                          <p className="mt-1"><span className="font-semibold text-green-700">Kunci Jawaban:</span> {q.options[q.correctAnswerIndex]}</p>
                        </div>
                        <p className="text-[11px] text-amber-800 font-sans bg-amber-50 rounded-lg p-2.5 mt-2 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span><span className="font-bold">Pembahasan:</span> {q.explanation}</span>
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
export type { QuizQuestion };
