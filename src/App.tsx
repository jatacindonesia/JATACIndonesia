import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Briefcase, BookOpen, Award, Phone, Mail, MapPin, Clock, User, LogIn, Lock, Settings,
  Layers, MessageSquare, Calendar, ChevronRight, ChevronLeft, Sparkles, Plus, Menu, X, GraduationCap, CheckCircle,
  FileText, ArrowUpRight, HelpCircle, Activity, Heart, Bookmark, Database, Printer, Video, ExternalLink, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase Firestore Modules & Helpers
import {
  db,
  fetchSiteConfig,
  saveSiteConfig,
  uploadFullAppDb,
  testConnection,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  fetchAllDbData
} from './lib/database';

// Data & Modules
import {
  INITIAL_SITE_CONFIG,
  INITIAL_ARTICLES,
  INITIAL_SESSIONS,
  INITIAL_GALLERY,
  INITIAL_LMS_MODULES
} from './data';
import { SiteConfig, Member, LearningSession, Article, GalleryItem, LMSModule } from './types';

// Embedded Sub-components
import Logo from './components/Logo';
import TensesHub from './components/TensesHub';
import InteractiveQuiz from './components/InteractiveQuiz';
import DiscussionForum from './components/DiscussionForum';
import LMSPortal from './components/LMSPortal';
import AdminPanel from './components/AdminPanel';

const EMPTY_SITE_CONFIG: SiteConfig = {
  hero: {
    companyName: "JATC Indonesia",
    tagline: "",
    subtitle: "",
    trainerName: "",
    trainerTitle: "",
    backgroundImageUrl: "",
    backgroundImageUrl2: "",
    backgroundImageUrl3: "",
    backgroundImageUrl4: "",
    webinarSeriesTitle: "",
    webinarDuration: "",
    certificateNote: "",
    webinarParts: []
  },
  about: {
    profile: "",
    vision: "",
    mission: [],
    trainerBio: {
      photoUrl: "",
      details: []
    },
    legalities: [],
    history: []
  },
  contact: {
    officeAddress: "",
    whatsappNumber: "",
    operationalHours: ""
  },
  certificate: {
    signatureName: "",
    signatureRole: "",
    backgroundStyle: "abstract-soft",
    logoUrl: "",
    rightLogoUrl: "",
    signatureUrl: "",
    issueDate: ""
  },
  importanceReasons: [],
  failureReasons: [],
  learningGoals: [],
  learningGoalsSubtitle: "",
  learningGoalsArrowUrl: "",
  methodologies: [],
  showLmsAndLive: true,
  targetParticipants: [],
  institutions: []
};

export default function App() {
  // Navigation tabs
  // 'beranda' | 'tentang' | 'tenses' | 'lms' | 'berita' | 'koperasi' | 'pendaftaran' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Multi-State with LocalStorage persistence initialized clean
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    return loadFromLocalStorage<SiteConfig>('jatc_site_config', EMPTY_SITE_CONFIG);
  });

  const [members, setMembers] = useState<Member[]>(() => {
    return loadFromLocalStorage<Member[]>('jatc_members', []);
  });

  const [sessions, setSessions] = useState<LearningSession[]>(() => {
    return loadFromLocalStorage<LearningSession[]>('jatc_sessions', []);
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    return loadFromLocalStorage<Article[]>('jatc_articles', []);
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    return loadFromLocalStorage<GalleryItem[]>('jatc_gallery', []);
  });

  const [lmsModules, setLmsModules] = useState<LMSModule[]>(() => {
    return loadFromLocalStorage<LMSModule[]>('jatc_lms_modules', []);
  });

  // Client Session States (Auth for Members)
  const [loggedInMember, setLoggedInMember] = useState<Member | null>(() => {
    const local = localStorage.getItem('jatc_logged_member');
    return local ? JSON.parse(local) : null;
  });
  
  // Login input
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberPasswordInput, setMemberPasswordInput] = useState('');
  const [memberLoginError, setMemberLoginError] = useState('');

  // Admin dynamic login states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // New registration form fields
  const [regName, setRegName] = useState('');
  const [regBirthPlace, setRegBirthPlace] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regGender, setRegGender] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [regReligion, setRegReligion] = useState<'Islam' | 'Kristen' | 'Budha' | 'Hindu' | 'Konghucu' | 'Kepercayaan'>('Islam');
  const [regProfession, setRegProfession] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSession, setRegSession] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Gallery view filter
  const [galleryFilter, setGalleryFilter] = useState<string>('semua');

  // Sub tab selection inside member dashboard
  const [memberSubTab, setMemberSubTab] = useState<'profile' | 'lms' | 'webinar'>('profile');

  // Carousel indices for target participants & partners on homepage
  const [targetIdx, setTargetIdx] = useState(0);
  const [partnerIdx, setPartnerIdx] = useState(0);

  const [dataLoaded, setDataLoaded] = useState(false);

  // Cloud write wrapper functions that do instant, bulletproof persistence
  const handleSiteConfigChange = async (next: SiteConfig) => {
    setSiteConfig(next);
    saveToLocalStorage('jatc_site_config', next);
    try {
      const { institutions, ...restSiteConfig } = next || {};
      await setDoc(doc(db, 'config', 'site'), { siteConfig: restSiteConfig, lastUpdated: new Date().toISOString() }, { merge: true });
      if (institutions !== undefined) {
        await setDoc(doc(db, 'config', 'institutions'), { institutions, lastUpdated: new Date().toISOString() }, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan siteConfig ke Firestore:", e);
    }
  };

  const handleMembersChange = async (next: Member[]) => {
    setMembers(next);
    saveToLocalStorage('jatc_members', next);
    try {
      const currentList = prevMembersRef.current || [];
      const deleted = currentList.filter(x => !next.some(y => y.id === x.id));
      for (const item of deleted) {
        if (item.id) await deleteDoc(doc(db, 'members', item.id));
      }
      for (const item of next) {
        if (item.id) await setDoc(doc(db, 'members', item.id), item, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan members ke Firestore:", e);
    }
  };

  const handleSessionsChange = async (next: LearningSession[]) => {
    setSessions(next);
    saveToLocalStorage('jatc_sessions', next);
    try {
      const currentList = prevSessionsRef.current || [];
      const deleted = currentList.filter(x => !next.some(y => y.id === x.id));
      for (const item of deleted) {
        if (item.id) await deleteDoc(doc(db, 'sessions', item.id));
      }
      for (const item of next) {
        if (item.id) await setDoc(doc(db, 'sessions', item.id), item, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan sessions ke Firestore:", e);
    }
  };

  const handleArticlesChange = async (next: Article[]) => {
    setArticles(next);
    saveToLocalStorage('jatc_articles', next);
    try {
      const currentList = prevArticlesRef.current || [];
      const deleted = currentList.filter(x => !next.some(y => y.id === x.id));
      for (const item of deleted) {
        if (item.id) await deleteDoc(doc(db, 'articles', item.id));
      }
      for (const item of next) {
        if (item.id) await setDoc(doc(db, 'articles', item.id), item, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan articles ke Firestore:", e);
    }
  };

  const handleGalleryChange = async (next: GalleryItem[]) => {
    setGallery(next);
    saveToLocalStorage('jatc_gallery', next);
    try {
      const currentList = prevGalleryRef.current || [];
      const deleted = currentList.filter(x => !next.some(y => y.id === x.id));
      for (const item of deleted) {
        if (item.id) await deleteDoc(doc(db, 'gallery', item.id));
      }
      for (const item of next) {
        if (item.id) await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan gallery ke Firestore:", e);
    }
  };

  const handleLmsModulesChange = async (next: LMSModule[]) => {
    setLmsModules(next);
    saveToLocalStorage('jatc_lms_modules', next);
    try {
      const currentList = prevLmsModulesRef.current || [];
      const deleted = currentList.filter(x => !next.some(y => y.id === x.id));
      for (const item of deleted) {
        if (item.id) await deleteDoc(doc(db, 'lmsModules', item.id));
      }
      for (const item of next) {
        if (item.id) await setDoc(doc(db, 'lmsModules', item.id), item, { merge: true });
      }
    } catch (e) {
      console.error("Gagal menyimpan lmsModules ke Firestore:", e);
    }
  };

  // Stable state tracking to prevent overwriting cloud storage with stale local values on startup
  const prevSiteConfigRef = useRef<SiteConfig | null>(null);
  const prevMembersRef = useRef<Member[] | null>(null);
  const prevSessionsRef = useRef<LearningSession[] | null>(null);
  const prevArticlesRef = useRef<Article[] | null>(null);
  const prevGalleryRef = useRef<GalleryItem[] | null>(null);
  const prevLmsModulesRef = useRef<LMSModule[] | null>(null);

  // Sync state helper to write to Firestore
  const saveToServer = async (payload: Partial<{
    siteConfig: SiteConfig;
    members: Member[];
    sessions: LearningSession[];
    articles: Article[];
    gallery: GalleryItem[];
    lmsModules: LMSModule[];
  }>) => {
    if (!dataLoaded) return;
    try {
      if (payload.siteConfig) {
        await saveSiteConfig(payload.siteConfig);
      }
      if (payload.members) {
        if (prevMembersRef.current) {
          const deleted = prevMembersRef.current.filter(x => !payload.members!.some(y => y.id === x.id));
          for (const item of deleted) {
            await deleteDoc(doc(db, 'members', item.id));
          }
        }
        for (const item of payload.members) {
          if (!item.id) continue;
          await setDoc(doc(db, 'members', item.id), item, { merge: true });
        }
      }
      if (payload.sessions) {
        if (prevSessionsRef.current) {
          const deleted = prevSessionsRef.current.filter(x => !payload.sessions!.some(y => y.id === x.id));
          for (const item of deleted) {
            await deleteDoc(doc(db, 'sessions', item.id));
          }
        }
        for (const item of payload.sessions) {
          if (!item.id) continue;
          await setDoc(doc(db, 'sessions', item.id), item, { merge: true });
        }
      }
      if (payload.articles) {
        if (prevArticlesRef.current) {
          const deleted = prevArticlesRef.current.filter(x => !payload.articles!.some(y => y.id === x.id));
          for (const item of deleted) {
            await deleteDoc(doc(db, 'articles', item.id));
          }
        }
        for (const item of payload.articles) {
          if (!item.id) continue;
          await setDoc(doc(db, 'articles', item.id), item, { merge: true });
        }
      }
      if (payload.gallery) {
        if (prevGalleryRef.current) {
          const deleted = prevGalleryRef.current.filter(x => !payload.gallery!.some(y => y.id === x.id));
          for (const item of deleted) {
            await deleteDoc(doc(db, 'gallery', item.id));
          }
        }
        for (const item of payload.gallery) {
          if (!item.id) continue;
          await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
        }
      }
      if (payload.lmsModules) {
        if (prevLmsModulesRef.current) {
          const deleted = prevLmsModulesRef.current.filter(x => !payload.lmsModules!.some(y => y.id === x.id));
          for (const item of deleted) {
            await deleteDoc(doc(db, 'lmsModules', item.id));
          }
        }
        for (const item of payload.lmsModules) {
          if (!item.id) continue;
          await setDoc(doc(db, 'lmsModules', item.id), item, { merge: true });
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data ke Cloud Firestore:", e);
    }
  };

  // On mount: Attach Realtime Subscriptions to Firestore Collections & Documents
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initDatabase() {
      try {
        await testConnection();
        // Step 1: Bulk fetch initial data from Firestore to prevent default states race conditions
        const cloudData = await fetchAllDbData();

        if (!cloudData.siteConfig) {
          console.log("Firestore is empty. Starting with clean empty states as requested.");
          setSiteConfig(EMPTY_SITE_CONFIG);
          prevSiteConfigRef.current = EMPTY_SITE_CONFIG;
          setMembers([]);
          prevMembersRef.current = [];
          setSessions([]);
          prevSessionsRef.current = [];
          setArticles([]);
          prevArticlesRef.current = [];
          setGallery([]);
          prevGalleryRef.current = [];
          setLmsModules([]);
          prevLmsModulesRef.current = [];
        } else {
          // Cloud data already exists. Safely update UI states & tracking refs immediately.
          setSiteConfig(cloudData.siteConfig);
          prevSiteConfigRef.current = cloudData.siteConfig;

          if (cloudData.members) {
            const sortedMembers = [...cloudData.members].sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
            setMembers(sortedMembers);
            prevMembersRef.current = sortedMembers;
          }
          if (cloudData.sessions) {
            setSessions(cloudData.sessions);
            prevSessionsRef.current = cloudData.sessions;
          }
          if (cloudData.articles) {
            const sortedArticles = [...cloudData.articles].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
            setArticles(sortedArticles);
            prevArticlesRef.current = sortedArticles;
          }
          if (cloudData.gallery) {
            setGallery(cloudData.gallery);
            prevGalleryRef.current = cloudData.gallery;
          }
          if (cloudData.lmsModules) {
            setLmsModules(cloudData.lmsModules);
            prevLmsModulesRef.current = cloudData.lmsModules;
          }
        }
      } catch (err) {
        console.warn("Layanan Cloud Firestore tidak terhubung sempurna, mencoba menyambungkan via snapshots...", err);
      }

      // Step 2: Register Realtime Listeners to propagate updates instantly across devices
      // 1. Live Sync Site Config
      const unsubConfig = onSnapshot(doc(db, 'config', 'site'), (snap) => {
        if (snap.exists()) {
          const cloudConfig = snap.data()?.siteConfig;
          if (cloudConfig) {
            setSiteConfig(prev => ({
              ...prev,
              ...cloudConfig,
              institutions: prev?.institutions || cloudConfig.institutions || []
            }));
            if (prevSiteConfigRef.current) {
              prevSiteConfigRef.current = {
                ...prevSiteConfigRef.current,
                ...cloudConfig,
                institutions: prevSiteConfigRef.current.institutions || cloudConfig.institutions || []
              };
            }
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'config/site');
      });
      unsubs.push(unsubConfig);

      // 1B. Live Sync Institutions (Split to avoid Firestore 1MB size limit)
      const unsubInstitutions = onSnapshot(doc(db, 'config', 'institutions'), (snap) => {
        if (snap.exists()) {
          const cloudInsts = snap.data()?.institutions;
          if (cloudInsts) {
            setSiteConfig(prev => ({
              ...prev || {},
              institutions: cloudInsts
            } as SiteConfig));
            if (prevSiteConfigRef.current) {
              prevSiteConfigRef.current = {
                ...prevSiteConfigRef.current || {},
                institutions: cloudInsts
              } as SiteConfig;
            }
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'config/institutions');
      });
      unsubs.push(unsubInstitutions);

      // 2. Live Sync Members
      const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
        const list: Member[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as Member);
        });
        list.sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
        setMembers(list);
        prevMembersRef.current = list;
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'members');
      });
      unsubs.push(unsubMembers);

      // 3. Live Sync Sessions
      const unsubSessions = onSnapshot(collection(db, 'sessions'), (snap) => {
        const list: LearningSession[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as LearningSession);
        });
        setSessions(list);
        prevSessionsRef.current = list;
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'sessions');
      });
      unsubs.push(unsubSessions);

      // 4. Live Sync Articles
      const unsubArticles = onSnapshot(collection(db, 'articles'), (snap) => {
        const list: Article[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as Article);
        });
        list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setArticles(list);
        prevArticlesRef.current = list;
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'articles');
      });
      unsubs.push(unsubArticles);

      // 5. Live Sync Gallery
      const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
        const list: GalleryItem[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as GalleryItem);
        });
        // Sort gallery by ID descending so newly added are at the top
        list.sort((a, b) => b.id.localeCompare(a.id));
        setGallery(list);
        prevGalleryRef.current = list;
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'gallery');
      });
      unsubs.push(unsubGallery);

      // 6. Live Sync LMS Modules
      const unsubLms = onSnapshot(collection(db, 'lmsModules'), (snap) => {
        const list: LMSModule[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as LMSModule);
        });
        setLmsModules(list);
        prevLmsModulesRef.current = list;
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'lmsModules');
      });
      unsubs.push(unsubLms);

      // Mark database sync as loaded to safely activate write modifications
      setDataLoaded(true);
    }

    initDatabase();

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  // Synchronous local storage update immediately on any state change
  useEffect(() => {
    saveToLocalStorage('jatc_site_config', siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    saveToLocalStorage('jatc_members', members);
  }, [members]);

  useEffect(() => {
    saveToLocalStorage('jatc_sessions', sessions);
  }, [sessions]);

  useEffect(() => {
    saveToLocalStorage('jatc_articles', articles);
  }, [articles]);

  useEffect(() => {
    saveToLocalStorage('jatc_gallery', gallery);
  }, [gallery]);

  useEffect(() => {
    saveToLocalStorage('jatc_lms_modules', lmsModules);
  }, [lmsModules]);

  useEffect(() => {
    if (loggedInMember) {
      try {
        localStorage.setItem('jatc_logged_member', JSON.stringify(loggedInMember));
      } catch (err) {
        console.warn("Failed to save loggedInMember to localStorage:", err);
      }
    } else {
      try {
        localStorage.removeItem('jatc_logged_member');
      } catch (err) {
        console.warn("Failed to remove loggedInMember from localStorage:", err);
      }
    }
  }, [loggedInMember]);

  // Handle defaults restore
  const handleResetToDefaults = async () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh website ke konfigurasi original bawaan pabrik? (Seluruh pendaftar baru tidak akan hilang)')) {
      await handleSiteConfigChange(INITIAL_SITE_CONFIG);
      await handleSessionsChange(INITIAL_SESSIONS);
      await handleArticlesChange(INITIAL_ARTICLES);
      await handleGalleryChange(INITIAL_GALLERY);
      alert('Website berhasil di-reset ke original!');
    }
  };

  // Submit Member Registration
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regEmail || !regName || !regPassword) {
      alert("Sila isi seluruh bidang dengan benar, termasuk password akun Anda.");
      return;
    }

    // Check duplicate email
    const duplicate = members.find(m => m.email.toLowerCase() === regEmail.toLowerCase());
    if (duplicate) {
      alert("Email ini sudah terdaftar sebagai anggota JATC. Sila lakukan Login Anggota langsung.");
      return;
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: regName,
      password: regPassword,
      birthPlace: regBirthPlace,
      birthDate: regBirthDate || new Date().toISOString().substring(0, 10),
      institution: regInstitution,
      gender: regGender,
      religion: regReligion,
      profession: regProfession,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
      selectedSession: regSession,
      registeredAt: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    };

    const updatedMembers = [...members, newMember];
    await handleMembersChange(updatedMembers);

    // Auto log-in student
    setLoggedInMember(newMember);

    setRegSuccessMessage(`Pendaftaran Anda atas nama ${regName} berhasil dikirim! Silakan gunakan email Anda dan password baru yang Anda buat untuk login.`);
    
    // Clear registration entries
    setRegName('');
    setRegBirthPlace('');
    setRegBirthDate('');
    setRegInstitution('');
    setRegProfession('');
    setRegPhone('');
    setRegEmail('');
    setRegAddress('');
    setRegPassword('');
  };

  // Member Login Process (Password-Gated)
  const handleMemberLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = members.find(m => m.email.toLowerCase() === memberEmailInput.trim().toLowerCase());
    if (found) {
      const requiredPassword = found.password || 'jatc123';
      if (memberPasswordInput !== requiredPassword) {
        setMemberLoginError("Password yang Anda masukkan salah. Sila coba kembalilah, atau hubungi administrator.");
        return;
      }
      setLoggedInMember(found);
      setMemberEmailInput('');
      setMemberPasswordInput('');
      setMemberLoginError('');
      alert(`Selamat datang kembali, ${found.name}! Akses modul LMS Anda kini terbuka.`);
    } else {
      setMemberLoginError("Email tersebut belum terdaftar di lembaga kami. Silakan isi form Pendaftaran Anggota terlebih dahulu.");
    }
  };

  // Admin Unified Login Process
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsernameInput.trim() === 'admin' && adminPasswordInput.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setAdminLoginError('');
      alert("Login Administrator berhasil! Kontrol panel kini terbuka.");
    } else {
      setAdminLoginError("Kombinasi Username dan Password Admin Salah (Gunakan admin / admin)");
    }
  };

  const handleMemberLogout = () => {
    setLoggedInMember(null);
    alert('Anda telah keluar dari akses belajar anggota.');
  };

  // Filtered gallery items
  const filteredGallery = galleryFilter === 'semua'
    ? gallery
    : gallery.filter(item => item.category.toLowerCase() === galleryFilter.toLowerCase());

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#0b2240] flex flex-col items-center justify-center text-white p-6 font-sans">
        <div className="space-y-6 text-center max-w-sm animate-pulse">
          <div className="w-14 h-14 border-4 border-[#a18241] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h1 className="text-sm font-bold font-serif text-[#a18241] tracking-widest uppercase">
              MENGHUBUNGKAN DATABASE GLOBAL
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide leading-relaxed">
              Sinkronisasi data real-time antar-perangkat...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans flex flex-col justify-between" id="applet-viewport">
      {/* Dynamic Header */}
      <header className="bg-[#0b2240] text-white shadow-md sticky top-0 z-50 transition-all border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => setActiveTab('beranda')}>
              <Logo className="h-10 sm:h-12" textColor="text-white" subTextColor="text-gray-300" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1.5 text-xs font-sans font-medium">
              {[
                { id: 'beranda', label: 'Beranda' },
                { id: 'target-mitra', label: 'Target & Mitra' },
                { id: 'tentang', label: 'Tentang Kami' },
                { id: 'tenses', label: '16 Tenses Hub' },
                ...((siteConfig.showLmsAndLive ?? true) ? [{ id: 'lms', label: 'Materi LMS & Live' }] : []),
                { id: 'berita', label: 'Kegiatan & Artikel' },
                { id: 'pendaftaran', label: 'Pendaftaran' },
                { id: 'login', label: 'Login', icon: LogIn }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-brand-gold text-[#0b2240] font-bold shadow-sm'
                      : 'hover:bg-white/10 text-[#f5ebd7]'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 outline-none transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[#0d2d54] text-white border-t border-white/10 overflow-hidden font-sans"
            >
              <div className="px-4 pt-2 pb-6 space-y-2 text-sm font-medium">
                {[
                  { id: 'beranda', label: 'Beranda' },
                  { id: 'target-mitra', label: 'Target & Mitra Sasaran' },
                  { id: 'tentang', label: 'Tentang Kami' },
                  { id: 'tenses', label: '16 English Tenses Hub' },
                  ...((siteConfig.showLmsAndLive ?? true) ? [{ id: 'lms', label: 'Materi LMS & Sesi Live' }] : []),
                  { id: 'berita', label: 'Berita & Artikel Kegiatan' },
                  { id: 'pendaftaran', label: 'Pendaftaran Anggota' },
                  { id: 'login', label: 'Login Platform', icon: LogIn }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-brand-gold text-neutral-900 font-bold'
                        : 'hover:bg-white/10 text-[#f5ebd7]'
                    }`}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
        <AnimatePresence mode="wait">
          {/* ==================== 1. BERANDA VIEW ==================== */}
          {activeTab === 'beranda' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-16"
            >
              {/* Dynamic Landing Hero */}
              <section 
                className="rounded-3xl border-2 border-brand-gold/25 overflow-hidden shadow-lg relative min-h-[550px] p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center"
                style={{
                  backgroundImage: siteConfig.hero.backgroundImageUrl ? `url(${siteConfig.hero.backgroundImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Ambient dark visual overlay layer to elevate contrast of the framing border */}
                <div className="absolute inset-0 bg-neutral-900/15 pointer-events-none" />

                {/* Inner Card Grid Container (with frosted glass backing) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl w-full relative z-10 border border-white/30">
                  {/* Left Column with high legibility frosted glass */}
                  <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center space-y-6 bg-white/65 lg:bg-white/60 backdrop-blur-md relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 self-start rounded-full bg-[#0b2240]/10 text-brand-blue text-[11px] font-bold font-mono uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse shrink-0" />
                      REVOLUSI ENGLISH BELAJAR 12 JAM
                    </div>
                    
                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4.5xl font-extrabold text-[#0b2240] tracking-tight leading-tight">
                      {siteConfig.hero.companyName}
                    </h1>
                    
                    <blockquote className="border-l-4 border-[#c5a059] pl-4 italic text-[#a18241] font-serif text-sm sm:text-base font-medium leading-relaxed">
                      "{siteConfig.hero.tagline}"
                    </blockquote>
                    
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-sans font-extrabold shadow-xs">
                      {siteConfig.hero.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab('pendaftaran')}
                        className="px-6 py-3 bg-[#0b2240] hover:bg-[#a18241] hover:text-white text-white font-semibold text-xs font-sans rounded-xl tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Daftar Anggota Baru
                      </button>
                      <button
                        onClick={() => {
                          const target = document.getElementById('methodology-section');
                          if (target) target.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3 bg-white/90 border border-neutral-300 text-gray-800 hover:bg-white font-bold text-xs font-sans rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Pelajari 5 Metodologi
                      </button>
                    </div>
                  </div>

                  {/* Interactive Webinar Spotlight Panel (Goal 1 / 12 Hour Method) with tinted frosted backdrop */}
                  <div className="bg-[#0b2240]/60 lg:bg-[#0b2240]/50 backdrop-blur-md text-white p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/20 relative">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-brand-gold font-mono tracking-widest">Webinar Invitation Spotlight:</span>
                        <span className="text-[10px] font-mono bg-white/10 text-neutral-200 px-2.5 py-0.5 rounded-full">Drs. Eddy Method</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                          {siteConfig.hero.webinarSeriesTitle}
                        </h3>
                        <p className="text-[11px] text-[#f0dfc1] tracking-wide font-sans">
                          Sistem pelatihan berkapasitas tinggi: {siteConfig.hero.webinarDuration}
                        </p>
                      </div>

                      {/* Timeline of Webinars */}
                      <div className="space-y-3 pt-1">
                        {siteConfig.hero.webinarParts.map((p, idx) => (
                          <div key={p.id} className="flex gap-2.5 items-start border-l-2 border-brand-gold/30 pl-3 py-0.5">
                            <div className="text-[9px] font-mono text-brand-gold uppercase tracking-wider font-bold mt-0.5">
                              {p.part}
                            </div>
                            <div>
                              <p className="text-xs font-sans font-bold text-white tracking-wide">{p.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
                      <p className="text-[10px] text-gray-300 font-sans leading-relaxed">
                        {siteConfig.hero.certificateNote}
                      </p>
                      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-[#0b2240] font-bold font-serif leading-none select-none text-base">
                          ES
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-white">{siteConfig.hero.trainerName}</div>
                          <div className="text-[10px] text-brand-gold font-sans">{siteConfig.hero.trainerTitle}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lower Page Outer Banner with Customizable Night Skyline Background - ONLY wrapping Learning Target Map & Target Kelayakan */}
              <div 
                className="rounded-3xl border border-white/10 p-5 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl transition-all"
                style={{
                  backgroundImage: siteConfig.hero.backgroundImageUrl2 ? `url(${siteConfig.hero.backgroundImageUrl2})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Contrast overlay layer for excellent readability */}
                <div className="absolute inset-0 bg-[#061427]/75 pointer-events-none" />

                {/* Inner layout wrapper to structure elements nicely */}
                <div className="relative z-10 space-y-12">

                  {/* SECTION: 7 LEARNING GOALS BAR */}
                  <section className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
                      <div className="shrink-0 flex items-center justify-center">
                        <img 
                          src={siteConfig.learningGoalsArrowUrl || "/tribal_arrow.jpg"} 
                          alt="Tribal Arrow JATC" 
                          className="w-28 sm:w-36 md:w-44 h-auto object-contain hover:scale-105 transition-all duration-300 pointer-events-none mix-blend-multiply bg-transparent"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center md:text-left space-y-1.5 flex-1">
                        <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest block font-sans">LEARNING TARGETS MAP</span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                          {siteConfig.learningGoals.length} Sasaran Pembelajaran Utama JATC
                        </h2>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                          {siteConfig.learningGoalsSubtitle || "Sistem materi kurikulum kami didesain presisi untuk melampaui hambatan mental konvensional hingga Anda siap dinobatkan menjadi instruktur."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {siteConfig.learningGoals.map((lg) => (
                        <div key={lg.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/15 p-4 flex gap-3 shadow-md hover:border-brand-gold/60 hover:scale-[1.02] hover:bg-white/15 transition-all text-white">
                          <div className="text-sm font-mono font-bold text-brand-gold bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                            {lg.number}
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-neutral-300 uppercase leading-none block select-none">
                              Goal {lg.number}
                            </span>
                            <p className="text-xs font-sans text-white font-bold leading-normal">
                              {lg.goal}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SUBSECTION: TARGET SASARAN PESERTA PELATIHAN */}
                    {siteConfig.targetParticipants && siteConfig.targetParticipants.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-md rounded-3xl border-2 border-white/10 p-6 sm:p-8 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                          <div className="lg:col-span-4 space-y-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-wider block">TARGET KELAYAKAN</span>
                              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                Sasaran Kualifikasi Peserta Pelatihan JATC
                              </h3>
                            </div>
                            <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                              Metodologi akseleratif JATC disesuaikan secara khusus bagi kalangan akademisi, aparatur negara, badan swasta, maupun instansi independen.
                            </p>
                            
                            {/* Control buttons & View all */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                              {siteConfig.targetParticipants.length > 4 && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      const total = siteConfig.targetParticipants?.length || 0;
                                      setTargetIdx(prev => (prev === 0 ? Math.max(0, total - 4) : prev - 1));
                                    }}
                                    className="w-8 h-8 rounded-full bg-brand-gold text-[#0b2240] hover:bg-brand-gold/80 transition-all flex items-center justify-center cursor-pointer shadow-sm select-none"
                                    title="Sebelumnya"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const total = siteConfig.targetParticipants?.length || 0;
                                      setTargetIdx(prev => (prev >= Math.max(0, total - 4) ? 0 : prev + 1));
                                    }}
                                    className="w-8 h-8 rounded-full bg-brand-gold text-[#0b2240] hover:bg-brand-gold/80 transition-all flex items-center justify-center cursor-pointer shadow-sm select-none"
                                    title="Berikutnya"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => setActiveTab('target-mitra')}
                                className="text-xs font-bold text-brand-gold hover:text-white underline transition-colors cursor-pointer"
                              >
                                Lihat Semua Sasaran &rarr;
                              </button>
                            </div>
                          </div>
                          <div className="lg:col-span-8 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(siteConfig.targetParticipants.slice(targetIdx, targetIdx + 4)).map((tpItem, idx) => {
                                const isObj = tpItem && typeof tpItem === 'object' && 'text' in tpItem;
                                const text = isObj ? tpItem.text : String(tpItem);
                                const imageUrl = isObj ? tpItem.imageUrl : '';

                                return (
                                  <div 
                                    key={idx} 
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-5 flex gap-4 items-center shadow-md hover:border-brand-gold/60 hover:scale-[1.02] transition-all duration-300 hover:bg-white/15"
                                  >
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={text}
                                        className="w-12 h-12 object-cover rounded-xl bg-neutral-900/40 border border-white/10 shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <span className="text-sm font-mono font-bold text-brand-gold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                        ✓
                                      </span>
                                    )}
                                    <p className="text-xs sm:text-[13px] font-sans text-white leading-relaxed font-bold flex-1">
                                      {text}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            {siteConfig.targetParticipants.length > 4 && (
                              <div className="text-right text-[10px] text-gray-400 font-mono italic mt-3 pr-1">
                                Menampilkan {targetIdx + 1} s.d {Math.min(targetIdx + 4, siteConfig.targetParticipants.length)} dari {siteConfig.targetParticipants.length} sasaran
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                </div>
              </div>

              {/* SECTION: CLIENTS & PARTNERS AND MODERN ERA PERSPECTIVE WRAPPED WITH BACKGROUND KE-3 */}
              <div 
                className="rounded-3xl border border-white/10 p-5 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl transition-all mt-12"
                style={{
                  backgroundImage: siteConfig.hero.backgroundImageUrl3 ? `url(${siteConfig.hero.backgroundImageUrl3})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Contrast overlay layer for excellent readability */}
                <div className="absolute inset-0 bg-[#061427]/85 pointer-events-none" />

                <div className="relative z-10 space-y-16">
                  {/* SUB-SECTION: MITRA LEMBAGA YANG SUDAH IKUT PELATIHAN */}
                  {siteConfig.institutions && siteConfig.institutions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                          <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest block">CLIENTS & PARTNERS</span>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                            Lembaga & Instansi yang Telah Mengikuti Pelatihan JATC
                          </h2>
                          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                            Dipercaya oleh kementerian negara, badan usaha milik negara (BUMN), korporasi swasta terkemuka, hingga institusi pendidikan tinggi nasional.
                          </p>
                        </div>

                        {/* Navigation & View All Action Side */}
                        <div className="flex items-center gap-3 shrink-0">
                          {siteConfig.institutions.length > 4 && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const total = siteConfig.institutions?.length || 0;
                                  setPartnerIdx(prev => (prev === 0 ? Math.max(0, total - 4) : prev - 1));
                                }}
                                className="w-10 h-10 rounded-full bg-brand-gold text-[#0b2240] hover:bg-brand-gold/85 transition-all flex items-center justify-center cursor-pointer shadow-md select-none"
                                title="Sebelumnya"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  const total = siteConfig.institutions?.length || 0;
                                  setPartnerIdx(prev => (prev >= Math.max(0, total - 4) ? 0 : prev + 1));
                                }}
                                className="w-10 h-10 rounded-full bg-brand-gold text-[#0b2240] hover:bg-brand-gold/85 transition-all flex items-center justify-center cursor-pointer shadow-md select-none"
                                title="Berikutnya"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => setActiveTab('target-mitra')}
                            className="px-4 py-2 border-2 border-brand-gold text-brand-gold font-sans font-bold hover:bg-brand-gold hover:text-[#0b2240] rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                          >
                            Lihat Semua Mitra ({siteConfig.institutions.length})
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-stretch justify-items-center">
                        {(siteConfig.institutions.slice(partnerIdx, partnerIdx + 4)).map((inst) => (
                          <div
                            key={inst.id}
                            className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-5 w-full h-36 sm:h-40 flex flex-col items-center justify-center text-center gap-3 hover:border-brand-gold hover:shadow-lg hover:scale-[1.03] transition-all duration-300 relative overflow-hidden group shadow-sm text-white"
                          >
                            {inst.logoUrl ? (
                              <div className="bg-white/95 p-1.5 rounded-xl flex items-center justify-center w-full h-16 sm:h-20 shadow-sm shrink-0">
                                <img
                                  src={inst.logoUrl}
                                  alt={inst.name}
                                  className="max-h-full max-w-full object-contain filter-none group-hover:scale-105 transition-all duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-brand-gold border border-white/25 shrink-0">
                                {inst.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs sm:text-sm font-sans font-extrabold text-white leading-tight px-1 select-none truncate w-full group-hover:text-brand-gold transition-colors">
                              {inst.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      {siteConfig.institutions.length > 4 && (
                        <div className="text-right text-[10px] text-gray-400 font-mono italic pr-1">
                          Menampilkan {partnerIdx + 1} s.d {Math.min(partnerIdx + 4, siteConfig.institutions.length)} dari {siteConfig.institutions.length} mitra terdaftar
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-SECTION: WHY IS ENGLISH IMPORTANT & WHY MILLIONS FAIL */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 border-t border-white/10">
                    {/* 2A. Importance reasons (Modern Era requirements) */}
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-brand-gold font-mono tracking-widest block">MODERN ERA PERSPECTIVE</span>
                        <h3 className="font-serif text-2xl font-bold text-white">
                          Mengapa Penguasaan Bahasa Inggris Lebih Penting di Era Sekarang?
                        </h3>
                      </div>

                      <div className="space-y-5">
                        {siteConfig.importanceReasons.map((reason) => (
                          <div key={reason.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl h-fit shrink-0 border border-brand-gold/20">
                              {reason.iconName === 'Globe' && <Globe className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Briefcase' && <Briefcase className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'BookOpen' && <BookOpen className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Award' && <Award className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Sparkles' && <Sparkles className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'GraduationCap' && <GraduationCap className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Heart' && <Heart className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Bookmark' && <Bookmark className="w-5 h-5 text-brand-gold" />}
                              {reason.iconName === 'Activity' && <Activity className="w-5 h-5 text-brand-gold" />}
                              {!['Globe', 'Briefcase', 'BookOpen', 'Award', 'Sparkles', 'GraduationCap', 'Heart', 'Bookmark', 'Activity'].includes(reason.iconName) && <Globe className="w-5 h-5 text-brand-gold" />}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-serif font-bold text-white text-sm leading-snug">
                                {reason.title}
                              </h4>
                              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                                {reason.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2B. Why learners Fail (Mindset Collision) */}
                    <div className="bg-red-950/45 backdrop-blur-md border border-red-800/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-red-50">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-red-400 font-mono tracking-widest block">PROBLEM IDENTIFICATION</span>
                        <h3 className="font-serif text-2xl font-bold text-white">
                          Mengapa Jutaan Pembelajar Indonesia Gagal Menguasai Bahasa Inggris?
                        </h3>
                      </div>

                      <div className="space-y-3.5 text-xs text-red-100/95 leading-relaxed font-sans">
                        <p className="border-b border-red-800/35 pb-3">
                          Hambatan fundamental terbesar terletak pada kebiasaan menerapkan <span className="font-bold text-red-300">Mindset dan Paradigma Bahasa Indonesia</span> ke dalam Bahasa Inggris, padahal kedua struktur bahasa ini bertolak belakang secara signifikan.
                        </p>

                        <div className="space-y-3">
                          {siteConfig.failureReasons.map((fail) => (
                            <div key={fail.id} className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              <div>
                                <span className="font-bold text-white">{fail.title}:</span>{' '}
                                {fail.description}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 bg-red-900/40 rounded-xl border border-red-800/30 text-red-100 text-[11px] flex gap-2 font-medium">
                          <HelpCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span>Akibatnya: Progres terasa lambat karena otak terlalu letih melakukan penerjemahan ganda (translate in the head) setiap waktu.</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* SECTION: MR EDDY'S METHODOLOGIES */}
              <div 
                className="rounded-3xl border border-white/10 p-5 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl transition-all mt-12"
                style={{
                  backgroundImage: siteConfig.hero.backgroundImageUrl4 ? `url(${siteConfig.hero.backgroundImageUrl4})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Contrast overlay layer for excellent readability */}
                <div className="absolute inset-0 bg-[#061427]/85 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <section className="space-y-8 scroll-mt-24" id="methodology-section">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                      <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest block">PRAGMATIC SOLUTIONS</span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                        {siteConfig.methodologies.length} Metodologi Pengajaran Kontemporer
                      </h2>
                      <blockquote className="italic text-neutral-300 text-xs font-sans mt-1">
                        Dirancang eksklusif oleh Drs. Eddy Sudarmadji MM., MBA., Dipl TEFL untuk menjembatani kesenjangan logika dan mental bahasa.
                      </blockquote>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {siteConfig.methodologies.map((meth) => (
                        <div key={meth.id} className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/15 p-5 shadow-sm space-y-4 hover:border-brand-gold hover:bg-white/20 transition-all duration-300 flex flex-col justify-between text-white group">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold font-mono tracking-wide text-brand-gold uppercase">{meth.title}</span>
                              <span className="text-[10px] font-mono bg-white/10 text-brand-gold px-2 py-0.5 rounded-md font-bold">JATC Method</span>
                            </div>
                            
                            <h4 className="font-serif text-lg font-bold text-white leading-tight font-extrabold group-hover:text-brand-gold transition-colors">
                              {meth.subtitle}
                            </h4>
                            
                            <p className="text-xs text-neutral-200 leading-relaxed font-sans font-normal">
                              {meth.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 space-y-1 text-[11px] font-sans">
                            <span className="block font-bold text-white/55 font-mono text-[9px] uppercase">COCOK UNTUK:</span>
                            <p className="text-brand-gold font-bold">{meth.forWho}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* CTA BANNER */}
              <section className="bg-gradient-to-r from-[#0b2240] to-[#123666] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden mt-8">
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 w-64 h-64 border-4 border-white rounded-full translate-x-12 translate-y-12" />
                <div className="max-w-xl mx-auto space-y-4 relative z-10">
                  <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">MITRA BELAJAR INDONESIA</span>
                  <h3 className="font-serif text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white leading-tight">Sudah Siap Menguasai Logika English untuk Karir Dunia?</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Dapatkan akses {(siteConfig.showLmsAndLive ?? true) ? 'LMS gratis, ' : ''}16 Tenses Simulator, serta ikuti {(siteConfig.showLmsAndLive ?? true) ? 'webinar series' : 'kelas intensif'} yang bersertifikat resmi. Daftar kelayakan hanya kurang dari 2 menit.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('pendaftaran')}
                      className="px-6 py-3 bg-[#c5a059] hover:bg-[#c5a059]/90 text-neutral-900 font-bold text-xs font-sans tracking-wide rounded-xl shadow-lg transition-all cursor-pointer animate-none"
                    >
                      Daftar Anggota Sekarang
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* ==================== TARGET & MITRA VIEW ==================== */}
          {activeTab === 'target-mitra' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Page Header */}
              <div className="bg-[#0b2240] text-white rounded-3xl p-8 sm:p-12 md:p-16 border border-white/10 relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative space-y-4 max-w-2xl">
                  <span className="text-xs font-mono font-bold text-brand-gold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">KUALIFIKASI & KEMITRAAN</span>
                  <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold tracking-tight">Target Sasaran & Mitra Lembaga</h1>
                  <p className="text-sm text-gray-200 font-sans leading-relaxed">
                    Temukan sasaran kualifikasi peserta pelatihan JATC serta jaringan departemen pemerintah dan korporasi swasta mitra yang telah memercayakan program pembelajaran logis kami.
                  </p>
                </div>
              </div>

              {/* Section 1: Target Sasaran Pembelajaran (Full Grid) */}
              {siteConfig.targetParticipants && siteConfig.targetParticipants.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-blue">
                      Sasaran Kualifikasi Peserta Pelatihan
                    </h2>
                    <p className="text-sm text-gray-500 font-sans mt-1">
                      Program JATC didesain khusus agar dapat diakomodasi oleh peserta dari berbagai jenjang kualifikasi dan target sasaran.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {siteConfig.targetParticipants.map((tpItem, idx) => {
                      const isObj = tpItem && typeof tpItem === 'object' && 'text' in tpItem;
                      const text = isObj ? tpItem.text : String(tpItem);
                      const imageUrl = isObj ? tpItem.imageUrl : '';

                      return (
                        <div key={idx} className="bg-white rounded-3xl border-2 border-neutral-200/60 p-6 flex flex-col gap-4 shadow-xs hover:border-[#a18241]/45 hover:shadow-md transition-all duration-300">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={text}
                              className="w-full h-44 object-cover rounded-2xl bg-neutral-100 border border-neutral-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl shrink-0">
                              ✓
                            </div>
                          )}
                          <div className="space-y-1 flex-1 flex flex-col justify-between">
                            <span className="text-[10px] font-mono font-bold text-gray-400 block tracking-wider uppercase">SASARAN #{idx + 1}</span>
                            <p className="text-sm font-sans text-neutral-800 leading-relaxed font-bold mt-1">
                              {text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Mitra Lembaga (Full Grid, enlarged) */}
              {siteConfig.institutions && siteConfig.institutions.length > 0 && (
                <div className="space-y-6 pt-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-blue">
                      Jaringan Kemitraan Lembaga & Instansi
                    </h2>
                    <p className="text-sm text-gray-500 font-sans mt-1">
                      Daftar lengkap kementerian negara, BUMN, institusi pendidikan tinggi, dan perusahaan swasta kredibel yang telah resmi berkolaborasi bersama JATC.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-stretch justify-items-center">
                    {siteConfig.institutions.map((inst) => (
                      <div
                        key={inst.id}
                        className="bg-white rounded-3xl border-2 border-neutral-200/60 p-6 w-full h-40 flex flex-col items-center justify-center text-center gap-3 hover:border-brand-gold hover:shadow-md transition-all duration-300 group shadow-sm"
                      >
                        {inst.logoUrl ? (
                          <img
                            src={inst.logoUrl}
                            alt={inst.name}
                            className="h-16 sm:h-20 max-w-full object-contain filter-none group-hover:scale-105 transition-all duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-lg font-bold text-[#a18241] border border-amber-200 shrink-0">
                            {inst.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-sans font-extrabold text-neutral-800 leading-tight px-1 select-none truncate w-full group-hover:text-brand-blue transition-colors">
                          {inst.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== 2. TENTANG KAMI VIEW ==================== */}
          {activeTab === 'tentang' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Profile Block */}
              <section className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-[#a18241] uppercase tracking-widest block">INSTITUTIONAL PROFILE</span>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-blue">
                    John Andersen Training and Consulting Indonesia
                  </h2>
                  <div className="w-20 h-1 bg-[#c5a059] mb-4" />
                  <p className="text-sm font-sans text-gray-600 leading-relaxed">
                    {siteConfig.about.profile}
                  </p>
                </div>

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="bg-neutral-50/50 border border-neutral-200 rounded-xl p-6 space-y-3">
                    <h4 className="font-serif font-bold text-brand-blue text-lg">Visi Kami</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium italic">
                      "{siteConfig.about.vision}"
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 border border-neutral-200 rounded-xl p-6 space-y-3">
                    <h4 className="font-serif font-bold text-brand-blue text-lg">Misi Kami</h4>
                    <ul className="space-y-2">
                      {siteConfig.about.mission.map((mis, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-xs text-gray-500 font-sans leading-normal">
                          <CheckCircle className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                          <span>{mis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Bio Trainer (Goal #7: Drs. Eddy Sudarmadji) */}
              <section className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4 text-center border-b lg:border-b-0 lg:border-r pb-6 lg:pb-0 lg:pr-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#0b2240] to-[#c5a059] p-1 flex items-center justify-center hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-white text-3xl font-serif font-bold italic select-none">
                      ES
                    </div>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#0b2240] text-lg leading-snug">
                      Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL
                    </h4>
                    <p className="text-[10px] font-mono text-[#a18241] uppercase font-bold tracking-widest mt-1">
                      Lead Master Trainer & Founder
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-[#a18241] text-[10px] font-mono font-bold">
                    Experiens: 32+ Tahun (Dipl TEFL)
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
                  <span className="text-[9px] font-bold text-brand-gold font-mono tracking-widest uppercase block">PROFIL GURU / TRAINER</span>
                  <h3 className="font-serif text-2xl font-bold text-brand-blue">
                    Trainer & Inisiator Pembelajaran
                  </h3>
                  <div className="space-y-3">
                    {siteConfig.about.trainerBio.details.map((detail, idx) => (
                      <p key={idx} className="text-xs text-gray-500 leading-relaxed font-sans">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              {/* Sejarah & Dokumentasi Pendukung JATC */}
              <section className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest block">JATC TRAINING EVIDENCE</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-blue leading-tight">
                    History & Dokumentasi Pendukung JATC
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl font-sans leading-relaxed">
                    Galeri foto aktivitas, pelatihan korporasi, seminar nasional, dan pengenalan metodologi pengajaran praktis sebagai bukti pendukung keberhasilan dari lembaga JOHN ANDERSEN TRAINING AND CONSULTING.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {siteConfig.about.history && siteConfig.about.history.length > 0 ? (
                    siteConfig.about.history.map((hist) => (
                      <div key={hist.id} className="group bg-neutral-50/75 border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs hover:border-brand-gold hover:shadow-md transition-all duration-300 flex flex-col h-full border-b-4 hover:border-b-brand-gold">
                        <div className="aspect-video relative overflow-hidden bg-neutral-100 flex-shrink-0">
                          {hist.imageUrl ? (
                            <img
                              src={hist.imageUrl}
                              alt={hist.title}
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0b2240]/5 text-[#0b2240] text-xs font-mono">
                              No Image Available
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-brand-gold text-[#0b2240] text-[10px] font-extrabold font-mono px-2 py-0.5 rounded shadow-sm">
                            Tahun {hist.year}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h4 className="font-serif text-sm font-extrabold text-brand-blue leading-snug group-hover:text-brand-gold transition-colors duration-200 line-clamp-2">
                              {hist.title}
                            </h4>
                            <p className="text-xs text-gray-500 font-sans leading-relaxed font-normal">
                              {hist.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-400 font-sans text-xs">
                      Belum ada dokumentasi sejarah JATC. Silakan tambahkan melalui Akses Admin.
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* ==================== 3. 16 TENSES HUB VIEW ==================== */}
          {activeTab === 'tenses' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-neutral-900 text-white rounded-2xl border border-neutral-800 p-8 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-brand-gold font-mono tracking-widest">Mastery Goal #6 Track:</span>
                  <h2 className="font-serif text-2xl sm:text-3.5xl font-extrabold tracking-tight">Kunci Menguasai Logika 16 Tenses</h2>
                  <p className="text-xs text-neutral-400 max-w-xl font-sans">
                    Setiap tense mewakili ikatan waktu berpikir spasial. Melalui simulasi kognitif visual ini, Anda dengan mudah menyembuhkan kebiasaan keliru menerjemahkan di kepala.
                  </p>
                </div>
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center shrink-0">
                   <div className="font-mono text-xl font-bold text-brand-gold leading-none">12 JAM</div>
                   <div className="text-[9px] uppercase font-sans tracking-wide text-gray-300 mt-0.5">Metode Eddy Sudarmadji</div>
                </div>
              </div>
              <TensesHub />
            </motion.div>
          )}

          {/* ==================== 4. LMS VIEW & QUIZ ==================== */}
          {activeTab === 'lms' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-16 animate-fade-in"
            >
              {/* LMS View (locked by auth by default) */}
              <section className="space-y-6">
                <LMSPortal isLoggedIn={!!loggedInMember} />
              </section>

              {/* Quiz Module for Certificate (Goal 7) */}
              <section className="space-y-6 scroll-mt-24" id="assessment-portal-section">
                <div className="text-center space-y-1.5 max-w-2xl mx-auto">
                  <span className="text-[10px] font-mono font-bold text-[#a18241] uppercase tracking-widest block">ASSESSMENT & CERTIFICATION</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-blue">
                    Evaluasi Kelayakan Sertifikat Calon Instruktur
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Ujian instan interaktif ini adalah pilar kelulusan Learning Goal 7 untuk siap mengajar. Masukkan nama lengkap Anda lalu kirimkan 5 rincian jawaban logis.
                  </p>
                </div>
                <InteractiveQuiz loggedInMember={loggedInMember} />
              </section>
            </motion.div>
          )}

          {/* ==================== 5. DISCUSSION FORUM / PRACTICE VIEW ==================== */}
          {activeTab === 'tenses' || activeTab === 'forum' || activeTab === 'practice' || activeTab === 'berita' ? null : null }
          {/* Note: In activeTab routing we map each section specifically */}

          {/* ==================== 6. NEWS & ARTICLES & GALERI VIEW ==================== */}
          {activeTab === 'berita' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-16 animate-fade-in"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Articles Area */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex border-b pb-3 items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[#a18241] font-mono tracking-widest uppercase">READING RESOURCES (GOAL 1 & 5)</span>
                      <h3 className="font-serif text-2xl font-bold text-brand-blue mt-0.5">Artikel & Tips Percaya Diri</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {articles.map(art => (
                      <article key={art.id} className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4 hover:shadow transition-all text-left">
                        {art.imageUrl && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                            <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold font-mono uppercase tracking-wide rounded-md">
                              {art.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{art.date}</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-brand-blue hover:text-brand-gold transition-colors leading-snug">
                            {art.title}
                          </h4>
                          <p className="text-xs text-gray-500 font-sans leading-relaxed">
                            {art.description}
                          </p>
                          <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-[10px] text-gray-400 font-sans">
                            <span>Oleh: <span className="font-medium text-brand-blue">{art.author}</span></span>
                            <span>{art.readTime}</span>
                          </div>
                        </div>

                        {/* External Attachments Banner */}
                        {art.externalUrl && (
                          <div className="p-3 bg-slate-50 border border-neutral-200/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-brand-gold uppercase font-mono block">Referensi / Video Eksternal:</span>
                              <p className="text-[10px] text-zinc-500 font-mono line-clamp-1 max-w-[280px]" title={art.externalUrl}>{art.externalUrl}</p>
                            </div>
                            <a
                              href={art.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-brand-blue hover:bg-[#0b2240] text-white text-[10px] font-bold rounded-lg shadow-sm shrink-0 inline-flex items-center gap-1"
                            >
                              Buka Link Berita / Video JATC 🔗
                            </a>
                          </div>
                        )}

                        {/* Hidden simulator details */}
                        <details className="text-[11px] text-neutral-600 bg-neutral-50 rounded-lg p-3 border font-sans cursor-pointer">
                          <summary className="font-semibold text-brand-blue list-none hover:text-brand-gold transition-colors">Tampilkan Isi Artikel Selengkapnya...</summary>
                          <p className="mt-2 text-xs leading-relaxed text-gray-600 border-t pt-2 max-h-48 overflow-y-auto whitespace-pre-line">{art.content}</p>
                        </details>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Forum Practice board side */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Embedded Forum Practice */}
                  <DiscussionForum
                    isLoggedIn={!!loggedInMember}
                    currentUserName={loggedInMember ? loggedInMember.name : "Tamu"}
                  />
                </div>
              </div>

              {/* Documentation & Gallery */}
              <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">
                 <div>
                   <span className="text-[9px] font-bold text-[#a18241] font-mono tracking-widest uppercase block">MOCK PHOTO DOCUMENTATION</span>
                   <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-blue">Galeri & Dokumentasi Pelatihan</h3>
                   <p className="text-xs text-gray-400 mt-1">Sertifikasi kemitraan JATC bersama tim bimbingan Drs. Eddy Sudarmadji.</p>
                 </div>

                 {/* Filters */}
                 <div className="flex flex-wrap gap-1.5 pb-2 border-b">
                   {['semua', 'pelatihan', 'zoom', 'sertifikasi', 'seminar', 'dokumentasi'].map(cat => (
                     <button
                       key={cat}
                       onClick={() => setGalleryFilter(cat)}
                       className={`px-3 py-1.25 text-xs font-sans font-medium rounded-lg uppercase tracking-wide transition-all cursor-pointer ${
                         galleryFilter === cat
                           ? 'bg-[#0b2240] text-white font-bold shadow-sm'
                           : 'bg-neutral-50 hover:bg-neutral-100 text-gray-500'
                       }`}
                     >
                       {cat === 'zoom' ? 'ZOOM ONLINE' : cat}
                     </button>
                   ))}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {filteredGallery.map(item => (
                     <div key={item.id} className="relative bg-neutral-100/30 border border-neutral-200 rounded-xl overflow-hidden shadow-sm group flex flex-col justify-between hover:scale-[1.01] transition-all text-left">
                       <div className="relative overflow-hidden shrink-0 aspect-[4/3] bg-neutral-100">
                         {item.imageUrl ? (
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-brand-blue/5 text-brand-blue space-y-1">
                             <span className="text-xl font-mono">▶</span>
                             <span className="text-[10px] font-bold uppercase font-mono">Video Session Only</span>
                           </div>
                         )}

                         {/* Hover Overlay Button link for media URLs */}
                         {(item.videoUrl || item.externalUrl) && (
                           <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-4 z-20">
                             {item.videoUrl && (
                               <a
                                 href={item.videoUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-4/5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg font-sans text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-sm transition-transform hover:scale-105"
                               >
                                 ▶ Putar Video YouTube
                                </a>
                             )}
                             {item.externalUrl && (
                               <a
                                 href={item.externalUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-4/5 py-1.5 bg-[#0b2240] hover:bg-[#0b2240]/90 text-white rounded-lg font-sans text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-sm transition-transform hover:scale-105"
                               >
                                 🔗 Buka Tautan Referensi
                               </a>
                             )}
                           </div>
                         )}
                       </div>

                       <div className="p-3.5 space-y-1 bg-white flex-1 flex flex-col justify-between border-t border-neutral-100 relative z-10">
                         <div className="space-y-1">
                           <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono text-brand-gold bg-brand-gold/5 uppercase tracking-wide">{item.category}</span>
                           <h5 className="font-sans font-bold text-xs text-brand-blue leading-normal mt-1">{item.title}</h5>
                         </div>

                         {/* Action & Date details footer */}
                         <div className="pt-2 border-t border-dashed border-neutral-150 flex items-center justify-between text-[10px] text-gray-400 font-mono mt-3">
                           <span>Sesi: {item.date}</span>
                           <div className="flex gap-1 shrink-0">
                             {item.videoUrl && (
                               <a
                                 href={item.videoUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[9px] bg-red-50 text-red-700 hover:bg-red-100 px-1.5 py-0.5 rounded font-bold font-sans flex items-center gap-0.5 border border-red-200"
                               >
                                 video
                               </a>
                             )}
                             {item.externalUrl && (
                               <a
                                 href={item.externalUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[9px] bg-sky-50 text-sky-850 hover:bg-sky-100 px-1.5 py-0.5 rounded font-bold font-sans flex items-center gap-0.5 border border-sky-200"
                               >
                                 tautan
                               </a>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </section>
            </motion.div>
          )}



          {/* ==================== 8. PENDAFTARAN & LOGIN ANGGOTA ==================== */}
          {activeTab === 'pendaftaran' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Registration Form (10exact fields) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b pb-3">
                  <span className="text-[10px] font-mono font-bold text-[#a18241] tracking-widest uppercase block">ONLINE ADMISSION SYSTEM</span>
                  <h3 className="font-serif text-2xl font-bold text-[#0b2240] mt-1.5">Pendaftaran Anggota Baru_</h3>
                  <p className="text-xs text-gray-400 mt-1">Sila lengkapi ke-10 rincian data keanggotaan kursus Anda di bawah ini secara cermat.</p>
                </div>

                {regSuccessMessage && (
                  <div className="bg-green-50 text-green-800 text-xs rounded-xl p-4 border border-green-200 space-y-1 font-sans">
                     <span className="font-bold block">✓ Registrasi Diterima!</span>
                     <p>{regSuccessMessage}</p>
                  </div>
                )}

                <form onSubmit={handleRegistrationSubmit} className="space-y-4 text-xs font-sans">
                  {/* Field 1: Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">1. Nama Anggota (Lengkap dengan Gelar Akademik):</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="contoh: Mohammad Muslih, S.H., M.M."
                      className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  {/* Field 2 & 3: Tempat & Tanggal Lahir (Combined column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">2. Tempat Lahir:</label>
                      <input
                        type="text"
                        required
                        value={regBirthPlace}
                        onChange={(e) => setRegBirthPlace(e.target.value)}
                        placeholder="contoh: Malang"
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">3. Tanggal Lahir:</label>
                      <input
                        type="date"
                        required
                        value={regBirthDate}
                        onChange={(e) => setRegBirthDate(e.target.value)}
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 4 & 5: Institusi & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">4. Institusi / Lembaga Naungan:</label>
                      <input
                        type="text"
                        required
                        value={regInstitution}
                        onChange={(e) => setRegInstitution(e.target.value)}
                        placeholder="contoh: PT Pos Indonesia (Persero)"
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1 font-bold">5. Jenis Kelamin:</label>
                      <div className="flex gap-4 p-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="gender" checked={regGender === 'Laki-Laki'} onChange={() => setRegGender('Laki-Laki')} />
                          Laki-Laki
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="gender" checked={regGender === 'Perempuan'} onChange={() => setRegGender('Perempuan')} />
                          Perempuan
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Field 6 & 7: Agama & Pekerjaan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">6. Agama Pilihan:</label>
                      <select
                        value={regReligion}
                        onChange={(e) => setRegReligion(e.target.value as any)}
                        className="w-full bg-neutral-50 border p-2 rounded-lg outline-none focus:border-brand-gold focus:bg-white"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Budha">Budha</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Konghucu">Konghucu</option>
                        <option value="Kepercayaan">Kepercayaan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">7. Pekerjaan / Keahlian Utama:</label>
                      <input
                        type="text"
                        required
                        value={regProfession}
                        onChange={(e) => setRegProfession(e.target.value)}
                        placeholder="e.g. logistik, kurir ekpedisi, keuangan"
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 8 & 9: Telp & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">8. No. Telp / HP / WhatsApp Aktif:</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 081234567890"
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">9. Alamat Email (Aktif):</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. Ikatanppi@gmail.com"
                        className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 10: Alamat Lengkap */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1 font-bold">10. Alamat Rumah Lengkap:</label>
                    <input
                      type="text"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="e.g. Jl Pahlawan 24 Madiun RT. 003 RW. 001 Kec. Manguharjo Kota Madiun 63122"
                      className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-brand-gold outline-none"
                    />
                  </div>

                  {/* Field 11: Learning Session Option (sourced dynamically from admin settings!) */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-blue uppercase font-mono mb-1">11. Learning Session Terjadwal (Diatur Admin):</label>
                    <select
                      value={regSession}
                      onChange={(e) => setRegSession(e.target.value)}
                      className="w-full bg-yellow-500/5 hover:bg-yellow-500/10 border border-brand-gold/40 p-2.5 rounded-lg outline-none font-sans font-bold text-[#a18241]"
                    >
                      <option value="">-- Belajar Mandiri (Tanpa Jadwal Sesi / Webinar) --</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.title}>{s.title} ({s.dateTime})</option>
                      ))}
                    </select>
                  </div>

                  {/* Field 12: Buat Password Login */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#a18241] uppercase font-mono mb-1">12. Buat Password Login Anggota:</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="e.g. Rahasia123 (Simpan untuk login sertifikat)"
                      className="w-full bg-neutral-50 border p-2 rounded-lg focus:bg-white focus:border-[#a18241] outline-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0b2240] hover:bg-[#0b2240]/90 text-white font-semibold py-3 px-4 rounded-xl shadow-md tracking-wide transition-all cursor-pointer font-sans"
                  >
                    Kirim & Daftarkan Keanggotaan
                  </button>
                </form>
              </div>

              {/* Login Anggota Side Column */}
              <div className="lg:col-span-5 space-y-6">
                {loggedInMember ? (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-bold text-[#0b2240]">
                        Sesi Anggota Aktif
                      </h4>
                      <div className="font-bold text-gray-700 text-xs font-sans">
                        {loggedInMember.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {loggedInMember.email}{loggedInMember.selectedSession ? ` • ${loggedInMember.selectedSession}` : ''}
                      </div>
                    </div>
                    {(siteConfig.showLmsAndLive ?? true) && (
                      <div className="bg-[#0b2240]/5 p-3 rounded-lg border text-[11px] text-[#a18241] font-sans">
                        Akses Materi Pembelajaran LMS kini telah dibuka secara penuh. Sila klik menu <span className="font-bold underline cursor-pointer" onClick={() => setActiveTab('lms')}>"Materi LMS & Live"</span>.
                      </div>
                    )}
                    <button
                      onClick={handleMemberLogout}
                      className="w-full py-2 bg-red-50 text-red-700 hover:bg-red-100/80 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer"
                    >
                      Log out Kelas Belajar
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm">
                    <div className="text-center space-y-1 pb-2 border-b">
                      <LogIn className="w-6 h-6 text-brand-blue mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-[#0b2240]">Sudah Terdaftar?</h4>
                      <p className="text-[10px] text-gray-400 leading-normal font-sans">
                        Silakan menuju ke menu <strong>Login</strong> pada navigasi atas untuk masuk ke ruang belajar Anggota Anda dan sertifikasi kelulusan.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('login')}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-2 rounded-lg text-xs font-sans cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Menuju Portal Login
                    </button>
                  </div>
                )}

                {/* Jam Operasional dan Alamat Sideboard */}
                <div className="bg-[#0b2240] text-[#fbf7f0] rounded-2xl p-6 space-y-4">
                  <div className="font-serif font-bold text-base border-b border-white/10 pb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-gold animate-shake" />
                    Kontak & Operasional
                  </div>
                  <div className="space-y-3.5 text-xs font-sans">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Kantor JATC:</span>
                        <span className="text-gray-300 leading-normal">{siteConfig.contact.officeAddress}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start">
                      <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Jam Pelayanan:</span>
                        <span className="text-gray-300 leading-normal">{siteConfig.contact.operationalHours}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center pt-2 border-t border-white/5">
                      <Phone className="w-4 h-4 text-green-400 shrink-0" />
                      <div>
                        <span className="font-bold block">WhatsApp Operasional:</span>
                        <a
                          href={`https://wa.me/${siteConfig.contact.whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-gold hover:underline font-bold"
                        >
                          +{siteConfig.contact.whatsappNumber} (Direct Link)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== 9. UNIFIED DUAL LOGIN SECTION ==================== */}
          {activeTab === 'login' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loggedInMember ? (
                // PREMIUM MEMBER DASHBOARD & LEARNING COCKPIT
                <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl border border-neutral-200 p-4 sm:p-7 shadow-md space-y-6 font-sans text-left">
                  {/* Header Area */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0b2240] text-brand-gold rounded-full flex items-center justify-center font-serif text-xl font-bold border border-[#a18241]">
                        {loggedInMember.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-[#a18241] font-bold uppercase tracking-wider block">JATC PRIVATE PORTAL</span>
                        <h3 className="font-serif text-lg font-bold text-[#0b2240]">{loggedInMember.name}</h3>
                        <p className="text-[10px] text-gray-400 font-sans">{loggedInMember.email} • Terdaftar pada: {loggedInMember.registeredAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-sans">Status Akun:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider ${
                        loggedInMember.status === 'Selesai' ? 'bg-green-100 text-green-800 border border-green-200' :
                        loggedInMember.status === 'Ditolak' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-250 animate-pulse'
                      }`}>
                        {loggedInMember.status === 'Selesai' ? 'Disetujui (Approved)' : loggedInMember.status === 'Ditolak' ? 'Ditolak (Rejected)' : 'Pending Peninjauan'}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Tabs Control */}
                  <div className="flex flex-wrap gap-1.5 border-b pb-3 border-neutral-100">
                    <button
                      onClick={() => setMemberSubTab('profile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                        memberSubTab === 'profile'
                          ? 'bg-[#0b2240] text-white'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      👤 Akun & Sertifikasi
                    </button>
                    {(siteConfig.showLmsAndLive ?? true) && (
                      <>
                        <button
                          onClick={() => setMemberSubTab('lms')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                            memberSubTab === 'lms'
                              ? 'bg-[#0b2240] text-white'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          📚 Materi Kurikulum LMS
                        </button>
                        <button
                          onClick={() => setMemberSubTab('webinar')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                            memberSubTab === 'webinar'
                              ? 'bg-[#0b2240] text-white'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          📅 Informasi Webinar & Live
                        </button>
                      </>
                    )}
                  </div>

                  {/* Tab Contents */}
                  <AnimatePresence mode="wait">
                    {memberSubTab === 'profile' && (
                      <motion.div
                        key="profile-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-6"
                      >
                        {/* Member Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1 bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-4">
                            <h4 className="font-serif text-xs font-bold text-brand-blue border-b pb-1">Biodata Instruktur</h4>
                            <div className="space-y-2.5 text-[11px] font-sans">
                              <div>
                                <span className="text-gray-400 block font-mono text-[9px] uppercase">Lembaga Naungan:</span>
                                <strong className="text-neutral-800 block text-xs">{loggedInMember.institution || '-'}</strong>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">Tempat Lahir:</span>
                                  <span className="text-neutral-800 font-semibold">{loggedInMember.birthPlace || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">Tanggal Lahir:</span>
                                  <span className="text-neutral-800 font-semibold">{loggedInMember.birthDate || '-'}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">Jenis Kelamin:</span>
                                  <span className="text-neutral-800 font-semibold">{loggedInMember.gender}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">Agama:</span>
                                  <span className="text-neutral-800 font-semibold">{loggedInMember.religion}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">No HP / WA:</span>
                                  <span className="text-neutral-800 font-semibold text-brand-gold font-mono">{loggedInMember.phone}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block font-mono text-[9px] uppercase">Pekerjaan:</span>
                                  <span className="text-neutral-800 font-semibold">{loggedInMember.profession || '-'}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-mono text-[9px] uppercase">Alamat Lengkap Rumah:</span>
                                <span className="text-neutral-700 leading-normal block">{loggedInMember.address}</span>
                              </div>
                              <div className="bg-[#a18241]/10 p-2.5 rounded-lg border border-[#a18241]/30">
                                <span className="text-[#a18241] block font-mono text-[9px] uppercase font-bold">Kategori Sesi Dipilih:</span>
                                <span className="text-brand-blue font-bold text-[11px] leading-normal block">{loggedInMember.selectedSession}</span>
                              </div>
                            </div>
                          </div>

                          {/* Certificate Rendering Area */}
                          <div className="md:col-span-2 space-y-4">
                            <div className="border bg-zinc-50 border-neutral-200 rounded-2xl p-5 space-y-4">
                              <h4 className="font-serif text-sm font-bold text-brand-blue border-b pb-2 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-brand-gold shrink-0" />
                                Piagam Sertifikat Kelulusan JATC Anda
                              </h4>

                              {(() => {
                                const matchingSession = sessions.find(s => s.title === loggedInMember.selectedSession);
                                const isSessionCertReleased = matchingSession ? !!matchingSession.isCertificateIssued : false;
                                const isCertReleasedByAdmin = !!loggedInMember.isCertificateApproved || isSessionCertReleased;

                                if (loggedInMember.status === 'Selesai') {
                                  if (isCertReleasedByAdmin) {
                                    return (
                                      <div className="space-y-4">
                                        <p className="text-xs text-green-700 bg-green-50/70 border border-green-200 p-3 rounded-lg leading-relaxed">
                                          Selamat! Drs. Eddy Sudarmadji MM.,MBA selaku founder telah memverifikasi kelayakan kompetensi Anda. Di bawah ini adalah piagam penghargaan resmi digital Anda. Anda dapat langsung melihat dan mendownload/mencetaknya.
                                        </p>

                                        {/* Custom Certificate board overlay */}
                                        {(() => {
                                          const bgStyle = siteConfig.certificate?.backgroundStyle || 'abstract-soft';
                                          let containerClasses = "bg-white border-8 border-double border-[#0b2240]";
                                          let innerGradients = null;

                                          if (bgStyle === 'abstract-soft') {
                                            containerClasses = "bg-gradient-to-br from-slate-50 via-amber-50/25 to-blue-50/70 border-8 border-double border-[#0b2240]";
                                            innerGradients = (
                                              <>
                                                <div className="absolute top-0 left-0 w-36 h-36 bg-[#c5a059]/8 rounded-full filter blur-2xl pointer-events-none" />
                                                <div className="absolute bottom-0 right-0 w-44 h-44 bg-[#0b2240]/5 rounded-full filter blur-3xl pointer-events-none" />
                                                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-100/15 rounded-full filter blur-xl pointer-events-none" />
                                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#a18241]" />
                                                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#a18241]" />
                                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#a18241]" />
                                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#a18241]" />
                                              </>
                                            );
                                          } else if (bgStyle === 'classic-navy') {
                                            containerClasses = "bg-[#fbfbfa] border-[10px] border-solid border-[#0b2240]";
                                            innerGradients = (
                                              <>
                                                <div className="absolute inset-1 border border-[#a18241]" />
                                                <div className="absolute inset-2 border border-[#0b2240]/10" />
                                                <div className="absolute inset-3 border-4 border-double border-[#a18241]/20" />
                                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.08),transparent_45%)] pointer-events-none" />
                                                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#a18241]" />
                                                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#a18241]" />
                                                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#a18241]" />
                                                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#a18241]" />
                                              </>
                                            );
                                          } else if (bgStyle === 'vintage-gold') {
                                            containerClasses = "bg-[#fcfaf5] border-8 border-solid border-[#a18241]";
                                            innerGradients = (
                                              <>
                                                <div className="absolute inset-1 border-[3px] border-double border-[#0b2240] pointer-events-none" />
                                                <div className="absolute inset-3 border border-[#a18241]/40 pointer-events-none" />
                                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.05),transparent_60%)] pointer-events-none" />
                                                <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#a18241] rounded-tl-lg" />
                                                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#a18241] rounded-tr-lg" />
                                                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#a18241] rounded-bl-lg" />
                                                <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#a18241] rounded-br-lg" />
                                              </>
                                            );
                                          } else { // modern-minimalist
                                            containerClasses = "bg-white border-2 border-neutral-300 shadow-lg";
                                            innerGradients = (
                                              <>
                                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0b2240] via-[#a18241] to-[#0b2240] pointer-events-none" />
                                                <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-neutral-200" />
                                                <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-neutral-200" />
                                              </>
                                            );
                                          }

                                          return (
                                            <div
                                              id="certificate-download-card"
                                              className={`${containerClasses} p-6 rounded-xl relative shadow-md overflow-hidden text-center select-text transition-all`}
                                            >
                                              {innerGradients}
                                              <div className="absolute top-1 left-1 right-1 bottom-1 border border-[#a18241]/15 pointer-events-none" />

                                              <div className="space-y-4 relative z-10">
                                                {/* Certificate Header with Left Logo, Center Title, and Right Brand Logo */}
                                                <div className="grid grid-cols-3 gap-2 items-center border-b border-[#a18241]/20 pb-3">
                                                  {/* Left Logo / Standard JATC logotype */}
                                                  <div className="flex justify-start text-left">
                                                    {siteConfig.certificate?.logoUrl ? (
                                                      <img 
                                                        src={siteConfig.certificate.logoUrl} 
                                                        alt="Logo JATC" 
                                                        className="h-11 object-contain max-w-[150px] bg-white/60 p-0.5 rounded" 
                                                      />
                                                    ) : (
                                                      <div className="flex items-center gap-1.5">
                                                        <div className="w-8 h-8 bg-[#0b2240] rounded-full border border-[#a18241] flex items-center justify-center font-serif text-white font-bold text-xs shrink-0 shadow-sm">
                                                          JA
                                                        </div>
                                                        <div>
                                                          <span className="text-[6.5px] font-sans font-bold text-[#a18241] tracking-wider uppercase leading-none block">
                                                            JOHN ANDERSEN
                                                          </span>
                                                          <span className="text-[5.5px] text-gray-400 font-sans block leading-none">
                                                            TRAINING & CONSULTING
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Center title or Badge */}
                                                  <div className="flex flex-col items-center justify-center text-center">
                                                    <span className="font-serif text-[9px] font-bold tracking-widest text-[#a18241] uppercase">
                                                      CERTIFICATE
                                                    </span>
                                                    <div className="w-12 h-[1px] bg-[#a18241] my-0.5" />
                                                    <span className="font-sans text-[5.5px] text-gray-400 uppercase tracking-widest font-bold">
                                                      OF COMPETENCY
                                                    </span>
                                                  </div>

                                                  {/* Right Logo / Partner brand logo if uploaded */}
                                                  <div className="flex justify-end text-right">
                                                    {siteConfig.certificate?.rightLogoUrl ? (
                                                      <img 
                                                        src={siteConfig.certificate.rightLogoUrl} 
                                                        alt="Logo Brand Pendamping" 
                                                        className="h-11 object-contain max-w-[150px] bg-white/60 p-0.5 rounded border border-neutral-100" 
                                                      />
                                                    ) : (
                                                      /* Elegant default seal/crest representation if empty */
                                                      <div className="flex items-center gap-1 opacity-40">
                                                        <div className="w-6 h-6 border border-dashed border-[#a18241] rounded-full flex items-center justify-center">
                                                          <span className="text-[4px] font-mono font-bold text-[#a18241]">JATC</span>
                                                        </div>
                                                        <span className="text-[5px] text-gray-450 font-mono uppercase tracking-wider font-bold">PARTNER</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="space-y-1">
                                                  <p className="text-[10px] italic text-gray-450 font-serif">Sertifikat ini dengan bangga dianugerahkan kepada:</p>
                                                  <h2 className="font-serif text-lg sm:text-2xl font-extrabold text-[#0b2240] tracking-wide border-b border-dashed border-[#a18241]/30 pb-1 max-w-md mx-auto leading-normal">
                                                    {loggedInMember.name}
                                                  </h2>
                                                </div>

                                                <div className="space-y-1 max-w-sm sm:max-w-md mx-auto">
                                                  <p className="text-[10px] text-gray-650 leading-normal">
                                                    Atas partisipasi aktif dan kompetensi luar biasa yang ditunjukkan dalam menyelesaikan asesmen serta pelatihan kelembagaan:
                                                  </p>
                                                  <p className="text-xs font-bold text-brand-blue font-sans italic leading-normal">
                                                    "{loggedInMember.selectedSession}"
                                                  </p>
                                                  <p className="text-[9px] text-gray-500 font-sans leading-relaxed">
                                                    Mencakup penguasaan 16 English Tenses, English Grammar Logic SVO, dan adaptasi 5 Contemporary Teaching Methodologies kontemporer Mr. Eddy Sudarmadji. Dinyatakan berkompeten sebagai instruktur pembantu.
                                                  </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-left items-end mt-2">
                                                  <div className="space-y-1.5 text-left">
                                                    <div>
                                                      <span className="text-[6.5px] font-mono block text-gray-400 uppercase tracking-widest">TANGGAL PENERBITAN:</span>
                                                      <span className="font-sans text-[8.5px] text-gray-700 font-bold block mt-0.5">
                                                        {siteConfig.certificate?.issueDate || '14 Juni 2026'}
                                                      </span>
                                                    </div>
                                                    <div>
                                                      <span className="text-[6.5px] font-mono block text-gray-400 uppercase tracking-widest">NO. REGISTRASI SERTI:</span>
                                                      <span className="font-mono text-[8.5px] text-brand-blue font-bold tracking-wide">
                                                        JATC-REVO-2026-M{10000 + loggedInMember.name.charCodeAt(0) * 117}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-80 pt-1">
                                                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                                      <span className="text-[6px] font-mono uppercase text-gray-400 leading-none">
                                                        <strong className="text-emerald-700 block">STATUS SAH</strong>
                                                        ASLI TERVERIFIKASI
                                                      </span>
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="text-right flex flex-col items-end space-y-1 relative">
                                                    <span className="text-[7px] font-mono block text-gray-400 uppercase tracking-wider">
                                                      MASTER TRAINER & FOUNDER:
                                                    </span>
                                                    
                                                    <div className="h-10 w-32 flex items-center justify-end relative my-0.5">
                                                      {siteConfig.certificate?.signatureUrl ? (
                                                        <img
                                                          src={siteConfig.certificate.signatureUrl}
                                                          alt="Tanda Tangan Trainer"
                                                          className="h-9 max-w-[120px] object-contain relative z-20 pointer-events-none"
                                                        />
                                                      ) : (
                                                        <div className="italic font-serif text-[11px] font-semibold text-brand-blue tracking-wide relative z-20 pr-4 select-none opacity-80 transform rotate-[-2deg]">
                                                          {siteConfig.certificate?.signatureName || 'Drs. Eddy Sudarmadji MM.,MBA'}
                                                        </div>
                                                      )}
                                                      <div className="absolute right-0 bottom-0.5 w-9 h-9 border border-dashed border-[#a18241]/20 rounded-full flex items-center justify-center pointer-events-none z-10 rotate-12">
                                                        <span className="text-[3px] font-mono font-bold text-[#a18241]/30 uppercase text-center leading-none">
                                                          SEAL<br/>JATC
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div className="italic font-serif text-[10px] font-bold text-[#0b2240] border-t border-dashed border-[#a18241]/30 pt-0.5 w-40 text-right">
                                                      {siteConfig.certificate?.signatureName || 'Drs. Eddy Sudarmadji MM.,MBA.'}
                                                    </div>
                                                    <span className="text-[7px] block text-gray-400 font-sans leading-none mt-0.5">
                                                      {siteConfig.certificate?.signatureRole || 'JATC INDONESIA'}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })()}

                                        <div className="flex justify-center">
                                          <button
                                            onClick={() => window.print()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-[#0b2240] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer border border-[#0b2240]"
                                          >
                                            <Printer className="w-3.5 h-3.5" /> Cetak / Download Sertifikat Kompetensi Anda 💾
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="text-center py-6 px-4 bg-amber-50/60 rounded-xl border border-amber-200/50 space-y-3">
                                        <div className="w-10 h-10 bg-amber-100/75 rounded-full flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                                          <Award className="w-5 h-5 text-amber-650" />
                                        </div>
                                        <h5 className="font-serif font-bold text-amber-800 text-xs text-center">Status Pendaftaran: DISETUJUI & LULUS ✅</h5>
                                        <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed text-center">
                                          Selamat <strong>{loggedInMember.name}</strong>! Pendaftaran dan partisipasi Anda telah disetujui. Namun, piagam penghargaan/sertifikat digital untuk sesi <strong>"{loggedInMember.selectedSession}"</strong> belum ditandai terbit oleh Administrator JATC.
                                        </p>
                                        <div className="p-3 bg-white rounded-lg border border-neutral-150 inline-block text-left max-w-sm">
                                          <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                                            ℹ️ <strong>Catatan Admin:</strong> Sertifikat digital resmi Anda akan otomatis rilis dan muncul di menu ini setelah asisten/administrator mencontreng pilihan <em>"Terbitkan Sertifikat"</em> pada pengaturan sesi/webinar Anda.
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }
                                } else if (loggedInMember.status === 'Ditolak') {
                                  return (
                                    <div className="text-center py-8 px-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
                                      <span className="text-2xl">❌</span>
                                      <h5 className="font-serif font-bold text-red-800 text-xs">Pendaftaran Sertifikasi Ditolak</h5>
                                      <p className="text-[11px] text-gray-600 max-w-sm mx-auto leading-relaxed">
                                        Mohon maaf, status keanggotaan/sertifikasi Anda ditolak setelah peninjauan administrasi. Sila hubungi Administrator WhatsApp untuk memverifikasi biodata atau melengkapi uji kelayakan.
                                      </p>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="text-center py-8 px-4 bg-amber-50 rounded-xl border border-amber-200/60 space-y-2">
                                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                                        <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                                      </div>
                                      <h5 className="font-serif font-bold text-amber-800 text-xs">Sertifikat Anda Sedang Diproses (Antrean Verifikasi JATC)</h5>
                                      <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed">
                                        Halo <strong>{loggedInMember.name}</strong>, nama Anda saat ini berada dalam antrean peninjauan oleh Master Trainer JATC. Verifikasi keaktifan uji materi LMS dan pendaftaran Anda biasanya memerlukan waktu <strong>kurang dari 24-48 jam</strong>.
                                      </p>
                                      <p className="text-[10px] text-gray-400 italic">
                                        *Pemberitahuan otomatis akan dikirim ke WhatsApp Anda setelah status sertifikasi disetujui.
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {memberSubTab === 'lms' && (
                      <motion.div
                        key="lms-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="border bg-zinc-50 border-neutral-200 rounded-2xl p-2.5 sm:p-5">
                          <LMSPortal isLoggedIn={true} />
                        </div>
                      </motion.div>
                    )}

                    {memberSubTab === 'webinar' && (
                      <motion.div
                        key="webinar-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="border bg-zinc-50 border-neutral-200 rounded-2xl p-5 space-y-5">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="font-serif text-sm font-bold text-brand-blue">Daftar Jadwal Webinar & Kelas Sesi Live</h4>
                              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Informasi kelas webinar tatap muka digital interaktif yang tersinkronisasi langsung dari kalender pusat JATC Indonesia.</p>
                            </div>
                            <span className="px-2 py-0.5 bg-[#0b2240]/5 rounded text-[8px] font-bold font-mono text-[#0b2240]">UPDATED: TODAY</span>
                          </div>

                          {(() => {
                            const mainChosenSession = sessions.find(
                              sec => sec.title === loggedInMember.selectedSession && !sec.isWebinarSequence
                            );
                            const otherPrimarySessions = sessions.filter(
                              sec => !sec.isWebinarSequence && sec.title !== loggedInMember.selectedSession
                            );
                            const sequenceWebinarSessions = sessions.filter(
                              sec => !!sec.isWebinarSequence
                            );

                            return (
                              <div className="space-y-6">
                                {/* Sesi Utama Pilihan Pendaftaran */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-serif text-xs uppercase font-bold text-[#0b2240] tracking-wide flex items-center gap-1.5 bg-[#0b2240]/5 p-2 rounded-lg border">
                                      <span className="bg-[#0b2240] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">✓</span>
                                      <span>Sesi Utama Pilihan Pendaftaran Anda (Terdaftar Resmi)</span>
                                    </h4>
                                  </div>

                                  {mainChosenSession ? (
                                    <div className="bg-amber-50/40 p-5 rounded-2xl border-2 border-[#a18241]/70 hover:border-[#a18241] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                      <div className="space-y-2 text-left">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full font-mono uppercase">
                                            ● Terdaftar Aktif Sesuai Pilihan Anda
                                          </span>
                                          <span className="text-[10px] text-gray-500 font-mono font-semibold">🕒 {mainChosenSession.dateTime}</span>
                                        </div>
                                        <h5 className="font-serif text-sm font-bold text-brand-blue leading-normal">{mainChosenSession.title}</h5>
                                        <p className="text-[11px] text-gray-500">
                                          Master Trainer: <strong className="text-[#a18241]">{mainChosenSession.instructor}</strong> • Status: 
                                          <span className={`ml-1 font-bold ${mainChosenSession.status === 'Aktif' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {mainChosenSession.status || 'Aktif'}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="shrink-0 w-full md:w-auto flex items-center gap-2 pt-2 md:pt-0">
                                        <a
                                          href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Halo%20Admin%20JATC,%20saya%20anggota%20terdaftar%20${encodeURIComponent(loggedInMember.name)}.%20Bisa%20saya%20minta%20link%20gabung%20kelas%20utama%20saya:%20${encodeURIComponent(mainChosenSession.title)}?`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-4 py-2 bg-[#0b2240] text-white rounded-lg font-sans text-xs font-bold hover:bg-[#a18241] hover:text-white transition-all flex items-center justify-center gap-1.5 w-full md:w-auto shadow-md"
                                        >
                                          Mulai / Gabung Sesi Utama <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-amber-50/10 p-5 rounded-2xl border border-dashed border-amber-300 space-y-2 text-left">
                                      <p className="text-xs font-bold text-amber-800">
                                        ⚠️ Sesi Utama Anda: "{loggedInMember.selectedSession}"
                                      </p>
                                      <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Jadwal pendaftaran sesi ini sedang diperbarui atau dipindahkan oleh Admin. Anda tetap merupakan pendaftar resmi di program JATC Indonesia. Anda dapat berkoordinasi langsung dengan Tim Admin untuk link interaktif.
                                      </p>
                                      <a
                                        href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Halo%20Admin%20JATC,%20saya%20anggota%20terdaftar%20atas%20nama%20${encodeURIComponent(loggedInMember.name)}.%20Bisa%20bantu%20konfirmasi%20jadwal%20akses%20webinar%20pembelajaran%20saya?`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a18241] underline hover:text-[#0b2240]"
                                      >
                                        Hubungi Asisten Admin via Whatsapp <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Jadwal Alternatif Sesi Utama Lainnya */}
                                {otherPrimarySessions.length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block text-left">Grup & Jadwal Sesi Utama Lainnya:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-90 transition-opacity">
                                      {otherPrimarySessions.map(sec => (
                                        <div key={sec.id} className="bg-white p-3 rounded-xl border border-neutral-200 hover:border-[#a18241]/20 transition-all flex flex-col justify-between space-y-2 text-left">
                                          <div>
                                            <div className="flex justify-between items-center text-[9px] text-gray-400">
                                              <span>{sec.dateTime}</span>
                                              <span className="text-neutral-400 font-mono font-bold uppercase shrink-0">Kelas Paralel</span>
                                            </div>
                                            <h6 className="font-semibold text-neutral-700 text-xs mt-0.5 line-clamp-1">{sec.title}</h6>
                                          </div>
                                          <div className="text-[9px] flex justify-between items-center text-gray-500 border-t pt-1.5">
                                            <span>Instruktur: {sec.instructor}</span>
                                            <a
                                              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Halo%20Admin%20JATC,%20saya%20anggota%20terdaftar%20${encodeURIComponent(loggedInMember.name)}.%20Saya%20ingin%20pindah%20jadwal%20dari%20${encodeURIComponent(loggedInMember.selectedSession)}%20ke%20grup%20sesi%20${encodeURIComponent(sec.title)}%20bisa?`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-brand-blue font-bold hover:underline shrink-0"
                                            >
                                              Minta Pindah Sesi
                                            </a>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Sesi Lanjutan Section */}
                                <div className="border-t pt-4 space-y-3">
                                  <div className="text-left">
                                    <h4 className="font-serif text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <span>📅 Jadwal Sesi Lanjutan Mandiri (Roadmap Sesi ke-2, ke-3, ke-4, dst)</span>
                                    </h4>
                                    <p className="text-[10px] text-gray-450 font-sans mt-0.5">
                                      Rangkaian kelanjutan sesi belajar aktif mandiri interaktif Anda setelah menyelesaika Sesi Utama. Terjadwal secara seri di bawah ini:
                                    </p>
                                  </div>

                                  {sequenceWebinarSessions.length === 0 ? (
                                    <div className="p-4 bg-zinc-100 rounded-xl border border-dashed text-center text-xs text-gray-400 italic">
                                      Belum ada Jadwal Sesi Lanjutan (Webinar ke-2, ke-3, dst) yang dijadwalkan oleh Administrator JATC.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                      {sequenceWebinarSessions.map(sec => (
                                        <div key={sec.id} className="bg-amber-50/20 p-4 rounded-xl border border-amber-200 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-3">
                                          <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[8px] font-mono font-bold uppercase shrink-0">
                                                ★ {sec.webinarSequenceLabel || 'Webinar ke-2'}
                                              </span>
                                              <span className="text-[10px] text-amber-700 font-mono font-semibold">{sec.dateTime}</span>
                                            </div>
                                            <h5 className="font-serif text-xs font-bold text-brand-blue leading-normal select-all">{sec.title}</h5>
                                            <p className="text-[10px] text-gray-500">Instructor: <strong className="text-amber-800">{sec.instructor}</strong></p>
                                          </div>

                                          <div className="pt-2 border-t border-dashed border-neutral-100 flex justify-between items-center text-[10px]">
                                            <span className="text-gray-400 font-sans">Akses Google Meet / Zoom</span>
                                            {sec.status === 'Aktif' ? (
                                              <a
                                                href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Halo%20Admin%20JATC,%20saya%20anggota%20terdaftar%20${encodeURIComponent(loggedInMember.name)}.%20Saya%20ingin%2520minta%20link%20gabung%20untuk%20${encodeURIComponent(sec.webinarSequenceLabel || 'Sesi Lanjutan')}%20-%20${encodeURIComponent(sec.title)}?`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 bg-amber-600 text-white hover:bg-amber-700 rounded font-sans text-[9px] font-bold transition-colors flex items-center gap-1 shrink-0"
                                              >
                                                Masuk Kelas <ExternalLink className="w-2.5 h-2.5" />
                                              </a>
                                            ) : (
                                              <span className="text-gray-400 font-bold italic">Selesai / Ditutup</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-[#0b2240] leading-relaxed flex items-start gap-2 font-sans text-left">
                            <span className="text-base select-none shrink-0">📢</span>
                            <div className="space-y-1">
                              <strong className="block">Webinar & Broadcast Pointers:</strong>
                              <p className="text-gray-600">
                                Link interaktif dan update harian dibagikan langsung secara simultan melalui <strong>grup WhatsApp Mitra JATC Indonesia</strong>. Harap selalu memeriksa notifikasi WhatsApp Anda atau berkoordinasi langsung dengan asisten lembaga.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer Log Out action */}
                  <div className="pt-4 border-t flex justify-end">
                    <button
                      onClick={handleMemberLogout}
                      className="px-4 py-2 bg-red-50 hover:bg-red-150/80 text-red-700 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer border border-red-100"
                    >
                      Keluar Akun (Log Out)
                    </button>
                  </div>
                </div>
              ) : isAdminLoggedIn ? (
                // ADMIN PANEL
                <AdminPanel
                  siteConfig={siteConfig}
                  setSiteConfig={handleSiteConfigChange}
                  members={members}
                  setMembers={handleMembersChange}
                  sessions={sessions}
                  setSessions={handleSessionsChange}
                  articles={articles}
                  setArticles={handleArticlesChange}
                  gallery={gallery}
                  setGallery={handleGalleryChange}
                  onResetToDefaults={handleResetToDefaults}
                  onLogout={() => setIsAdminLoggedIn(false)}
                  lmsModules={lmsModules}
                  setLmsModules={handleLmsModulesChange}
                />
              ) : (
                // DUAL LOGIN FORMS
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-[#0b2240]">
                  {/* MEMBER LOGIN FORM */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-sm text-left">
                    <div className="text-center space-y-1 pb-2 border-b">
                      <LogIn className="w-6 h-6 text-[#0b2240] mx-auto animate-pulse" />
                      <h4 className="font-serif text-lg font-bold text-[#0b2240]">Login Anggota Kelas</h4>
                      <p className="text-[10px] text-gray-400 font-sans leading-normal">
                        Masuk untuk mengakses materi penuh LMS, Informasi Webinar dan melihat/download sertifikasi kelulusan Anda.
                      </p>
                    </div>

                    {memberLoginError && (
                      <div className="bg-amber-50 text-amber-950 border border-amber-200 rounded-lg p-2.5 text-[10px] font-sans font-semibold">
                        {memberLoginError}
                      </div>
                    )}

                    <form onSubmit={handleMemberLoginSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Email Terdaftar:</label>
                        <input
                          type="email"
                          required
                          value={memberEmailInput}
                          onChange={(e) => setMemberEmailInput(e.target.value)}
                          placeholder="e.g. mohammad@example.com"
                          className="w-full rounded border p-2 text-xs outline-none focus:border-[#a18241] font-sans focus:bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Password Akun:</label>
                        <input
                          type="password"
                          required
                          value={memberPasswordInput}
                          onChange={(e) => setMemberPasswordInput(e.target.value)}
                          placeholder="Masukkan password Anda"
                          className="w-full rounded border p-2 text-xs outline-none focus:border-[#a18241] font-sans focus:bg-neutral-50/50"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#0b2240] hover:bg-[#0b2240]/90 text-white font-bold py-2.5 rounded-lg text-xs font-sans cursor-pointer transition-all"
                      >
                        Masuk LMS & Sertifikasi
                      </button>
                    </form>
                    <div className="text-[9px] text-gray-400 font-sans leading-snug">
                      *Belum terdaftar? Sila lakukan pendaftaran pendaftar baru melalui menu <strong>Pendaftaran</strong> secara gratis.
                    </div>
                  </div>

                  {/* ADMIN LOGIN FORM */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-sm text-left">
                    <div className="text-center space-y-1 pb-2 border-b">
                      <Lock className="w-6 h-6 text-[#a18241] mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-[#0b2240]">Login Administrator</h4>
                      <p className="text-[10px] text-gray-400 font-sans leading-normal">
                        Khusus akses admin untuk mengurus persetujuan sertifikat, mengedit profil lembaga, dsb.
                      </p>
                    </div>

                    {adminLoginError && (
                      <div className="bg-red-50 text-red-950 border border-red-200 rounded-lg p-2.5 text-[10px] font-sans font-semibold">
                        {adminLoginError}
                      </div>
                    )}

                    <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Username Admin:</label>
                        <input
                          type="text"
                          required
                          value={adminUsernameInput}
                          onChange={(e) => setAdminUsernameInput(e.target.value)}
                          placeholder="e.g. admin"
                          className="w-full rounded border p-2 text-xs outline-none focus:border-[#a18241] font-sans focus:bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Password Admin:</label>
                        <input
                          type="password"
                          required
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="e.g. admin"
                          className="w-full rounded border p-2 text-xs outline-none focus:border-[#a18241] font-sans focus:bg-neutral-50/50"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#a18241] hover:bg-[#a18241]/90 text-white font-bold py-2.5 rounded-lg text-xs font-sans cursor-pointer transition-all"
                      >
                        Masuk Kontrol Panel Admin
                      </button>
                    </form>
                    <div className="text-[9px] text-gray-400 font-sans leading-snug">
                      *Akses terbatas hanya untuk Petugas & Koordinator John Andersen Indonesia. (Gunakan admin / admin)
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Area with legal and operational tags */}
      <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 pt-10 pb-6 mt-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Logo showText={true} className="h-10" textColor="text-white" subTextColor="text-gray-400" />
            <p className="text-xs text-neutral-400 leading-relaxed font-sans mt-2">
              Transforming English Rote Training into Systematic Grammar Logic and Emotional Self-Confidence inside Indonesia.
            </p>
          </div>

          <div className="space-y-3 text-xs leading-normal font-sans">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">Pragmatic Portals</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveTab('beranda')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">Landing Utama</button>
              <button onClick={() => setActiveTab('tentang')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">Tentang Trainer</button>
              <button onClick={() => setActiveTab('tenses')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">16 Tenses Hub</button>
              {(siteConfig.showLmsAndLive ?? true) && (
                <button onClick={() => setActiveTab('lms')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">Materi LMS</button>
              )}
              <button onClick={() => setActiveTab('berita')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">Forum & Tips</button>
              <button onClick={() => setActiveTab('pendaftaran')} className="text-left text-neutral-400 hover:text-white transition-colors cursor-pointer">Daftar Anggota</button>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-normal font-sans">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#c5a059]" /> Kantor JATC 
            </h4>
            <div className="space-y-2 text-neutral-400 font-sans">
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>{siteConfig.contact.officeAddress}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                <a href={`https://wa.me/${siteConfig.contact.whatsappNumber}`} className="hover:underline font-bold text-brand-gold">+{siteConfig.contact.whatsappNumber}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-800 mt-8 pt-4 text-center text-[10px] text-neutral-500 font-mono">
          <p>© 2026 JOHN ANDERSEN TRAINING AND CONSULTING INDONESIA. Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL. All Rights Reserved. </p>
          <p className="mt-1">Surat Ijin Usaha Perdagangan (SIUP) Nomor : 510/1-BF46/BPPT, Bandung : 03 November 2014</p>
        </div>
      </footer>
    </div>
  );
}
