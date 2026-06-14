import React, { useState } from 'react';
import { SIXTEEN_TENSES_DATA, TenseDetail } from '../data';
import { Search, ChevronRight, HelpCircle, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TensesHub() {
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'past' | 'future' | 'past-future'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTense, setSelectedTense] = useState<TenseDetail | null>(SIXTEEN_TENSES_DATA[0]);
  
  // Custom sandbox tester
  const [sandboxSubject, setSandboxSubject] = useState('I');
  const [sandboxVerb, setSandboxVerb] = useState('speak');
  const [sandboxObject, setSandboxObject] = useState('English directly');

  const filteredTenses = SIXTEEN_TENSES_DATA.filter(tense => {
    const matchesSearch = tense.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tense.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tense.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'present') return tense.slug.includes('present') && matchesSearch;
    if (activeTab === 'past') return tense.slug.startsWith('past') && !tense.slug.includes('future') && matchesSearch;
    if (activeTab === 'future') return tense.slug.includes('future') && !tense.slug.includes('past') && matchesSearch;
    if (activeTab === 'past-future') return tense.slug.includes('past-future') || tense.slug.includes('future-past') || tense.slug.startsWith('past-future') || tense.slug.includes('past-further') || ['simple-future-past', 'past-future-continuous', 'past-future-perfect', 'past-future-perfect-continuous'].includes(tense.slug) && matchesSearch;
    
    return matchesSearch;
  });

  // Calculate sandbox formula preview based on selected tense
  const getSandboxPreview = (tense: TenseDetail) => {
    const subj = sandboxSubject.trim() || 'S';
    const verb = sandboxVerb.trim() || 'V';
    const obj = sandboxObject.trim() || 'O';
    
    const isSingular = ['he', 'she', 'it', 'eddy', 'the trainer'].includes(subj.toLowerCase());
    
    switch (tense.slug) {
      case 'simple-present': {
        const vSuffix = isSingular ? (verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('o') ? `${verb}es` : `${verb}s`) : verb;
        return `${subj} ${vSuffix} ${obj}.`;
      }
      case 'present-continuous': {
        const be = subj.toLowerCase() === 'i' ? 'am' : (isSingular ? 'is' : 'are');
        return `${subj} ${be} ${verb}ing ${obj}.`;
      }
      case 'present-perfect': {
        const have = isSingular ? 'has' : 'have';
        return `${subj} ${have} [V3 of ${verb}] ${obj}.`;
      }
      case 'present-perfect-continuous': {
        const have = isSingular ? 'has' : 'have';
        return `${subj} ${have} been ${verb}ing ${obj}.`;
      }
      case 'simple-past': {
        return `${subj} [V2 of ${verb}] ${obj}.`;
      }
      case 'past-continuous': {
        const was = (subj.toLowerCase() === 'i' || isSingular) ? 'was' : 'were';
        return `${subj} ${was} ${verb}ing ${obj}.`;
      }
      case 'past-perfect': {
        return `${subj} had [V3 of ${verb}] ${obj}.`;
      }
      case 'past-perfect-continuous': {
        return `${subj} had been ${verb}ing ${obj}.`;
      }
      case 'simple-future': {
        return `${subj} will ${verb} ${obj}.`;
      }
      case 'future-continuous': {
        return `${subj} will be ${verb}ing ${obj}.`;
      }
      case 'future-perfect': {
        return `${subj} will have [V3 of ${verb}] ${obj}.`;
      }
      case 'future-perfect-continuous': {
        return `${subj} will have been ${verb}ing ${obj}.`;
      }
      case 'simple-future-past': {
        return `${subj} would ${verb} ${obj}.`;
      }
      case 'past-future-continuous': {
        return `${subj} would be ${verb}ing ${obj}.`;
      }
      case 'past-future-perfect': {
        return `${subj} would have [V3 of ${verb}] ${obj}.`;
      }
      case 'past-future-perfect-continuous': {
        return `${subj} would have been ${verb}ing ${obj}.`;
      }
      default:
        return `${subj} [Modified by formula] ${obj}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-neutral-800" id="tenses-hub-section">
      {/* Left Navigation and List */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm flex flex-col h-[650px]">
        <div className="mb-4">
          <h3 className="font-serif text-xl font-bold text-brand-blue flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            Program 16 Tenses Hub
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Tekan salah satu tense untuk mempelajari detail logika, rumus, serta contohnya.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3.5">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama tense atau rumus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all font-sans"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 border-b border-gray-100 pb-3">
          {[
            { id: 'all', label: 'Semuanya' },
            { id: 'present', label: 'Present' },
            { id: 'past', label: 'Past' },
            { id: 'future', label: 'Future' },
            { id: 'past-future', label: 'P. Future' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-neutral-50 text-gray-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredTenses.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-sans text-sm">
              Tenses tidak ditemukan. Coba ketik kata kunci lain.
            </div>
          ) : (
            filteredTenses.map(tense => (
              <button
                key={tense.slug}
                onClick={() => setSelectedTense(tense)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  selectedTense?.slug === tense.slug
                    ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold/30'
                    : 'border-neutral-150 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-brand-blue font-sans">{tense.name}</div>
                  <div className="font-mono text-[10px] text-brand-gold mt-1 ">{tense.formula}</div>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                  selectedTense?.slug === tense.slug ? 'text-brand-gold translate-x-1' : ''
                }`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="lg:col-span-7 space-y-6">
        <AnimatePresence mode="wait">
          {selectedTense ? (
            <motion.div
              key={selectedTense.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-6"
            >
              {/* Header */}
              <div className="border-b border-gray-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-mono uppercase font-bold mb-2">
                  12-Hour Method Blueprint
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-blue">
                  {selectedTense.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 italic font-sans">
                  "{selectedTense.explanation}"
                </p>
              </div>

              {/* Master Formula Block */}
              <div className="bg-gradient-to-r from-[#0b2240] to-[#123666] text-white rounded-xl p-5 shadow-inner">
                <div className="text-[10px] font-mono text-brand-gold uppercase tracking-wider mb-1 font-bold">
                  Grammar Logic Master Formula:
                </div>
                <div className="font-mono text-lg md:text-xl font-bold tracking-wide break-words">
                  {selectedTense.formula}
                </div>
              </div>

              {/* Examples Grid */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-brand-blue text-sm">Contoh Penerapan Logika (Eddy Sudarmadji Method):</h4>
                <div className="space-y-2.5">
                  <div className="flex gap-3 p-3 bg-green-50 rounded-xl border border-green-150">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs select-none shrink-0 mt-0.5 font-bold">&#x2b;</div>
                    <div>
                      <div className="text-xs font-mono text-green-800 uppercase font-bold tracking-wide">Positif:</div>
                      <div className="text-sm font-sans font-medium text-green-900 mt-0.5">{selectedTense.examplePositive}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-150">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs select-none shrink-0 mt-0.5 font-bold">&#x2212;</div>
                    <div>
                      <div className="text-xs font-mono text-red-800 uppercase font-bold tracking-wide">Negatif:</div>
                      <div className="text-sm font-sans font-medium text-red-900 mt-0.5">{selectedTense.exampleNegative}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-150">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs select-none shrink-0 mt-0.5 font-bold">?</div>
                    <div>
                      <div className="text-xs font-mono text-blue-800 uppercase font-bold tracking-wide">Tanya (Interogatif):</div>
                      <div className="text-sm font-sans font-medium text-blue-900 mt-0.5">{selectedTense.exampleQuestion}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Signals & Logic Warning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-4">
                <div>
                  <div className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">Keterangan Waktu (Time Signals):</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTense.timeSignals.map(sig => (
                      <span key={sig} className="px-2 py-0.5 bg-white border border-neutral-200 rounded-lg text-xs font-sans text-neutral-700">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-neutral-250 pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
                  <div className="flex items-start gap-1.5 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <span className="font-bold">English Paradigm Rule:</span> Selalu sesuaikan bentuk kata kerja dengan ikatan waktu saat kalimat diucapkan.
                    </div>
                  </div>
                </div>
              </div>

              {/* Cognitive Formula Sandbox */}
              <div className="border-t border-gray-150 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 rounded-lg bg-brand-gold/10 text-brand-gold text-xs font-semibold font-sans">
                    Interactive Simulator
                  </div>
                  <h4 className="font-serif font-bold text-brand-blue text-sm">
                    Mesin Simulasi Generasi Kalimat (SVO)
                  </h4>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  Masukkan subject, verb, dan object pilihan Anda di bawah ini. Mesin akan menyesuaikannya berdasarkan struktur gramatikal <span className="font-semibold text-brand-blue">{selectedTense.name}</span> secara real-time!
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Subject (S)</label>
                    <select
                      value={sandboxSubject}
                      onChange={(e) => setSandboxSubject(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-200 p-2 bg-white outline-none focus:border-brand-gold"
                    >
                      <option value="I">I (Saya)</option>
                      <option value="He">He (Dia L)</option>
                      <option value="She">She (Dia P)</option>
                      <option value="The students">The students (Siswa)</option>
                      <option value="Drs. Eddy">Drs. Eddy</option>
                      <option value="We">We (Kami)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Regular Verb (V)</label>
                    <select
                      value={sandboxVerb}
                      onChange={(e) => setSandboxVerb(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-200 p-2 bg-white outline-none focus:border-brand-gold"
                    >
                      <option value="speak">speak (berbicara)</option>
                      <option value="learn">learn (belajar)</option>
                      <option value="practice">practice (berlatih)</option>
                      <option value="write">write (menulis)</option>
                      <option value="teach">teach (mengajar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Complement (O)</label>
                    <input
                      type="text"
                      value={sandboxObject}
                      onChange={(e) => setSandboxObject(e.target.value)}
                      placeholder="English logically"
                      className="w-full text-xs rounded-lg border border-neutral-200 p-2 bg-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Output Generated String */}
                <div className="bg-[#0b2240]/5 rounded-xl p-4 border border-brand-blue/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-wider">Hasil Generasi SVO:</div>
                    <div className="font-serif text-base font-bold text-brand-blue mt-1 italic tracking-wide">
                      {getSandboxPreview(selectedTense)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // copy to clipboard simulation
                      navigator.clipboard.writeText(getSandboxPreview(selectedTense));
                      alert('Kalimat berhasil disalin! Sila gunakan untuk praktek.');
                    }}
                    className="px-3 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg text-xs font-sans font-medium transition-all"
                  >
                    Salin Kalimat
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center text-gray-400 font-sans">
              Pilih salah satu tenses di sebelah kiri untuk melihat detail blueprint belajarnya.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export type { TenseDetail };
