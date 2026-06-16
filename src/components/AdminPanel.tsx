import React, { useState, useEffect } from 'react';
import { SiteConfig, Member, LearningSession, Article, GalleryItem, LMSModule, TargetParticipantConfig, JatcHistoryItem } from '../types';
import {
  Settings, Users, Calendar, BookOpen, VolumeX, CheckCircle, XCircle, Trash2, Edit3, Edit, Plus, X,
  Save, RefreshCw, LogOut, Lock, Download, Printer, Layers, Info, Check, Image, Video,
  Globe, Briefcase, Sparkles, GraduationCap, Heart, Bookmark, Activity, HelpCircle,
  Sliders, Eye, Building
} from 'lucide-react';

interface AdminPanelProps {
  siteConfig: SiteConfig;
  setSiteConfig: (config: SiteConfig) => void;
  members: Member[];
  setMembers: (m: Member[]) => void;
  sessions: LearningSession[];
  setSessions: (s: LearningSession[]) => void;
  articles: Article[];
  setArticles: (a: Article[]) => void;
  gallery: GalleryItem[];
  setGallery: (g: GalleryItem[]) => void;
  onResetToDefaults: () => void;
  onLogout?: () => void;
  lmsModules?: LMSModule[];
  setLmsModules?: (m: LMSModule[]) => void;
}

// Helper function to compress images using HTML5 Canvas to prevent exceeding Firestore 1MB document limit
export function compressImage(file: File, maxWidth = 1200, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string); // Fallback to original Base64 on load error
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPanel({
  siteConfig,
  setSiteConfig,
  members,
  setMembers,
  sessions,
  setSessions,
  articles,
  setArticles,
  gallery,
  setGallery,
  onResetToDefaults,
  onLogout,
  lmsModules = [],
  setLmsModules = () => {}
}: AdminPanelProps) {
  // Authentication states
  const [isLogged, setIsLogged] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMessage, setErrMessage] = useState('');

  // Tab Manager
  const [subTab, setSubTab] = useState<'content' | 'members' | 'sessions' | 'articles' | 'gallery' | 'lms'>('content');

  // Edit fields states
  const [companyName, setCompanyName] = useState(siteConfig.hero.companyName);
  const [tagline, setTagline] = useState(siteConfig.hero.tagline);
  const [subtitle, setSubtitle] = useState(siteConfig.hero.subtitle);
  const [trainerName, setTrainerName] = useState(siteConfig.hero.trainerName);
  const [trainerTitle, setTrainerTitle] = useState(siteConfig.hero.trainerTitle);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(siteConfig.hero.backgroundImageUrl || '');
  const [backgroundImageUrl2, setBackgroundImageUrl2] = useState(siteConfig.hero.backgroundImageUrl2 || '');
  const [backgroundImageUrl3, setBackgroundImageUrl3] = useState(siteConfig.hero.backgroundImageUrl3 || '');
  const [backgroundImageUrl4, setBackgroundImageUrl4] = useState(siteConfig.hero.backgroundImageUrl4 || '');
  const [profileText, setProfileText] = useState(siteConfig.about.profile);
  const [visionText, setVisionText] = useState(siteConfig.about.vision);
  const [officeAddress, setOfficeAddress] = useState(siteConfig.contact.officeAddress);
  const [whatsappNumber, setWhatsappNumber] = useState(siteConfig.contact.whatsappNumber);
  const [operationalHours, setOperationalHours] = useState(siteConfig.contact.operationalHours);

  const [webinarSeriesTitle, setWebinarSeriesTitle] = useState(siteConfig.hero.webinarSeriesTitle || '');
  const [webinarDuration, setWebinarDuration] = useState(siteConfig.hero.webinarDuration || '');
  const [certificateNote, setCertificateNote] = useState(siteConfig.hero.certificateNote || '');
  const [webinarParts, setWebinarParts] = useState(siteConfig.hero.webinarParts || []);

  const [importanceReasons, setImportanceReasons] = useState(siteConfig.importanceReasons || []);
  const [failureReasons, setFailureReasons] = useState(siteConfig.failureReasons || []);
  const [learningGoals, setLearningGoals] = useState(siteConfig.learningGoals || []);
  const [learningGoalsSubtitle, setLearningGoalsSubtitle] = useState(siteConfig.learningGoalsSubtitle || '');
  const [learningGoalsArrowUrl, setLearningGoalsArrowUrl] = useState(siteConfig.learningGoalsArrowUrl || '/tribal_arrow.jpg');
  const [methodologies, setMethodologies] = useState(siteConfig.methodologies || []);
  const [showLmsAndLive, setShowLmsAndLive] = useState(siteConfig.showLmsAndLive ?? true);
  const [targetParticipants, setTargetParticipants] = useState(siteConfig.targetParticipants || []);
  const [institutions, setInstitutions] = useState(siteConfig.institutions || []);

  // Inline edit state toggles
  const [editingHistId, setEditingHistId] = useState<string | null>(null);
  const [editingTpId, setEditingTpId] = useState<string | null>(null);
  const [editingInstId, setEditingInstId] = useState<string | null>(null);

  // Sandboxed confirmation trackers (Bypass native confirm blocks)
  const [deleteConfirmHistId, setDeleteConfirmHistId] = useState<string | null>(null);
  const [deleteConfirmTpId, setDeleteConfirmTpId] = useState<string | null>(null);
  const [deleteConfirmInstId, setDeleteConfirmInstId] = useState<string | null>(null);

  const [historyList, setHistoryList] = useState<JatcHistoryItem[]>(siteConfig.about.history || []);
  const [newHistTitle, setNewHistTitle] = useState('');
  const [newHistYear, setNewHistYear] = useState('');
  const [newHistDesc, setNewHistDesc] = useState('');
  const [newHistImg, setNewHistImg] = useState('');

  // Sync state if siteConfig changes (especially on reset to defaults)
  useEffect(() => {
    setCompanyName(siteConfig.hero.companyName);
    setTagline(siteConfig.hero.tagline);
    setSubtitle(siteConfig.hero.subtitle);
    setTrainerName(siteConfig.hero.trainerName);
    setTrainerTitle(siteConfig.hero.trainerTitle);
    setBackgroundImageUrl(siteConfig.hero.backgroundImageUrl || '');
    setBackgroundImageUrl2(siteConfig.hero.backgroundImageUrl2 || '');
    setBackgroundImageUrl3(siteConfig.hero.backgroundImageUrl3 || '');
    setBackgroundImageUrl4(siteConfig.hero.backgroundImageUrl4 || '');
    setProfileText(siteConfig.about.profile);
    setVisionText(siteConfig.about.vision);
    setOfficeAddress(siteConfig.contact.officeAddress);
    setWhatsappNumber(siteConfig.contact.whatsappNumber);
    setOperationalHours(siteConfig.contact.operationalHours);
    setCertSignName(siteConfig.certificate?.signatureName || 'Drs. Eddy Sudarmadji MM.,MBA');
    setCertSignRole(siteConfig.certificate?.signatureRole || 'Lead Master Trainer & Founder JATC');
    setCertBgStyle(siteConfig.certificate?.backgroundStyle || 'abstract-soft');
    setCertLogoUrl(siteConfig.certificate?.logoUrl || '');
    setCertRightLogoUrl(siteConfig.certificate?.rightLogoUrl || '');
    setCertSignUrl(siteConfig.certificate?.signatureUrl || '');
    setCertIssueDate(siteConfig.certificate?.issueDate || '14 Juni 2026');
    setWebinarSeriesTitle(siteConfig.hero.webinarSeriesTitle || '');
    setWebinarDuration(siteConfig.hero.webinarDuration || '');
    setCertificateNote(siteConfig.hero.certificateNote || '');
    setWebinarParts(siteConfig.hero.webinarParts || []);
    setImportanceReasons(siteConfig.importanceReasons || []);
    setFailureReasons(siteConfig.failureReasons || []);
    setLearningGoals(siteConfig.learningGoals || []);
    setLearningGoalsSubtitle(siteConfig.learningGoalsSubtitle || '');
    setLearningGoalsArrowUrl(siteConfig.learningGoalsArrowUrl || '/tribal_arrow.jpg');
    setMethodologies(siteConfig.methodologies || []);
    setShowLmsAndLive(siteConfig.showLmsAndLive ?? true);
    setTargetParticipants(siteConfig.targetParticipants || []);
    setInstitutions(siteConfig.institutions || []);
    setHistoryList(siteConfig.about.history || []);
  }, [siteConfig]);

  // Certificate Settings states
  const [certSignName, setCertSignName] = useState(siteConfig.certificate?.signatureName || 'Drs. Eddy Sudarmadji MM.,MBA');
  const [certSignRole, setCertSignRole] = useState(siteConfig.certificate?.signatureRole || 'Lead Master Trainer & Founder JATC');
  const [certBgStyle, setCertBgStyle] = useState(siteConfig.certificate?.backgroundStyle || 'abstract-soft');
  const [certLogoUrl, setCertLogoUrl] = useState(siteConfig.certificate?.logoUrl || '');
  const [certRightLogoUrl, setCertRightLogoUrl] = useState(siteConfig.certificate?.rightLogoUrl || '');
  const [certSignUrl, setCertSignUrl] = useState(siteConfig.certificate?.signatureUrl || '');
  const [certIssueDate, setCertIssueDate] = useState(siteConfig.certificate?.issueDate || '14 Juni 2026');

  // New Article Form
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtCategory, setNewArtCategory] = useState('Pola Pikir');
  const [newArtDesc, setNewArtDesc] = useState('');
  const [newArtContent, setNewArtContent] = useState('');
  const [newArtImgUrl, setNewArtImgUrl] = useState('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop');
  const [newArtExternalUrl, setNewArtExternalUrl] = useState('');

  // Editing state for Articles
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // New session Form
  const [newSessTitle, setNewSessTitle] = useState('');
  const [newSessTime, setNewSessTime] = useState('');
  const [newSessInstructor, setNewSessInstructor] = useState('Drs. Eddy Sudarmadji');
  const [newSessIsCertIssued, setNewSessIsCertIssued] = useState(false);
  const [newSessIsWebinarSeq, setNewSessIsWebinarSeq] = useState(false);
  const [newSessWebinarSeqLabel, setNewSessWebinarSeqLabel] = useState('Webinar ke-2');

  // Editing state for Sessions
  const [editingSession, setEditingSession] = useState<LearningSession | null>(null);

  // New Gallery item
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalImgUrl, setNewGalImgUrl] = useState('');
  const [newGalCat, setNewGalCat] = useState<'Pelatihan' | 'Sertifikasi' | 'Seminar' | 'Dokumentasi' | 'ZOOM'>('Pelatihan');
  const [newGalExternalUrl, setNewGalExternalUrl] = useState('');
  const [newGalVideoUrl, setNewGalVideoUrl] = useState('');

  // Editing state for Gallery Item
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);

  // Member management filter and editing states
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('Semua Sesi');
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // LMS management states
  const [editingLMS, setEditingLMS] = useState<LMSModule | null>(null);
  const [newLmsTitle, setNewLmsTitle] = useState('');
  const [newLmsType, setNewLmsType] = useState<'pdf' | 'video' | 'audio' | 'link'>('pdf');
  const [newLmsDuration, setNewLmsDuration] = useState('');
  const [newLmsCat, setNewLmsCat] = useState('');
  const [newLmsDesc, setNewLmsDesc] = useState('');
  const [newLmsGoal, setNewLmsGoal] = useState('Goal #1 s/d #7');
  const [newLmsFileUrl, setNewLmsFileUrl] = useState('');

  // Handle Mock Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'admin') {
      setIsLogged(true);
      setErrMessage('');
    } else {
      setErrMessage('Kombinasi Username dan Password Admin Salah (Gunakan admin / admin)');
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUsername('');
    setPassword('');
    if (onLogout) {
      onLogout();
    }
  };

  // Add direct handlers for webinar parts
  const handleAddWebinarPart = () => {
    const nextNum = webinarParts.length + 1;
    const partWords = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    const word = nextNum <= partWords.length ? partWords[nextNum - 1] : `${nextNum}`;
    const newPart = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      part: `Part ${word}`,
      title: 'Materi Webinar Baru'
    };
    setWebinarParts([...webinarParts, newPart]);
  };

  const handleUpdateWebinarPartField = (id: string, field: 'part' | 'title', value: string) => {
    setWebinarParts(webinarParts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteWebinarPart = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus bagian webinar ini?')) {
      setWebinarParts(webinarParts.filter(p => p.id !== id));
    }
  };

  // Modern Era: Importance Reasons handlers
  const handleAddImportanceReason = () => {
    const newReason = {
      id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: 'Poin Analisis Baru',
      description: 'Deskripsi alasan mengapa poin ini penting untuk dikuasai di era modern saat ini.',
      iconName: 'Globe'
    };
    setImportanceReasons([...importanceReasons, newReason]);
  };

  const handleUpdateImportanceReason = (id: string, field: 'title' | 'description' | 'iconName', value: string) => {
    setImportanceReasons(importanceReasons.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteImportanceReason = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus poin penting ini?')) {
      setImportanceReasons(importanceReasons.filter(r => r.id !== id));
    }
  };

  // Failure Reasons handlers
  const handleAddFailureReason = () => {
    const newFail = {
      id: `fail-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: 'Kendala / Hambatan Baru',
      description: 'Rincian mengapa pembelajaran seringkali mengalami hambatan atau kegagalan saat mencoba menguasai bahasa Inggris.'
    };
    setFailureReasons([...failureReasons, newFail]);
  };

  const handleUpdateFailureReason = (id: string, field: 'title' | 'description', value: string) => {
    setFailureReasons(failureReasons.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleDeleteFailureReason = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alasan kegagalan ini?')) {
      setFailureReasons(failureReasons.filter(f => f.id !== id));
    }
  };

  // Learning Goals handlers
  const handleAddLearningGoal = () => {
    const nextNum = learningGoals.length + 1;
    const newGoal = {
      id: `lg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: nextNum,
      goal: 'Sasaran baru yang ingin dicapai dalam kurikulum JATC',
      goalId: `goal-${nextNum}`
    };
    setLearningGoals([...learningGoals, newGoal]);
  };

  const handleUpdateLearningGoal = (id: string, field: 'number' | 'goal' | 'goalId', value: any) => {
    setLearningGoals(learningGoals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleDeleteLearningGoal = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sasaran pembelajaran ini?')) {
      const filtered = learningGoals.filter(g => g.id !== id);
      const reindexed = filtered.map((g, idx) => ({
        ...g,
        number: idx + 1,
        goalId: `goal-${idx + 1}`
      }));
      setLearningGoals(reindexed);
    }
  };

  // Methodologies handlers
  const handleAddMethodology = () => {
    const newMeth = {
      id: `meth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: 'METHODOLOGY APPROACH',
      subtitle: 'Pendekatan Metode Baru',
      description: 'Penjelasan rinci mengenai metodologi baru JATC yang interaktif dan efektif.',
      forWho: 'Pembelajaran / semua pembelajar yang membutuhkan akselerasi kemampuan.',
      iconName: ''
    };
    setMethodologies([...methodologies, newMeth]);
  };

  const handleUpdateMethodology = (id: string, field: 'title' | 'subtitle' | 'description' | 'forWho', value: string) => {
    setMethodologies(methodologies.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDeleteMethodology = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus metodologi pengajaran ini?')) {
      setMethodologies(methodologies.filter(m => m.id !== id));
    }
  };

  // Target Participants handlers
  const handleAddTargetParticipant = () => {
    const newTp = {
      id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: "Sasaran target peserta baru...",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=150&auto=format&fit=crop"
    };
    const newList = [...targetParticipants, newTp];
    setTargetParticipants(newList);
    setSiteConfig({
      ...siteConfig,
      targetParticipants: newList
    });
    setEditingTpId(newTp.id); // Open edit mode instantly for the new item!
  };

  const handleUpdateTargetParticipantText = (id: string, text: string) => {
    const newList = targetParticipants.map(tp => tp && typeof tp === 'object' && 'id' in tp ? (tp.id === id ? { ...tp, text } : tp) : { id: `tp-${Math.random()}`, text: String(tp) });
    setTargetParticipants(newList);
    setSiteConfig({
      ...siteConfig,
      targetParticipants: newList
    });
  };

  const handleUpdateTargetParticipantImage = (id: string, imageUrl: string) => {
    const newList = targetParticipants.map(tp => tp && typeof tp === 'object' && 'id' in tp ? (tp.id === id ? { ...tp, imageUrl } : tp) : { id: `tp-${Math.random()}`, text: String(tp) });
    setTargetParticipants(newList);
    setSiteConfig({
      ...siteConfig,
      targetParticipants: newList
    });
  };

  const handleDeleteTargetParticipant = (id: string) => {
    const newList = targetParticipants.filter(tp => tp && typeof tp === 'object' && 'id' in tp && tp.id !== id);
    setTargetParticipants(newList);
    setSiteConfig({
      ...siteConfig,
      targetParticipants: newList
    });
    if (editingTpId === id) setEditingTpId(null);
  };

  const handleTargetParticipantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 800, 600, 0.75);
    const newList = targetParticipants.map(tp => tp && typeof tp === 'object' && 'id' in tp ? (tp.id === id ? { ...tp, imageUrl: result } : tp) : { id: `tp-${Math.random()}`, text: String(tp) });
    setTargetParticipants(newList);
    setSiteConfig({
      ...siteConfig,
      targetParticipants: newList
    });
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 1600, 1000, 0.7);
    setBackgroundImageUrl(result);
  };

  const handleHeroBgUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 1600, 1000, 0.7);
    setBackgroundImageUrl2(result);
  };

  const handleHeroBgUpload3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 1600, 1000, 0.7);
    setBackgroundImageUrl3(result);
  };

  const handleHeroBgUpload4 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 1600, 1000, 0.7);
    setBackgroundImageUrl4(result);
  };

  // Institutions handlers
  const handleAddInstitution = () => {
    const newInst = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: 'Nama Lembaga / Instansi Baru',
      logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop'
    };
    const newList = [...institutions, newInst];
    setInstitutions(newList);
    setSiteConfig({
      ...siteConfig,
      institutions: newList
    });
    setEditingInstId(newInst.id); // Open edit mode instantly for the new institution!
  };

  const handleUpdateInstitutionName = (id: string, name: string) => {
    const newList = institutions.map(inst => inst.id === id ? { ...inst, name } : inst);
    setInstitutions(newList);
    setSiteConfig({
      ...siteConfig,
      institutions: newList
    });
  };

  const handleUpdateInstitutionLogo = (id: string, logoUrl: string) => {
    const newList = institutions.map(inst => inst.id === id ? { ...inst, logoUrl } : inst);
    setInstitutions(newList);
    setSiteConfig({
      ...siteConfig,
      institutions: newList
    });
  };

  const handleDeleteInstitution = (id: string) => {
    const newList = institutions.filter(inst => inst.id !== id);
    setInstitutions(newList);
    setSiteConfig({
      ...siteConfig,
      institutions: newList
    });
    if (editingInstId === id) setEditingInstId(null);
  };

  // History handlers
  const handleAddHistoryItem = () => {
    if (!newHistTitle.trim() || !newHistImg.trim()) {
      alert("Mohon isi judul dan lampirkan foto/URL foto untuk mendokumentasikan sejarah baru.");
      return;
    }
    const newItem: JatcHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newHistTitle.trim(),
      year: newHistYear.trim() || new Date().getFullYear().toString(),
      description: newHistDesc.trim(),
      imageUrl: newHistImg.trim()
    };
    const newList = [...historyList, newItem];
    setHistoryList(newList);
    setSiteConfig({
      ...siteConfig,
      about: {
        ...siteConfig.about,
        history: newList
      }
    });
    setNewHistTitle('');
    setNewHistYear('');
    setNewHistDesc('');
    setNewHistImg('');
  };

  const handleUpdateHistoryItem = (id: string, field: keyof JatcHistoryItem, value: any) => {
    const newList = historyList.map(item => item.id === id ? { ...item, [field]: value } : item);
    setHistoryList(newList);
    setSiteConfig({
      ...siteConfig,
      about: {
        ...siteConfig.about,
        history: newList
      }
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const newList = historyList.filter(item => item.id !== id);
    setHistoryList(newList);
    setSiteConfig({
      ...siteConfig,
      about: {
        ...siteConfig.about,
        history: newList
      }
    });
    if (editingHistId === id) setEditingHistId(null);
  };

  const handleHistImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 1000, 700, 0.75);
    setNewHistImg(result);
  };

  // Save Homepage edit Configurations
  const handleSavePageConfig = () => {
    const updated: SiteConfig = {
      ...siteConfig,
      hero: {
        ...siteConfig.hero,
        companyName,
        tagline,
        subtitle,
        trainerName,
        trainerTitle,
        webinarSeriesTitle,
        webinarDuration,
        webinarParts,
        certificateNote,
        backgroundImageUrl,
        backgroundImageUrl2,
        backgroundImageUrl3,
        backgroundImageUrl4
      },
      about: {
        ...siteConfig.about,
        profile: profileText,
        vision: visionText,
        history: historyList
      },
      contact: {
        officeAddress,
        whatsappNumber,
        operationalHours
      },
      certificate: {
        signatureName: certSignName,
        signatureRole: certSignRole,
        backgroundStyle: certBgStyle,
        logoUrl: certLogoUrl,
        rightLogoUrl: certRightLogoUrl,
        signatureUrl: certSignUrl,
        issueDate: certIssueDate
      },
      importanceReasons,
      failureReasons,
      learningGoals,
      learningGoalsSubtitle,
      learningGoalsArrowUrl,
      methodologies,
      showLmsAndLive,
      targetParticipants,
      institutions
    };
    setSiteConfig(updated);
    alert('Konfigurasi Beranda, LMS & Live, Sasaran Target, dan Logo Kemitraan Lembaga berhasil disimpan!');
  };

  // Helper for Institution Logo Upload
  const handleInstitutionLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await compressImage(file, 500, 300, 0.8);
    setInstitutions(prev => prev.map(inst => inst.id === id ? { ...inst, logoUrl: result } : inst));
  };

  // Helper to read file contents for articles / gallery / certificate
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'article-new' | 'article-edit' | 'gallery-new' | 'gallery-edit' | 'cert-logo' | 'cert-right-logo' | 'cert-signature'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let result = '';
    if (type.startsWith('cert-')) {
      result = await compressImage(file, 450, 300, 0.85);
    } else {
      result = await compressImage(file, 1000, 700, 0.75);
    }

    if (type === 'article-new') {
      setNewArtImgUrl(result);
    } else if (type === 'article-edit' && editingArticle) {
      setEditingArticle({ ...editingArticle, imageUrl: result });
    } else if (type === 'gallery-new') {
      setNewGalImgUrl(result);
    } else if (type === 'gallery-edit' && editingGallery) {
      setEditingGallery({ ...editingGallery, imageUrl: result });
    } else if (type === 'cert-logo') {
      setCertLogoUrl(result);
    } else if (type === 'cert-right-logo') {
      setCertRightLogoUrl(result);
    } else if (type === 'cert-signature') {
      setCertSignUrl(result);
    }
  };

  // Add Article
  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtTitle.trim() || !newArtContent.trim()) {
      alert('Sila lengkapi judul dan konten artikel.');
      return;
    }
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title: newArtTitle,
      description: newArtDesc || newArtContent.substring(0, 100) + '...',
      content: newArtContent,
      author: siteConfig.hero.trainerName,
      date: new Date().toISOString().substring(0, 10),
      category: newArtCategory,
      readTime: '6 min baca',
      imageUrl: newArtImgUrl,
      externalUrl: newArtExternalUrl || undefined
    };
    setArticles([newArt, ...articles]);
    setNewArtTitle('');
    setNewArtDesc('');
    setNewArtContent('');
    setNewArtImgUrl('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop');
    setNewArtExternalUrl('');
    alert('Artikel baru berhasil ditambahkan!');
  };

  // Update Article
  const handleUpdateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title.trim() || !editingArticle.content.trim()) {
       alert('Sila lengkapi judul dan konten artikel.');
       return;
    }
    setArticles(articles.map(art => art.id === editingArticle.id ? editingArticle : art));
    setEditingArticle(null);
    alert('Artikel berhasil diperbarui!');
  };

  // Delete Article
  const handleDeleteArticle = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  // Add Session
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessTitle.trim() || !newSessTime.trim()) {
      alert('Sila lengkapi rincian sesi jadwal.');
      return;
    }
    const newSess: LearningSession = {
      id: `sess-${Date.now()}`,
      title: newSessTitle,
      dateTime: newSessTime,
      instructor: newSessInstructor,
      status: 'Aktif',
      isCertificateIssued: newSessIsCertIssued,
      isWebinarSequence: newSessIsWebinarSeq,
      webinarSequenceLabel: newSessIsWebinarSeq ? newSessWebinarSeqLabel : undefined
    };
    setSessions([...sessions, newSess]);
    setNewSessTitle('');
    setNewSessTime('');
    setNewSessIsCertIssued(false);
    setNewSessIsWebinarSeq(false);
    setNewSessWebinarSeqLabel('Webinar ke-2');
    alert('Sesi Jadwal Learning baru berhasil ditambahkan!');
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal sesi ini?')) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  // Approve member
  const handleApproveMember = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: 'Selesai' } : m));
  };

  // Reject member
  const handleRejectMember = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: 'Ditolak' } : m));
  };

  // Delete member
  const handleDeleteMember = (id: string) => {
    if (confirm('Hapus pendaftaran anggota ini dari database?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  // LMS actions
  const handleAddLMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLmsTitle.trim() || !newLmsFileUrl.trim()) {
      alert('Judul dan URL Lampiran Dokumen/Video wajib diisi.');
      return;
    }
    const newMod: LMSModule = {
      id: `lms-${Date.now()}`,
      title: newLmsTitle,
      type: newLmsType,
      durationOrPages: newLmsDuration || (newLmsType === 'pdf' ? '12 Halaman' : '45 Menit'),
      category: newLmsCat || 'Kurikulum Inti JATC',
      description: newLmsDesc || 'Materi pembelajaran mandiri interaktif JATC.',
      goalReference: newLmsGoal,
      fileUrl: newLmsFileUrl
    };
    setLmsModules([...lmsModules, newMod]);
    setNewLmsTitle('');
    setNewLmsDuration('');
    setNewLmsCat('');
    setNewLmsDesc('');
    setNewLmsGoal('Goal #1 s/d #7');
    setNewLmsFileUrl('');
    alert('Modul materi kurikulum baru berhasil ditambahkan!');
  };

  const handleDeleteLMS = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi kurikulum LMS ini?')) {
      setLmsModules(lmsModules.filter(m => m.id !== id));
    }
  };

  const handleUpdateLMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLMS || !editingLMS.title.trim() || !editingLMS.fileUrl.trim()) {
      alert('Judul dan URL Lampiran wajib diisi.');
      return;
    }
    setLmsModules(lmsModules.map(m => m.id === editingLMS.id ? editingLMS : m));
    setEditingLMS(null);
    alert('Materi kurikulum LMS berhasil diperbarui!');
  };

  // Add Gallery image
  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || (!newGalImgUrl.trim() && !newGalVideoUrl.trim())) {
      alert('Sila isi caption dan url atau upload media.');
      return;
    }
    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalTitle,
      imageUrl: newGalImgUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
      category: newGalCat,
      date: new Date().toISOString().substring(0, 10),
      externalUrl: newGalExternalUrl || undefined,
      videoUrl: newGalVideoUrl || undefined
    };
    setGallery([item, ...gallery]);
    setNewGalTitle('');
    setNewGalImgUrl('');
    setNewGalExternalUrl('');
    setNewGalVideoUrl('');
    alert('Dokumentasi baru berhasil diunggah!');
  };

  // Update Gallery Item
  const handleUpdateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery || !editingGallery.title.trim()) return;
    setGallery(gallery.map(g => g.id === editingGallery.id ? editingGallery : g));
    setEditingGallery(null);
    alert('Dokumentasi media berhasil diperbarui!');
  };

  // Delete Gallery item
  const handleDeleteGallery = (id: string) => {
    if (confirm('Hapus foto dari galeri?')) {
      setGallery(gallery.filter(g => g.id !== id));
    }
  };

  // Export registrations as CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nama Anggota,Tempat Lahir,Tanggal Lahir,Institusi,Jenis Kelamin,Agama,Pekerjaan,No Telp,Email,Alamat Rumah,Pilihan Sesi,Status Registrasi\n";
    members.forEach(m => {
      csvContent += `"${m.name.replace(/"/g, '""')}","${m.birthPlace.replace(/"/g, '""')}","${m.birthDate}","${m.institution.replace(/"/g, '""')}","${m.gender}","${m.religion}","${m.profession.replace(/"/g, '""')}","${m.phone}","${m.email}","${m.address.replace(/"/g, '""')}","${m.selectedSession.replace(/"/g, '""')}","${m.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pendaftaran_jatc_indonesia_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 shadow-sm text-neutral-800" id="admin-panel-viewport">
      {!isLogged ? (
        /* Login screen */
        <div className="max-w-md mx-auto py-12 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#0b2240]/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-brand-blue" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-brand-blue">
              Login Pengontrol Administrator
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              Masukkan kredensial administrator Anda untuk melakukan adaptasi layout, reset, perubahan, penambahan, atau penghapusan materi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm">
            {errMessage && (
              <div className="bg-red-50 text-red-700 text-xs rounded-lg p-2.5 border border-red-200 font-sans font-medium">
                {errMessage}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masukkan admin"
                className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 outline-none focus:border-brand-gold font-sans font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="masukkan admin"
                className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 outline-none focus:border-brand-gold font-sans font-medium"
              />
            </div>
            <div className="text-[10px] text-gray-400 bg-neutral-50 p-2.5 rounded-lg border italic font-sans">
              Hint Kunci Akses Default: <span className="font-bold text-brand-blue font-sans">admin</span> / <span className="font-bold text-brand-blue font-sans">admin</span> (huruf kecil semua).
            </div>
            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-2.5 rounded-lg text-xs font-sans tracking-wide transition-all cursor-pointer"
            >
              Masuk Konsol Admin
            </button>
          </form>
        </div>
      ) : (
        /* Authorized Control Panel */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-gold animate-spin-slow" />
                <h3 className="font-serif text-2xl font-bold text-brand-blue">
                  Konsol Administrator JATC
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-sans mt-1">
                Lakukan pengubahan, hapus, tambah isi data landing page beranda secara visual dan instan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onResetToDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Default Pabrik
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-gray-700 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Admin
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-3 border-neutral-100">
            {[
              { id: 'content', label: 'Teks Beranda', icon: Settings },
              { id: 'members', label: 'Pendaftar Anggota', icon: Users },
              { id: 'lms', label: 'Kurikulum LMS', icon: Layers },
              { id: 'sessions', label: 'Kelola Jadwal Sesi', icon: Calendar },
              { id: 'articles', label: 'Kelola Artikel Tips', icon: BookOpen },
              { id: 'gallery', label: 'Galeri Media', icon: Image }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-medium rounded-lg transition-all ${
                    subTab === tab.id
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-white border border-neutral-200 text-gray-600 hover:bg-neutral-50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Viewer content */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
            {subTab === 'content' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                  <Info className="w-4 h-4 text-brand-gold" />
                  <h4 className="font-serif text-base font-bold text-brand-blue">Edit Teks Landing Page Utama</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Nama Lembaga (Sponsor):</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Tagline Sub-heading:</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Hero Subtitle Deskripsi:</label>
                    <textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 h-16 resize-y focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Nama Trainer Utama:</label>
                    <input
                      type="text"
                      value={trainerName}
                      onChange={(e) => setTrainerName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Gelar Trainer / Slogan:</label>
                    <input
                      type="text"
                      value={trainerTitle}
                      onChange={(e) => setTrainerTitle(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>

                  {/* HERO BACKGROUND CONFIG */}
                  <div className="md:col-span-2 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 space-y-3">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider font-mono">
                      Foto Latar Belakang (Background Image) Landing Page Utama Beranda:
                    </label>
                    <p className="text-[10px] text-gray-500 font-sans leading-normal">
                      Ubah gambar latar belakang pada bagian utama Beranda JATC (contoh: Gambar Patung Liberty / New York Skyline). Anda dapat mengunggah file foto lokal atau menempelkan tautan/link URL gambar luar secara langsung.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {backgroundImageUrl ? (
                        <div className="shrink-0 relative group">
                          <img
                            src={backgroundImageUrl}
                            alt="Preview Background"
                            className="w-24 h-16 object-cover rounded-lg border-2 border-[#a18241]/30 bg-white"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setBackgroundImageUrl('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                            title="Hapus Latar Belakang"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="shrink-0 w-24 h-16 rounded-lg bg-gray-200 border border-neutral-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          Tanpa Gambar
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 1: Unggah Gambar (File):</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroBgUpload}
                            className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 2: Tempel Link / URL Gambar Luar:</span>
                          <input
                            type="text"
                            value={backgroundImageUrl}
                            onChange={(e) => setBackgroundImageUrl(e.target.value)}
                            className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold font-mono"
                            placeholder="https://images.unsplash.com/... atau tautan gambar luar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HERO SECOND BACKGROUND CONFIG */}
                  <div className="md:col-span-2 bg-[#0b2240]/5 p-4 rounded-xl border border-[#0b2240]/10 space-y-3">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono">
                      Foto Latar Belakang Ke-2 (Brooklyn Bridge / Night Skyline) Beranda Bawah:
                    </label>
                    <p className="text-[10px] text-gray-500 font-sans leading-normal">
                      Ubah gambar latar belakang atmosferik yang membungkus sub-bagian bawah halaman utama (contoh: Pemandangan Brooklyn Bridge malam hari). Anda dapat mengunggah file foto lokal atau menempelkan tautan/link URL gambar secara langsung.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {backgroundImageUrl2 ? (
                        <div className="shrink-0 relative group">
                          <img
                            src={backgroundImageUrl2}
                            alt="Preview Second Background"
                            className="w-24 h-16 object-cover rounded-lg border-2 border-brand-gold/30 bg-white"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setBackgroundImageUrl2('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                            title="Hapus Latar Belakang Ke-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="shrink-0 w-24 h-16 rounded-lg bg-gray-200 border border-neutral-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          Tanpa Gambar
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 1: Unggah Gambar (File):</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroBgUpload2}
                            className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 2: Tempel Link / URL Gambar Luar:</span>
                          <input
                            type="text"
                            value={backgroundImageUrl2}
                            onChange={(e) => setBackgroundImageUrl2(e.target.value)}
                            className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold font-mono"
                            placeholder="https://images.unsplash.com/... atau tautan gambar luar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HERO THIRD BACKGROUND CONFIG */}
                  <div className="md:col-span-2 bg-[#0b2240]/5 p-4 rounded-xl border border-[#0b2240]/10 space-y-3">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono">
                      Foto Latar Belakang Ke-3 (Mitra Lembaga & Perspektif Era Modern) Beranda Tengah-Bawah:
                    </label>
                    <p className="text-[10px] text-gray-500 font-sans leading-normal">
                      Ubah gambar latar belakang atmosferik yang membungkus bagian Mitra Lembaga (Clients & Partners) serta bagian Perspektif Era Modern & Identifikasi Masalah kegagalan. Anda dapat mengunggah file foto lokal atau menempelkan tautan/link URL gambar secara langsung.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {backgroundImageUrl3 ? (
                        <div className="shrink-0 relative group">
                          <img
                            src={backgroundImageUrl3}
                            alt="Preview Third Background"
                            className="w-24 h-16 object-cover rounded-lg border-2 border-brand-gold/30 bg-white"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setBackgroundImageUrl3('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                            title="Hapus Latar Belakang Ke-3"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="shrink-0 w-24 h-16 rounded-lg bg-gray-200 border border-neutral-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          Tanpa Gambar
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 1: Unggah Gambar (File):</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroBgUpload3}
                            className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 2: Tempel Link / URL Gambar Luar:</span>
                          <input
                            type="text"
                            value={backgroundImageUrl3}
                            onChange={(e) => setBackgroundImageUrl3(e.target.value)}
                            className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold font-mono"
                            placeholder="https://images.unsplash.com/... atau tautan gambar luar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HERO FOURTH BACKGROUND CONFIG */}
                  <div className="md:col-span-2 bg-[#0b2240]/5 p-4 rounded-xl border border-[#0b2240]/10 space-y-3">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider font-mono">
                      Foto Latar Belakang Ke-4 (5 Metodologi Pengajaran Kontemporer) Beranda Tengah:
                    </label>
                    <p className="text-[10px] text-gray-500 font-sans leading-normal">
                      Ubah gambar latar belakang atmosferik yang membungkus bagian 5 Metodologi Pengajaran Kontemporer. Anda dapat mengunggah file foto lokal atau menempelkan tautan/link URL gambar secara langsung.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {backgroundImageUrl4 ? (
                        <div className="shrink-0 relative group">
                          <img
                            src={backgroundImageUrl4}
                            alt="Preview Fourth Background"
                            className="w-24 h-16 object-cover rounded-lg border-2 border-brand-gold/30 bg-white"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setBackgroundImageUrl4('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                            title="Hapus Latar Belakang Ke-4"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="shrink-0 w-24 h-16 rounded-lg bg-gray-200 border border-neutral-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          Tanpa Gambar
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 1: Unggah Gambar (File):</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroBgUpload4}
                            className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wide font-mono">Pilihan 2: Tempel Link / URL Gambar Luar:</span>
                          <input
                            type="text"
                            value={backgroundImageUrl4}
                            onChange={(e) => setBackgroundImageUrl4(e.target.value)}
                            className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold font-mono"
                            placeholder="https://images.unsplash.com/... atau tautan gambar luar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Profil / Sejarah Singkat (Tentang Kami):</label>
                    <textarea
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 h-20 resize-y focus:border-brand-gold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Visi JATC:</label>
                    <textarea
                      value={visionText}
                      onChange={(e) => setVisionText(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 h-16 resize-y focus:border-brand-gold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Alamat Kantor Resmi:</label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">WhatsApp Number (e.g. 628123...):</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Jam Operasional Pelayanan:</label>
                    <input
                      type="text"
                      value={operationalHours}
                      onChange={(e) => setOperationalHours(e.target.value)}
                      className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* KELOLA SPOTLIGHT & BAGIAN WEBINAR */}
                <div className="mt-8 border-t border-dashed pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-5 h-5 text-brand-gold" />
                    <h5 className="font-serif text-sm font-bold text-[#0b2240]">Manajemen Sesi Webinar & Agenda Belajar (Spotlight)</h5>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Penggantian tajuk seri utama, durasi kumulatif, catatan kelulusan, serta rincian kurikulum bagian (e.g. Part One, Part Two). Perubahan di bawah ini langsung merefleksikan tampilan visual di kotak biru beranda utama.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Judul Seri Webinar / Pembelajaran:</label>
                      <input
                        type="text"
                        value={webinarSeriesTitle}
                        onChange={(e) => setWebinarSeriesTitle(e.target.value)}
                        className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="e.g. Two Day English Learning Revolution (12 Hour Method)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Durasi Kumulatif / Keterangan Waktu:</label>
                      <input
                        type="text"
                        value={webinarDuration}
                        onChange={(e) => setWebinarDuration(e.target.value)}
                        className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="e.g. 12 Jam Intensif (Terbagi dalam 4 Bagian/Times)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Catatan Syarat Sertifikasi:</label>
                      <textarea
                        value={certificateNote}
                        onChange={(e) => setCertificateNote(e.target.value)}
                        className="w-full text-xs rounded-lg border border-neutral-300 p-2.5 h-16 resize-y focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="Sertifikat resmi dan eksklusif akan diberikan dengan bangga kepada para peserta yang telah menyelesaikan..."
                      />
                    </div>
                  </div>

                  {/* Webinar Parts Dynamic List: Add, Edit, Delete */}
                  <div className="bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200 mt-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-xs font-bold text-brand-blue">Daftar Bagian (Course Modules Timeline)</span>
                        <span className="bg-[#0b2240] text-brand-gold text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                          {webinarParts.length} Bagian
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddWebinarPart}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-[10px] font-sans font-bold shadow transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Tambah Bagian Baru
                      </button>
                    </div>

                    {webinarParts.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-gray-400 italic font-sans">
                        Belum ada modul kustom bagian terdaftar. Klik "Tambah Bagian Baru" untuk memulainya.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {webinarParts.map((partItem, idx) => (
                          <div
                            key={partItem.id}
                            className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-3 rounded-lg border border-neutral-200 shadow-xs hover:border-[#a18241]/30 transition-all"
                          >
                            <span className="text-[10px] font-mono text-gray-400 font-bold sm:min-w-[20px]">
                              #{idx + 1}
                            </span>
                            <div className="w-full sm:w-1/4">
                              <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono sm:hidden mb-0.5">Label Bagian:</label>
                              <input
                                type="text"
                                placeholder="e.g. PART ONE"
                                value={partItem.part}
                                onChange={(e) => handleUpdateWebinarPartField(partItem.id, 'part', e.target.value)}
                                className="w-full text-xs font-bold rounded border border-neutral-200 p-1.5 focus:border-[#a18241] outline-none text-[#a18241] uppercase font-mono"
                              />
                            </div>
                            <div className="w-full sm:flex-1">
                              <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono sm:hidden mb-0.5">Judul Materi / Topik:</label>
                              <input
                                type="text"
                                placeholder="e.g. Developing English Mindset and Paradigm"
                                value={partItem.title}
                                onChange={(e) => handleUpdateWebinarPartField(partItem.id, 'title', e.target.value)}
                                className="w-full text-xs rounded border border-neutral-200 p-1.5 focus:border-[#a18241] outline-none font-sans text-neutral-800"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteWebinarPart(partItem.id)}
                              className="self-end sm:self-auto inline-flex items-center gap-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/60 p-1.5 rounded-lg border border-red-200/40 text-[10px] transition-all cursor-pointer"
                              title="Hapus Bagian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sm:hidden font-sans font-bold">Hapus</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* MANAGEMENT OF BENEFITS & FAILURES */}
                <div className="mt-8 border-t border-dashed pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-5 h-5 text-brand-gold" />
                    <h5 className="font-serif text-sm font-bold text-[#0b2240]">Manajemen Manfaat Bahasa Inggris & Analisis Masalah Belajar</h5>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Kelola poin-poin analisis yang ditampilkan di bagian "Mengapa Penguasaan Bahasa Inggris Lebih Penting..." (Kiri) dan "Mengapa Jutaan Pembelajar Indonesia Gagal..." (Kanan). Anda bisa menambahkan poin baru, mengedit teks, memilih ikon representatif, serta menghapusnya secara langsung.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                    {/* COLUMN 1: IMPORTANCE REASONS (KIRI) */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-brand-blue" />
                          <span className="font-serif text-xs font-bold text-brand-blue">1. Pentingnya Bahasa Inggris (Kiri Beranda)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddImportanceReason}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-[10px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Tambah Poin Baru
                        </button>
                      </div>

                      {importanceReasons.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada poin terdaftar. Silakan klik tambah baru.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                          {importanceReasons.map((reason, idx) => (
                            <div key={reason.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-2 relative">
                              <div className="flex justify-between items-center pb-1 border-b border-neutral-200/60">
                                <span className="text-[10px] font-mono text-[#a18241] font-bold">Analisis Manfaat #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImportanceReason(reason.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">Judul (Title):</label>
                                  <input
                                    type="text"
                                    value={reason.title}
                                    onChange={(e) => handleUpdateImportanceReason(reason.id, 'title', e.target.value)}
                                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none font-bold text-neutral-800"
                                    placeholder="e.g. Global Bridge / Jembatan Global"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">Simbol / Ikon:</label>
                                  <select
                                    value={reason.iconName}
                                    onChange={(e) => handleUpdateImportanceReason(reason.id, 'iconName', e.target.value)}
                                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none font-mono bg-white"
                                  >
                                    <option value="Globe">🌍 Globe</option>
                                    <option value="Briefcase">💼 Briefcase</option>
                                    <option value="BookOpen">📖 BookOpen</option>
                                    <option value="Award">🏆 Award</option>
                                    <option value="Sparkles">✨ Sparkles</option>
                                    <option value="GraduationCap">🎓 GradCap</option>
                                    <option value="Heart">❤️ Heart</option>
                                    <option value="Bookmark">🔖 Bookmark</option>
                                    <option value="Activity">⚡ Activity</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">Penjelasan Deskripsi:</label>
                                <textarea
                                  value={reason.description}
                                  onChange={(e) => handleUpdateImportanceReason(reason.id, 'description', e.target.value)}
                                  className="w-full text-xs rounded border border-neutral-300 p-1.5 h-14 resize-y focus:border-[#a18241] outline-none text-neutral-600 font-sans"
                                  placeholder="Deskripsi penjelasan..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* COLUMN 2: FAILURE REASONS (KANAN) */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-red-600" />
                          <span className="font-serif text-xs font-bold text-red-950">2. Penyebab Pembelajaran Gagal (Kanan Beranda)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddFailureReason}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded text-[10px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Tambah Poin Baru
                        </button>
                      </div>

                      {failureReasons.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada poin penyebab kegagalan terdaftar. Silakan klik tambah baru.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                          {failureReasons.map((fail, idx) => (
                            <div key={fail.id} className="p-3 bg-red-50/30 rounded-lg border border-red-200/50 space-y-2">
                              <div className="flex justify-between items-center pb-1 border-b border-red-200/20">
                                <span className="text-[10px] font-mono text-red-900/60 font-bold">Faktor Masalah #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFailureReason(fail.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-red-700/60 mb-0.5 font-mono">Judul Hambatan (e.g. Istilah/Mindset):</label>
                                <input
                                  type="text"
                                  value={fail.title}
                                  onChange={(e) => handleUpdateFailureReason(fail.id, 'title', e.target.value)}
                                  className="w-full text-xs rounded border border-red-200/70 p-1.5 focus:border-red-400 outline-none font-bold text-red-950"
                                  placeholder="e.g. Mindset and Paradigm (Pola Pikir)"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-red-700/60 mb-0.5 font-mono">Uraian / Penjelasan Masalah:</label>
                                <textarea
                                  value={fail.description}
                                  onChange={(e) => handleUpdateFailureReason(fail.id, 'description', e.target.value)}
                                  className="w-full text-xs rounded border border-red-200/70 p-1.5 h-14 resize-y focus:border-red-400 outline-none text-red-900 font-sans"
                                  placeholder="Deskripsi masalah..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MANAGEMENT OF LEARNING GOALS & METHODS (SASARAN BELAJAR & METODOLOGI PENGAJARAN) */}
                <div className="mt-8 border-t border-dashed pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-5 h-5 text-brand-gold" />
                    <h5 className="font-serif text-sm font-bold text-[#0b2240]">Manajemen Sasaran Belajar & Metodologi Pengajaran</h5>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Kelola materi di bagian kurikulum utama yaitu "Sasaran Pembelajaran Utama JATC" (e.g. 7 Sasaran) dan "Metodologi Pengajaran Kontemporer" (e.g. 5 Metodologi). Perubahan ini langsung merubah visual kurikulum di halaman depan.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                    {/* COLUMN 1: LEARNING GOALS */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="w-4 h-4 text-brand-blue" />
                          <span className="font-serif text-xs font-bold text-brand-blue">1. Sasaran Pembelajaran Utama JATC</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLearningGoal}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-[10px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Tambah Sasaran
                        </button>
                      </div>

                      {/* Subtitle / Ketegasan tujuan utama training */}
                      <div className="p-3 bg-amber-50/50 border border-[#a18241]/20 rounded-lg space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide font-sans">
                          Ketegasan Tujuan Utama Training (Peta Sasaran):
                        </label>
                        <textarea
                          rows={2}
                          value={learningGoalsSubtitle}
                          onChange={(e) => setLearningGoalsSubtitle(e.target.value)}
                          className="w-full text-xs rounded border border-neutral-300 p-2 font-sans bg-white outline-none focus:border-brand-gold"
                          placeholder="Sistem materi kurikulum kami didesain presisi..."
                        />
                        <p className="text-[9px] text-gray-400 font-sans italic">
                          Teks penjelas (Ketegasan Tujuan Utama) yang terpajang di sebelah kanan visual panah adat.
                        </p>
                      </div>

                      {/* Logo Panah Sasaran / Target Map Arrow Image */}
                      <div className="p-3 bg-amber-50/50 border border-[#a18241]/20 rounded-lg space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide font-sans">
                          Logo Panah Adat Sasaran (Samping Peta):
                        </label>
                        <div className="flex gap-3 items-center">
                          {learningGoalsArrowUrl ? (
                            <img
                              src={learningGoalsArrowUrl}
                              alt="Logo Panah Adat"
                              className="w-12 h-12 object-contain rounded bg-transparent border border-neutral-200/60 p-0.5 mix-blend-multiply"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center text-[7px] text-gray-400">No Image</div>
                          )}
                          <div className="flex-1 space-y-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const result = await compressImage(file, 400, 400, 0.8);
                                setLearningGoalsArrowUrl(result);
                              }}
                              className="w-full text-[9px] text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                            />
                            <div className="flex gap-1.5 items-center">
                              <span className="text-[8px] font-mono text-gray-400">URL:</span>
                              <input
                                type="text"
                                value={learningGoalsArrowUrl}
                                onChange={(e) => setLearningGoalsArrowUrl(e.target.value)}
                                className="w-full text-[9px] rounded border border-neutral-200 p-1 font-mono text-gray-600 bg-white focus:border-brand-gold outline-none"
                                placeholder="Ganti URL gambar..."
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-400 font-sans italic">
                          Latar belakang putih otomatis dihilangkan di halaman depan menggunakan efek blend transparansi malam.
                        </p>
                      </div>

                      {learningGoals.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada sasaran pembelajaran. Silakan klik tambah baru.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                          {learningGoals.map((lg, idx) => (
                            <div key={lg.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/85 space-y-2">
                              <div className="flex justify-between items-center pb-1 border-b border-neutral-200/60">
                                <span className="text-[10px] font-mono text-[#a18241] font-bold">Goal #{lg.number}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLearningGoal(lg.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1">
                                  <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">No. Goal:</label>
                                  <input
                                    type="number"
                                    value={lg.number}
                                    onChange={(e) => handleUpdateLearningGoal(lg.id, 'number', parseInt(e.target.value) || (idx + 1))}
                                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none font-mono text-center"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">ID Referensi:</label>
                                  <input
                                    type="text"
                                    value={lg.goalId}
                                    onChange={(e) => handleUpdateLearningGoal(lg.id, 'goalId', e.target.value)}
                                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none font-mono"
                                    placeholder="e.g. goal-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-gray-400 mb-0.5 font-mono">Uraian Sasaran / Target:</label>
                                <textarea
                                  value={lg.goal}
                                  onChange={(e) => handleUpdateLearningGoal(lg.id, 'goal', e.target.value)}
                                  className="w-full text-xs rounded border border-neutral-300 p-1.5 h-16 resize-y focus:border-[#a18241] outline-none text-neutral-800 font-sans"
                                  placeholder="Tulis uraian sasaran pembelajaran..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* COLUMN 2: CONTRACT TEACHING METHODOLOGY */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-amber-600" />
                          <span className="font-serif text-xs font-bold text-amber-950">2. Metodologi Pengajaran Kontemporer</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddMethodology}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Tambah Metodologi
                        </button>
                      </div>

                      {methodologies.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada metodologi terdaftar. Silakan klik tambah baru.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                          {methodologies.map((meth, idx) => (
                            <div key={meth.id} className="p-3 bg-amber-50/10 rounded-lg border border-neutral-300/60 space-y-2">
                              <div className="flex justify-between items-center pb-1 border-b border-amber-200/20">
                                <span className="text-[10px] font-mono text-amber-950 font-bold">Metode #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMethodology(meth.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[8px] font-bold uppercase text-amber-900/60 mb-0.5 font-mono">Label Kategori (e.g. PSYCHOLOGICAL APPROACH):</label>
                                  <input
                                    type="text"
                                    value={meth.title}
                                    onChange={(e) => handleUpdateMethodology(meth.id, 'title', e.target.value)}
                                    className="w-full text-xs font-bold rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none text-[#a18241] uppercase font-mono"
                                    placeholder="e.g. PSYCHOLOGICAL APPROACH"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold uppercase text-amber-900/60 mb-0.5 font-mono">Nama / Judul Pendekatan:</label>
                                  <input
                                    type="text"
                                    value={meth.subtitle}
                                    onChange={(e) => handleUpdateMethodology(meth.id, 'subtitle', e.target.value)}
                                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-[#a18241] outline-none font-bold text-neutral-800"
                                    placeholder="e.g. Pendekatan Psikologis"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-amber-900/60 mb-0.5 font-mono">Deskripsi Metode:</label>
                                <textarea
                                  value={meth.description}
                                  onChange={(e) => handleUpdateMethodology(meth.id, 'description', e.target.value)}
                                  className="w-full text-xs rounded border border-neutral-300 p-1.5 h-16 resize-y focus:border-[#a18241] outline-none text-neutral-600 font-sans"
                                  placeholder="Uraian rincian metodologi..."
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold uppercase text-amber-900/60 mb-0.5 font-mono">Cocok Untuk (Pembelajaran Target):</label>
                                <input
                                  type="text"
                                  value={meth.forWho}
                                  onChange={(e) => handleUpdateMethodology(meth.id, 'forWho', e.target.value)}
                                  className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-amber-500 outline-none font-sans font-medium text-amber-900"
                                  placeholder="e.g. Pembelajaran yang mengalami trauma..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SETELAN TAMPILAN LMS/LIVE, TARGET SASARAN, DAN MITRA LEMBAGA */}
                <div className="mt-8 border-t border-dashed pt-6 space-y-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sliders className="w-5 h-5 text-brand-gold" />
                    <h5 className="font-serif text-sm font-bold text-[#0b2240]">Setelan Tampilan LMS/Live, Target Sasaran, & Kemitraan Lembaga</h5>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Lakukan penyesuaian untuk visibilitas materi LMS, daftar target jenjang pendidikan/tingkat peserta sasaran, serta unggah/kelola logo kemitraan lembaga yang pernah mengikuti pelatihan.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CARD 1: LMS & LIVE TOGGLES */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Eye className="w-4 h-4 text-brand-blue" />
                        <span className="font-serif text-xs font-bold text-brand-blue">Visibilitas Menu LMS & Live</span>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 leading-normal font-sans">
                        Pilih apakah menu/tab <strong>"Materi LMS & Live"</strong> dan tautan Sesi Live webinar ingin ditampilkan atau disembunyikan dari halaman depan (beranda) untuk pengunjung umum.
                      </p>
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
                        <span className="text-[11px] font-sans font-bold text-neutral-700">Tampilkan Materi LMS & Sesi Live:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showLmsAndLive}
                            onChange={(e) => setShowLmsAndLive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </div>
                      <span className="text-[9px] font-sans text-neutral-400 block italic">
                        *Jika dinonaktifkan, tab Materi LMS & Live di header navigasi akan disembunyikan.
                      </span>
                    </div>

                    {/* CARD 2: TARGET PARTICIPANTS (JENJANG SASARAN) */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600" />
                          <span className="font-serif text-xs font-bold text-amber-950">Target Sasaran Peserta Kurikulum JATC</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTargetParticipant}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> Tambah
                        </button>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 leading-normal font-sans">
                        Kelola daftar jenjang kualifikasi target (e.g. Profesor, S2, SMA, Lembaga) lengkap dengan foto ikon/gambar/link URL-nya.
                      </p>

                      {targetParticipants.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada target sasaran yang disimpan.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                          {targetParticipants.map((tpObj, idx) => {
                            const tp = tpObj && typeof tpObj === 'object' && 'id' in tpObj ? (tpObj as TargetParticipantConfig) : { id: `tp-migrated-${idx}`, text: String(tpObj), imageUrl: '' };
                            const isEditing = editingTpId === tp.id;
                            const isConfirming = deleteConfirmTpId === tp.id;

                            return (
                              <div key={tp.id} className={`p-3 rounded-xl border transition-all duration-200 ${isEditing ? 'bg-amber-50/40 border-amber-300 shadow-sm' : 'bg-neutral-50 border-neutral-200'}`}>
                                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-neutral-200/60">
                                  <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                                    Sasaran #{idx + 1}
                                  </span>
                                  
                                  {/* Actions Block */}
                                  <div className="flex items-center gap-1.5">
                                    {!isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTpId(tp.id);
                                          setDeleteConfirmTpId(null); // Cancel any delete prompts
                                        }}
                                        className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 border border-amber-200"
                                        title="Ubah info sasaran"
                                      >
                                        <Edit className="w-3 h-3" /> Edit
                                      </button>
                                    )}

                                    {/* Safe Deletion Action with Inline Confirmation inside iframe */}
                                    {isConfirming ? (
                                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded p-0.5">
                                        <span className="text-[9px] text-red-600 font-bold px-1">Yakin?</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTargetParticipant(tp.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow-sm"
                                        >
                                          Ya, Hapus
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirmTpId(null)}
                                          className="text-gray-500 hover:text-gray-700 text-[8.5px] font-semibold px-1 rounded"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteConfirmTpId(tp.id);
                                          setEditingTpId(null); // Close edit mode if delete is requested
                                        }}
                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* CARD CONTENT BODY */}
                                {isEditing ? (
                                  <div className="space-y-2.5 pt-1">
                                    <div>
                                      <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono">Teks Sasaran:</label>
                                      <textarea
                                        rows={2}
                                        value={tp.text}
                                        onChange={(e) => handleUpdateTargetParticipantText(tp.id, e.target.value)}
                                        className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-amber-600 font-sans outline-none bg-white font-medium"
                                        placeholder="Contoh: Peserta tingkat pendidikan S1, S2, S3..."
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono">Foto / Gambar (Upload atau URL):</label>
                                      <div className="flex items-center gap-2">
                                        {tp.imageUrl ? (
                                          <img
                                            src={tp.imageUrl}
                                            alt={tp.text}
                                            className="w-10 h-10 object-cover rounded bg-white border border-neutral-200"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-[8px] text-gray-400 font-mono">No Image</div>
                                        )}
                                        <div className="flex-1 space-y-1">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleTargetParticipantImageUpload(e, tp.id)}
                                            className="w-full text-[9px] text-gray-500 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                                          />
                                          <input
                                            type="text"
                                            value={tp.imageUrl || ''}
                                            onChange={(e) => handleUpdateTargetParticipantImage(tp.id, e.target.value)}
                                            className="w-full text-[9px] rounded border border-neutral-300 p-0.5 font-mono"
                                            placeholder="Atau tempel URL gambar luar..."
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Done button to close editing state */}
                                    <div className="flex justify-end pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setEditingTpId(null)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[9px] px-2.5 py-1 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        Selesai Edit
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-2.5 py-1">
                                    {tp.imageUrl ? (
                                      <img
                                        src={tp.imageUrl}
                                        alt={tp.text}
                                        className="w-11 h-11 object-cover rounded-lg border border-neutral-200/80 bg-white"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-11 h-11 rounded-lg bg-neutral-200 flex items-center justify-center text-[8px] text-neutral-400 font-mono">No Pic</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-neutral-700 font-sans font-medium leading-relaxed break-words whitespace-pre-wrap select-text">
                                        {tp.text}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* CARD 3: REBRANDABLE TRAINING INSTITUTIONS (MITRA LEMBAGA) */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-brand-gold" />
                          <span className="font-serif text-xs font-bold text-gray-800">Daftar Lembaga & Logo Mitra Pelatihan</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddInstitution}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-[9px] font-sans font-bold shadow transition-all cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> Tambah
                        </button>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 leading-normal font-sans">
                        Kelola data, nama, dan unggahan logo instansi/lembaga pemerintahan mau pun swasta yang telah mengikuti program pelatihan JATC.
                      </p>

                      {institutions.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-gray-400 italic">
                          Belum ada lembaga/instansi kemitraan terdaftar.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {institutions.map((inst) => {
                            const isEditing = editingInstId === inst.id;
                            const isConfirming = deleteConfirmInstId === inst.id;

                            return (
                              <div key={inst.id} className={`p-2.5 rounded-xl border transition-all duration-200 ${isEditing ? 'bg-indigo-50/20 border-indigo-200 shadow-sm' : 'bg-neutral-50 border-neutral-200'}`}>
                                <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-neutral-200/60">
                                  <span className="text-[9px] font-mono text-[#a18241] font-bold">Lembaga ID: {inst.id.substring(0, 7)}</span>
                                  
                                  {/* Actions block */}
                                  <div className="flex items-center gap-1.5">
                                    {!isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingInstId(inst.id);
                                          setDeleteConfirmInstId(null);
                                        }}
                                        className="text-brand-blue hover:text-brand-blue/80 bg-blue-50 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border border-blue-100"
                                      >
                                        <Edit className="w-2.5 h-2.5" /> Edit
                                      </button>
                                    )}

                                    {/* Safe Confirmation in iframes */}
                                    {isConfirming ? (
                                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded p-0.5">
                                        <span className="text-[8px] text-red-600 font-bold px-1">Yakin?</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteInstitution(inst.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm"
                                        >
                                          Ya
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirmInstId(null)}
                                          className="text-gray-500 hover:text-gray-700 text-[8px] font-semibold px-1 rounded"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteConfirmInstId(inst.id);
                                          setEditingInstId(null);
                                        }}
                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isEditing ? (
                                  <div className="space-y-2 pt-1">
                                    <div>
                                      <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono">Nama Lembaga:</label>
                                      <input
                                        type="text"
                                        value={inst.name}
                                        onChange={(e) => handleUpdateInstitutionName(inst.id, e.target.value)}
                                        className="w-full text-xs rounded border border-neutral-300 p-1 bg-white focus:border-[#a18241] outline-none"
                                        placeholder="Masukkan nama lembaga..."
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold uppercase text-gray-400 font-mono">Logo Lembaga (Ganti/Upload):</label>
                                      <div className="flex items-center gap-2">
                                        {inst.logoUrl ? (
                                          <img
                                            src={inst.logoUrl}
                                            alt={inst.name}
                                            className="w-8 h-8 object-contain rounded bg-white border border-neutral-200"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-[8px] text-gray-400 font-mono">No Logo</div>
                                        )}
                                        <div className="flex-1">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleInstitutionLogoUpload(e, inst.id)}
                                            className="w-full text-[9px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0b2240]/10 file:text-[#0b2240] hover:file:bg-[#0b2240]/20 cursor-pointer"
                                          />
                                          <input
                                            type="text"
                                            value={inst.logoUrl || ''}
                                            onChange={(e) => handleUpdateInstitutionLogo(inst.id, e.target.value)}
                                            className="w-full text-[9px] mt-1 rounded border border-neutral-300 p-0.5 bg-white font-mono"
                                            placeholder="Atau tempel URL logo..."
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Done Editing button */}
                                    <div className="flex justify-end pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setEditingInstId(null)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[8.5px] px-2 py-0.5 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                                      >
                                        Selesai
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5 py-1">
                                    {inst.logoUrl ? (
                                      <img
                                        src={inst.logoUrl}
                                        alt={inst.name}
                                        className="w-9 h-9 object-contain rounded-lg border border-neutral-200/80 bg-white p-0.5"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-[8px] text-neutral-400 font-mono">Logo</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-neutral-800 font-sans font-bold truncate select-text">
                                        {inst.name}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* CARD 4: JATC HISTORY & EVIDENCE LIST */}
                    <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4 md:col-span-3">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-brand-gold animate-pulse" />
                          <span className="font-serif text-xs font-bold text-gray-800">Daftar History & Foto Pendukung JATC</span>
                        </div>
                      </div>
                      
                      <p className="text-[10.5px] text-neutral-500 leading-normal font-sans">
                        Kelola data dokumentasi, nama kegiatan, tahun, dan file foto pendukung untuk dibungkus dalam Sejarah & Dokumentasi Pendukung JATC di beranda Tentang Kami. Anda dapat mengunggah file foto lokal secara langsung atau memasukkan link URL gambar.
                      </p>

                      {/* Add New History Form */}
                      <div className="bg-amber-50/30 p-4 rounded-xl border border-brand-gold/20 space-y-3">
                        <span className="text-[10px] uppercase font-bold text-[#a18241] font-mono tracking-wider block">Tambah Foto Sejarah Baru:</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-1">Judul Kegiatan / Sesi:</label>
                            <input
                              type="text"
                              value={newHistTitle}
                              onChange={(e) => setNewHistTitle(e.target.value)}
                              className="w-full text-xs rounded border border-neutral-300 p-2 bg-white"
                              placeholder="Contoh: Seminar Pembudayaan Logic di UI"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-1">Tahun Kegiatan:</label>
                            <input
                              type="text"
                              value={newHistYear}
                              onChange={(e) => setNewHistYear(e.target.value)}
                              className="w-full text-xs rounded border border-neutral-300 p-2 bg-white"
                              placeholder="Contoh: 2024"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-1">Keterangan / Deskripsi Singkat:</label>
                            <textarea
                              rows={2}
                              value={newHistDesc}
                              onChange={(e) => setNewHistDesc(e.target.value)}
                              className="w-full text-xs rounded border border-neutral-300 p-2 bg-white resize-y"
                              placeholder="Contoh: Drs. Eddy Sudarmadji membedah 5 Contemporary Methodologies di hadapan akademisi."
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-0.5">Lampiran Foto (Ganti/Upload):</label>
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                              {newHistImg ? (
                                <img
                                  src={newHistImg}
                                  alt="Preview upload"
                                  className="w-16 h-12 object-cover rounded border bg-neutral-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-neutral-100 rounded border flex items-center justify-center text-[8px] text-gray-300 font-mono">No Image</div>
                              )}
                              
                              <div className="flex-1 w-full space-y-1">
                                <span className="text-[8px] text-gray-400 block font-mono">Pilihan 1: File Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHistImgUpload}
                                  className="w-full text-[9px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-[#0b2240]/10 file:text-[#0b2240] cursor-pointer"
                                />
                                <span className="text-[8px] text-gray-400 block font-mono mt-1">Pilihan 2: Tempel Link Gambar Luar</span>
                                <input
                                  type="text"
                                  value={newHistImg}
                                  onChange={(e) => setNewHistImg(e.target.value)}
                                  className="w-full text-[10px] rounded border border-neutral-300 p-1 bg-white"
                                  placeholder="Atau masukkan link gambar luar langsung..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right pt-2 border-t border-brand-gold/10">
                          <button
                            type="button"
                            onClick={handleAddHistoryItem}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b2240] hover:bg-[#0b2240]/95 text-white rounded text-[10px] font-bold tracking-wide shadow cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambahkan Ke Sejarah
                          </button>
                        </div>
                      </div>

                      {/* Display Existing Histories */}
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Daftar Dokumentasi Sejarah Terkini ({historyList.length}):</span>
                        {historyList.length === 0 ? (
                          <div className="text-center py-6 text-xs text-gray-400 italic font-sans border border-dashed rounded-lg">
                            Belum ada dokumen sejarah JATC terdaftar.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {historyList.map((hist) => {
                              const isEditing = editingHistId === hist.id;
                              const isConfirming = deleteConfirmHistId === hist.id;

                              return (
                                <div key={hist.id} className={`p-3 rounded-xl border transition-all duration-200 ${isEditing ? 'bg-amber-50/40 border-amber-300 shadow-sm' : 'bg-neutral-50 border-neutral-200'} flex flex-col gap-2.5`}>
                                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#a18241]/10 text-[#a18241] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded">Tahun {hist.year}</span>
                                      <span className="text-[8px] font-mono text-gray-400">ID: {hist.id.substring(0, 9)}</span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {!isEditing && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingHistId(hist.id);
                                            setDeleteConfirmHistId(null);
                                          }}
                                          className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border border-amber-200"
                                        >
                                          <Edit className="w-2.5 h-2.5" /> Edit
                                        </button>
                                      )}

                                      {/* Safe Confirmation in iframes */}
                                      {isConfirming ? (
                                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded p-0.5">
                                          <span className="text-[8px] text-red-600 font-bold px-1.5">Yakin hapus?</span>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteHistoryItem(hist.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[8.5px] px-2 py-0.5 rounded shadow-sm"
                                          >
                                            Ya
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setDeleteConfirmHistId(null)}
                                            className="text-gray-500 hover:text-gray-700 text-[8.5px] font-semibold px-1-5 rounded"
                                          >
                                            Batal
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDeleteConfirmHistId(hist.id);
                                            setEditingHistId(null);
                                          }}
                                          className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded hover:bg-red-100 cursor-pointer shrink-0"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {isEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                      <div>
                                        <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-0.5">Judul:</label>
                                        <input
                                          type="text"
                                          value={hist.title}
                                          onChange={(e) => handleUpdateHistoryItem(hist.id, 'title', e.target.value)}
                                          className="w-full text-xs rounded border border-neutral-300 p-1 bg-white font-sans text-neutral-800"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-0.5">Tahun:</label>
                                        <input
                                          type="text"
                                          value={hist.year}
                                          onChange={(e) => handleUpdateHistoryItem(hist.id, 'year', e.target.value)}
                                          className="w-full text-xs rounded border border-neutral-300 p-1 bg-white font-mono text-neutral-800"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono mb-0.5">Deskripsi:</label>
                                        <textarea
                                          rows={1}
                                          value={hist.description}
                                          onChange={(e) => handleUpdateHistoryItem(hist.id, 'description', e.target.value)}
                                          className="w-full text-xs rounded border border-neutral-300 p-1 bg-white font-sans text-neutral-800 resize-y"
                                        />
                                      </div>

                                      <div className="sm:col-span-3 space-y-1">
                                        <label className="block text-[8px] font-bold text-gray-400 uppercase font-mono">Ganti Gambar (Upload atau URL):</label>
                                        <div className="flex gap-2 items-center">
                                          {hist.imageUrl ? (
                                            <img
                                              src={hist.imageUrl}
                                              alt={hist.title}
                                              className="w-10 h-8 object-cover rounded border bg-neutral-200 bg-white"
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : (
                                            <div className="w-10 h-8 rounded bg-gray-100 flex items-center justify-center text-[7px] text-gray-400">No Img</div>
                                          )}
                                          <div className="flex-1 space-y-1">
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const result = await compressImage(file, 1000, 700, 0.75);
                                                handleUpdateHistoryItem(hist.id, 'imageUrl', result);
                                              }}
                                              className="w-full text-[9px] text-gray-500 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                                            />
                                            <input
                                              type="text"
                                              value={hist.imageUrl}
                                              onChange={(e) => handleUpdateHistoryItem(hist.id, 'imageUrl', e.target.value)}
                                              className="w-full text-[9px] rounded border border-neutral-300 p-0.5 font-mono"
                                              placeholder="Atau URL..."
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="sm:col-span-3 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setEditingHistId(null)}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[8.5px] px-2.5 py-1 rounded shadow-sm"
                                        >
                                          Selesai Edit
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-3 text-left items-start">
                                      {hist.imageUrl ? (
                                        <img
                                          src={hist.imageUrl}
                                          alt={hist.title}
                                          className="w-20 h-14 object-cover rounded border bg-neutral-200 shrink-0"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className="w-20 h-14 bg-neutral-100 rounded border flex items-center justify-center text-[8px] text-gray-300 font-mono shrink-0">No Image</div>
                                      )}
                                      <div className="space-y-0.5 flex-1 min-w-0">
                                        <h6 className="text-[11px] font-bold text-[#0b2240] leading-tight select-text">{hist.title}</h6>
                                        <p className="text-[10px] text-gray-500 font-sans leading-normal whitespace-pre-wrap select-text">{hist.description}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* CERTIFICATE DESIGN & SIGNATURE SETTINGS */}
                <div className="mt-6 border-t border-dashed pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[#a18241]" />
                    <h5 className="font-serif text-sm font-bold text-[#0b2240]">Konfigurasi Desain Piagam Sertifikat & Tanda Tangan</h5>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Kelola logo resmi lembaga, tanda tangan penanggung jawab (Master Trainer), serta visual tema sertifikat kompetensi digital yang dapat di-download oleh anggota mitra berstatus <strong>"Disetujui/Selesai"</strong>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Signer Name & Title & Date */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Nama Penandatangan Sertifikat:</label>
                        <input
                          type="text"
                          value={certSignName}
                          onChange={(e) => setCertSignName(e.target.value)}
                          className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                          placeholder="e.g. Drs. Eddy Sudarmadji MM.,MBA"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Jabatan / Gelar Penandatangan:</label>
                        <input
                          type="text"
                          value={certSignRole}
                          onChange={(e) => setCertSignRole(e.target.value)}
                          className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                          placeholder="e.g. Lead Master Trainer & Founder"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Tanggal Penerbitan Sertifikat:</label>
                        <input
                          type="text"
                          value={certIssueDate}
                          onChange={(e) => setCertIssueDate(e.target.value)}
                          className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold"
                          placeholder="e.g. 14 Juni 2026"
                        />
                      </div>
                    </div>

                    {/* Logo & Signature Uploads */}
                    <div className="space-y-3 bg-neutral-50/80 p-3 rounded-xl border border-neutral-200">
                      <div>
                        <label className="block text-[10px] font-serif font-bold text-[#0b2240] mb-0.5">
                          Upload File Logo Kustom JATC (Kiri):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cert-logo')}
                          className="w-full text-[10px] cursor-pointer text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#0b2240] file:text-white hover:file:bg-[#0b2240]/80"
                        />
                        {certLogoUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <img src={certLogoUrl} alt="Logo JATC Preview" className="h-6 object-contain bg-white border p-1 rounded" />
                            <button
                              type="button"
                              onClick={() => setCertLogoUrl('')}
                              className="text-[9px] text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic block mt-0.5">Logogram JATC Standard (Default)</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-serif font-bold text-[#0b2240] mb-0.5">
                          Upload File Logo Brand Pendamping (Kanan Atas):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cert-right-logo')}
                          className="w-full text-[10px] cursor-pointer text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#0b2240] file:text-white hover:file:bg-[#0b2240]/80"
                        />
                        {certRightLogoUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <img src={certRightLogoUrl} alt="Right Logo Preview" className="h-6 object-contain bg-white border p-1 rounded" />
                            <button
                              type="button"
                              onClick={() => setCertRightLogoUrl('')}
                              className="text-[9px] text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic block mt-0.5">Tidak ada logo brand kanan atas (kosong)</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-serif font-bold text-[#0b2240] mb-0.5">
                          Upload File Tanda Tangan (Basah/Digital):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cert-signature')}
                          className="w-full text-[10px] cursor-pointer text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#0b2240] file:text-white hover:file:bg-[#0b2240]/80"
                        />
                        {certSignUrl ? (
                          <div className="mt-1 flex items-center gap-2">
                            <img src={certSignUrl} alt="Signature Preview" className="h-6 object-contain bg-white border p-1 rounded" />
                            <button
                              type="button"
                              onClick={() => setCertSignUrl('')}
                              className="text-[9px] text-red-500 hover:underline font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic block mt-0.5">Bila kosong, tanda tangan berupa nama penandatangan</span>
                        )}
                      </div>
                    </div>

                    {/* Background Styles & Theme Option */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">Pola Desain Latar Belakang (Soft Abstrak):</label>
                        <select
                          value={certBgStyle}
                          onChange={(e) => setCertBgStyle(e.target.value)}
                          className="w-full text-xs rounded-lg border border-neutral-300 p-2 focus:border-brand-gold bg-white"
                        >
                          <option value="abstract-soft">🌌 Soft Abstract Marble Grey & Gold (Aesthetic)</option>
                          <option value="classic-navy">💎 Royal Classic Emerald Teal & Navy (Formal)</option>
                          <option value="vintage-gold">📜 Vintage Classic Cream & Double Border Gold (Sangat Elegan)</option>
                          <option value="modern-minimalist">◽ Lux Minimalist Clean Card (Modern)</option>
                        </select>
                      </div>

                      <div className="p-3 bg-[#a18241]/5 rounded-xl border border-[#a18241]/20">
                        <span className="text-[#a18241] font-mono text-[9px] font-bold block uppercase mb-1">💡 Petunjuk Cetak:</span>
                        <p className="text-[9px] text-gray-500 leading-normal">
                          Gunakan opsi "Print Background Graphics" pada menu print browser Anda saat menyimpan PDF agar garis border abstrak dan tanda tangan tercetak dengan presisi maksimal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    onClick={handleSavePageConfig}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg text-xs font-bold font-sans shadow cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Perubahan Beranda
                  </button>
                </div>
              </div>
            )}

            {subTab === 'members' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-brand-blue">Daftar Hasil Registrasi Anggota Baru ({members.length})</h4>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">Saring pendaftar berdasarkan pilihan Sesi Webinar mereka.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      disabled={members.length === 0}
                      className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50 font-sans cursor-pointer font-semibold shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Ekspor File Excel CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      disabled={members.length === 0}
                      className="inline-flex items-center gap-1 border hover:bg-neutral-100 text-gray-700 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50 font-sans cursor-pointer font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak Lembar Pendaftar
                    </button>
                  </div>
                </div>

                {/* Sesi Webinar Filter Dropdown */}
                <div className="flex flex-wrap items-center bg-neutral-100/60 p-3 rounded-xl border border-neutral-200/50 gap-2.5 text-xs text-neutral-800 font-sans">
                  <span className="font-mono font-bold text-[10px] text-brand-gold uppercase tracking-wider shrink-0">FILTER SARI SESI:</span>
                  <select
                    value={selectedSessionFilter}
                    onChange={(e) => setSelectedSessionFilter(e.target.value)}
                    className="bg-white border rounded p-1.5 outline-none text-xs focus:border-[#a18241] min-w-[200px]"
                  >
                    <option value="Semua Sesi">Semua Kelas / Sesi Webinar (Tanpa Filter)</option>
                    {Array.from(new Set([
                      ...sessions.map(s => s.title),
                      ...members.map(m => m.selectedSession)
                    ])).filter(Boolean).map(sessTitle => (
                      <option key={sessTitle} value={sessTitle}>{sessTitle}</option>
                    ))}
                    {members.some(m => !m.selectedSession) && (
                      <option value="">Belajar Mandiri 🌿</option>
                    )}
                  </select>
                  <span className="text-[10px] text-gray-400">
                    Menampilkan: <strong className="text-brand-blue">{members.filter(m => selectedSessionFilter === 'Semua Sesi' || m.selectedSession === selectedSessionFilter).length}</strong> dari {members.length} Anggota JATC
                  </span>
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-sans text-xs italic">
                    Belum ada anggota baru yang melakukan pendaftaran.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-100/80 border-b text-gray-500 font-mono uppercase tracking-wider">
                          <th className="p-2.5">Nama & Detail Pribadi</th>
                          <th className="p-2.5">Institusi & Pekerjaan</th>
                          <th className="p-2.5">No. Telp / Email / Rumah</th>
                          <th className="p-2.5">Sesi Pilihan</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-center">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-sans">
                        {members
                          .filter(member => selectedSessionFilter === 'Semua Sesi' || member.selectedSession === selectedSessionFilter)
                          .map(member => (
                            <tr key={member.id} className="hover:bg-neutral-50/50">
                              <td className="p-2.5 space-y-1">
                                <div className="font-bold text-brand-blue">{member.name}</div>
                                <div className="text-[10px] text-gray-500">
                                  {member.gender} • {member.birthPlace}, {member.birthDate} • {member.religion}
                                </div>
                                <div className="text-[9px] text-gray-400 font-mono">Daftar: {member.registeredAt}</div>
                              </td>
                              <td className="p-2.5 space-y-0.5">
                                <div className="font-medium text-neutral-800">{member.institution}</div>
                                <div className="text-[10px] text-gray-500 italic">{member.profession}</div>
                              </td>
                              <td className="p-2.5 space-y-1">
                                <div className="font-mono text-neutral-700">{member.phone}</div>
                                <div className="text-gray-500">{member.email}</div>
                                <div className="text-[10px] text-gray-400 line-clamp-1" title={member.address}>{member.address}</div>
                              </td>
                              <td className="p-2.5 font-medium text-brand-blue">
                                {member.selectedSession || 'Belajar Mandiri 🌿'}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  member.status === 'Selesai' ? 'bg-green-100 text-green-800' : 
                                  member.status === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {member.status === 'Selesai' ? 'Approved' : member.status === 'Ditolak' ? 'Rejected' : 'Pending'}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                  {/* Quick Toggle Certificate */}
                                  <label 
                                    className="inline-flex items-center gap-1 px-1.5 py-1 bg-neutral-150/70 hover:bg-amber-50 text-neutral-600 hover:text-amber-900 rounded text-[9px] font-bold cursor-pointer transition-all border border-neutral-300 select-none shadow-xs"
                                    title="Centang untuk meluluskan & menerbitkan sertifikat kompetensi resmi langsung"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!!member.isCertificateApproved}
                                      onChange={() => {
                                        const nextApproved = !member.isCertificateApproved;
                                        const updated = members.map(m => m.id === member.id ? { 
                                          ...m, 
                                          isCertificateApproved: nextApproved, 
                                          status: nextApproved ? 'Selesai' as const : m.status 
                                        } : m);
                                        setMembers(updated);
                                      }}
                                      className="rounded text-[#0b2240] focus:ring-[#0b2240] w-3 h-3 cursor-pointer"
                                    />
                                    <span>Cert 🏆</span>
                                  </label>

                                  {/* Edit Button */}
                                  <button
                                    title="Edit Informasi Anggota"
                                    onClick={() => setEditingMember(member)}
                                    className="p-1 text-slate-600 hover:text-brand-gold hover:bg-neutral-100 rounded transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {member.status === 'Pending' && (
                                    <>
                                      <button
                                        title="Setujui Anggota"
                                        onClick={() => handleApproveMember(member.id)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        title="Tolak Anggota"
                                        onClick={() => handleRejectMember(member.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    title="Hapus Dari Database"
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* EDIT DIALOG MODAL OVERLAY */}
                {editingMember && (
                  <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs flex flex-col max-h-[85vh] text-[#0b2240]">
                      <div className="flex justify-between items-center border-b pb-2.5">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#a18241]" />
                          <h4 className="font-serif text-base font-bold text-brand-blue">
                            Sunting Data Registrasi: {editingMember.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingMember(null)}
                          className="text-neutral-400 hover:text-neutral-600 font-sans font-bold"
                        >
                          ✕ Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1 flex-1 py-1">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Nama Lengkap:</label>
                          <input
                            type="text"
                            value={editingMember.name}
                            onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Email:</label>
                          <input
                            type="email"
                            value={editingMember.email}
                            onChange={e => setEditingMember({...editingMember, email: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">No. Telp (WhatsApp):</label>
                          <input
                            type="text"
                            value={editingMember.phone}
                            onChange={e => setEditingMember({...editingMember, phone: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Password Akun:</label>
                          <input
                            type="text"
                            value={editingMember.password || ''}
                            onChange={e => setEditingMember({...editingMember, password: e.target.value})}
                            placeholder="e.g. Rahasia123"
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Sesi Pilihan:</label>
                          <select
                            value={editingMember.selectedSession}
                            onChange={e => setEditingMember({...editingMember, selectedSession: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none bg-white"
                          >
                            <option value="">Belajar Mandiri</option>
                            {Array.from(new Set([
                              ...sessions.map(s => s.title),
                              ...members.map(m => m.selectedSession)
                            ])).filter(Boolean).map(sessTitle => (
                              <option key={sessTitle} value={sessTitle}>{sessTitle}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Status Keanggotaan:</label>
                          <select
                            value={editingMember.status}
                            onChange={e => {
                              const newStatus = e.target.value as any;
                              setEditingMember({
                                ...editingMember,
                                status: newStatus,
                                isCertificateApproved: newStatus === 'Selesai' ? editingMember.isCertificateApproved : false
                              });
                            }}
                            className="w-full rounded border p-2 text-xs font-sans font-bold focus:border-[#a18241] outline-none bg-white text-brand-blue"
                          >
                            <option value="Pending">Pending (Menunggu Persetujuan)</option>
                            <option value="Selesai">Selesai (Approved / Terpilih)</option>
                            <option value="Ditolak">Ditolak (Rejected)</option>
                          </select>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0b2240] text-xs">
                            <input
                              type="checkbox"
                              checked={!!editingMember.isCertificateApproved}
                              onChange={e => {
                                const checked = e.target.checked;
                                setEditingMember({
                                  ...editingMember,
                                  isCertificateApproved: checked,
                                  status: checked ? 'Selesai' : editingMember.status
                                });
                              }}
                              className="rounded border-neutral-300 text-brand-blue focus:ring-[#0b2240] w-3.5 h-3.5 cursor-pointer animate-pulse"
                            />
                            <span>Terbitkan Sertifikat Kompetensi Resmi 🏆</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Jenis Kelamin:</label>
                          <select
                            value={editingMember.gender}
                            onChange={e => setEditingMember({...editingMember, gender: e.target.value as any})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none bg-white"
                          >
                            <option value="Laki-Laki">Laki-Laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Agama:</label>
                          <select
                            value={editingMember.religion}
                            onChange={e => setEditingMember({...editingMember, religion: e.target.value as any})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none bg-white"
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
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Tempat Lahir:</label>
                          <input
                            type="text"
                            value={editingMember.birthPlace}
                            onChange={e => setEditingMember({...editingMember, birthPlace: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Tanggal Lahir:</label>
                          <input
                            type="date"
                            value={editingMember.birthDate}
                            onChange={e => setEditingMember({...editingMember, birthDate: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Institusi:</label>
                          <input
                            type="text"
                            value={editingMember.institution}
                            onChange={e => setEditingMember({...editingMember, institution: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Pekerjaan:</label>
                          <input
                            type="text"
                            value={editingMember.profession}
                            onChange={e => setEditingMember({...editingMember, profession: e.target.value})}
                            className="w-full rounded border p-2 text-xs font-sans focus:border-[#a18241] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Alamat Rumah Lengkap:</label>
                          <textarea
                            value={editingMember.address}
                            onChange={e => setEditingMember({...editingMember, address: e.target.value})}
                            className="w-full rounded border p-2 text-xs h-16 font-sans resize-y focus:border-[#a18241] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3.5 border-t">
                        <button
                          type="button"
                          onClick={() => setEditingMember(null)}
                          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl text-xs font-semibold font-sans cursor-pointer transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingMember.name || !editingMember.email) {
                              alert('Nama dan Email wajib diisi!');
                              return;
                            }
                            setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
                            setEditingMember(null);
                            alert('Data anggota JATC berhasil diperbarui!');
                          }}
                          className="px-4 py-2 bg-brand-blue hover:bg-[#0b2240]/95 text-white font-bold rounded-xl text-xs font-sans cursor-pointer transition-all shadow-md"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {subTab === 'lms' && (
              <div className="space-y-6">
                <div className="border-b pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h4 className="font-serif text-base font-bold text-brand-blue">Kelola Materi Kurikulum LMS</h4>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">Tambah, edit, dan hapus seluruh materi modul kurikulum mandiri interaktif JATC yang tampil di portal pembelajaran.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-brand-blue/10 rounded text-[9px] font-bold font-mono text-brand-blue shrink-0 max-w-max">
                    Total: {lmsModules.length} Modul Aktif
                  </span>
                </div>

                {/* Grid list of LMS Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lmsModules.map(mod => {
                    const isModEditing = editingLMS && editingLMS.id === mod.id;
                    return (
                      <div 
                        key={mod.id} 
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isModEditing 
                            ? 'bg-amber-50/70 border-amber-300 shadow-sm' 
                            : 'bg-neutral-50/80 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {isModEditing ? (
                          /* Inline LMS Edit Form */
                          <form 
                            onSubmit={handleUpdateLMS}
                            className="space-y-3 text-xs w-full text-left"
                          >
                            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono flex items-center justify-between border-b pb-1">
                              <span>✏️ Sedang Diubah: {mod.title}</span>
                              <button 
                                type="button" 
                                onClick={() => setEditingLMS(null)}
                                className="text-gray-400 hover:text-gray-600 font-sans normal-case font-semibold"
                              >
                                Batal
                              </button>
                            </div>
                            
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Judul Materi:</label>
                              <input 
                                type="text"
                                required
                                value={editingLMS.title}
                                onChange={e => setEditingLMS({ ...editingLMS, title: e.target.value })}
                                className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs text-brand-blue font-semibold outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Tipe Media:</label>
                                <select 
                                  value={editingLMS.type}
                                  onChange={e => setEditingLMS({ ...editingLMS, type: e.target.value as any })}
                                  className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs outline-none"
                                >
                                  <option value="pdf">📄 PDF Dokumen</option>
                                  <option value="video">🎥 Kelas Video</option>
                                  <option value="audio">🎧 Sesi Audio</option>
                                  <option value="link">🔗 Link Eksternal</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Durasi / Halaman:</label>
                                <input 
                                  type="text"
                                  value={editingLMS.durationOrPages}
                                  onChange={e => setEditingLMS({ ...editingLMS, durationOrPages: e.target.value })}
                                  placeholder="e.g. 15 Halaman / 45 Menit"
                                  className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Kategori Materi:</label>
                                <input 
                                  type="text"
                                  value={editingLMS.category}
                                  onChange={e => setEditingLMS({ ...editingLMS, category: e.target.value })}
                                  placeholder="e.g. Kurikulum Inti"
                                  className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Rujukan Goal:</label>
                                <input 
                                  type="text"
                                  value={editingLMS.goalReference}
                                  onChange={e => setEditingLMS({ ...editingLMS, goalReference: e.target.value })}
                                  placeholder="e.g. Goal #1 s/d #3"
                                  className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">URL Sumber (File/Video Link):</label>
                              <input 
                                type="text"
                                required
                                value={editingLMS.fileUrl}
                                onChange={e => setEditingLMS({ ...editingLMS, fileUrl: e.target.value })}
                                className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs font-mono text-gray-650 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-0.5">Deskripsi Singkat:</label>
                              <textarea 
                                value={editingLMS.description}
                                onChange={e => setEditingLMS({ ...editingLMS, description: e.target.value })}
                                className="w-full bg-white rounded border border-neutral-300 p-1.5 text-xs h-12 resize-none outline-none"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button 
                                type="button" 
                                onClick={() => setEditingLMS(null)}
                                className="px-3 py-1.5 bg-neutral-200 text-neutral-700 hover:bg-neutral-300 rounded font-sans font-semibold text-[10px]"
                              >
                                Batal
                              </button>
                              <button 
                                type="submit"
                                className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded font-sans text-[10px]"
                              >
                                Simpan Perubahan
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Standard View Card of LMS Item */
                          <>
                            <div className="space-y-1.5 flex-1 text-left">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="px-2 py-0.5 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-[8px] font-mono font-bold uppercase rounded">
                                  {mod.category || 'Materi JATC'}
                                </span>
                                <span className="text-[10px] text-brand-gold font-mono font-bold leading-none shrink-0 flex items-center gap-1">
                                  {mod.type === 'pdf' ? '📄 PDF' : mod.type === 'video' ? '🎥 VIDEO' : mod.type === 'audio' ? '🎧 AUDIO' : '🔗 LINK'} 
                                  <span className="text-gray-400 font-normal">({mod.durationOrPages})</span>
                                </span>
                              </div>
                              <h5 className="font-serif text-sm font-bold text-[#0b2240] leading-snug">{mod.title}</h5>
                              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{mod.description}</p>
                              
                              <div className="flex flex-wrap gap-2 text-[9px] text-gray-400 font-sans">
                                <span>🎯 Rujukan: <strong className="text-gray-650 font-bold">{mod.goalReference}</strong></span>
                                <span className="break-all">• Url: <strong className="font-mono text-[8px] text-brand-blue hover:underline bg-neutral-100 px-1 py-0.5 rounded">{mod.fileUrl}</strong></span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-dashed border-neutral-200/60 flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingLMS({ ...mod })}
                                className="p-1 px-2.5 bg-white hover:bg-blue-50 text-brand-blue border border-neutral-200 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLMS(mod.id)}
                                className="p-1.5 bg-white hover:bg-red-50 hover:text-red-700 text-neutral-400 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {lmsModules.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-gray-400 font-sans text-xs italic">
                      Belum ada materi pembelajaran ditambahkan ke kurikulum lms.
                    </div>
                  )}
                </div>

                {/* Form to Create New LMS Module */}
                {!editingLMS && (
                  <form 
                    onSubmit={handleAddLMS} 
                    className="bg-neutral-50/50 p-4 rounded-xl border border-dashed text-xs space-y-4 shadow-sm text-left"
                  >
                    <div className="text-xs font-bold text-[#0b2240] uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand-gold animate-bounce" /> Tambah Materi Kurikulum Baru:
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Judul Materi:</label>
                        <input 
                          type="text"
                          required
                          value={newLmsTitle}
                          onChange={e => setNewLmsTitle(e.target.value)}
                          placeholder="e.g. Pola Berpikir Spatial SVO"
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs outline-none focus:border-[#a18241]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Tipe Lampiran Media:</label>
                        <select 
                          value={newLmsType}
                          onChange={e => setNewLmsType(e.target.value as any)}
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs outline-none focus:border-[#a18241]"
                        >
                          <option value="pdf">📄 PDF Dokumen</option>
                          <option value="video">🎥 Kelas Video Youtube/Drive</option>
                          <option value="audio">🎧 Sesi Audio Podcast</option>
                          <option value="link">🔗 Link Eksternal Web</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Durasi / Jumlah Halaman:</label>
                        <input 
                          type="text"
                          value={newLmsDuration}
                          onChange={e => setNewLmsDuration(e.target.value)}
                          placeholder="e.g. 15 Halaman / 40 Menit"
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs outline-none focus:border-[#a18241]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Kategori Kurikulum:</label>
                        <input 
                          type="text"
                          value={newLmsCat}
                          onChange={e => setNewLmsCat(e.target.value)}
                          placeholder="e.g. Kurikulum Inti JATC"
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs outline-none focus:border-[#a18241]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Mengacu ke Goal Nomor Berapa:</label>
                        <input 
                          type="text"
                          value={newLmsGoal}
                          onChange={e => setNewLmsGoal(e.target.value)}
                          placeholder="e.g. Goal #1 s/d #3"
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs outline-none focus:border-[#a18241]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">URL Link File Sumber (Lengkap):</label>
                        <input 
                          type="text"
                          required
                          value={newLmsFileUrl}
                          onChange={e => setNewLmsFileUrl(e.target.value)}
                          placeholder="e.g. https://domain.com/file.pdf"
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs font-mono outline-none focus:border-[#a18241]"
                        />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono mb-1">Deskripsi Ringkas Pembelajaran:</label>
                        <textarea 
                          value={newLmsDesc}
                          onChange={e => setNewLmsDesc(e.target.value)}
                          placeholder="Tuliskan petunjuk pembelajaran mandiri untuk modul kurikulum ini..."
                          className="w-full rounded bg-white border border-neutral-250 p-2 text-xs h-16 resize-y outline-none focus:border-[#a18241]"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-[#0b2240] text-white rounded text-xs font-bold font-sans shadow cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Terbitkan Modul Kurikulum Baru
                    </button>
                  </form>
                )}
              </div>
            )}

            {subTab === 'sessions' && (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h4 className="font-serif text-base font-bold text-brand-blue">Kelola Jadwal / Sesi Kursus Mandiri</h4>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">Edit atau hapus jadwal webinar belajar aktif yang digunakan oleh calon anggota baru untuk mendaftar.</p>
                </div>

                {/* Schedule list */}
                <div className="space-y-3">
                  {sessions.map(sess => {
                    const isEditing = editingSession && editingSession.id === sess.id;
                    return (
                      <div key={sess.id} className={`flex flex-col sm:flex-row justify-between sm:items-center p-3.5 rounded-xl border transition-all ${
                        isEditing 
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm' 
                          : 'bg-neutral-50 border-neutral-150 hover:bg-neutral-100/50'
                      }`}>
                        {isEditing ? (
                          /* Inline Editing Form */
                          <div className="flex-1 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 text-xs w-full font-sans">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2.5 text-left font-sans">
                              <div>
                                <label className="block text-[8px] font-bold text-amber-800 uppercase font-mono mb-0.5">Nama Sesi:</label>
                                <input
                                  type="text"
                                  value={editingSession.title}
                                  onChange={e => setEditingSession({...editingSession, title: e.target.value})}
                                  className="w-full rounded bg-white border border-neutral-300 p-1.5 text-xs font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-amber-800 uppercase font-mono mb-0.5">Hari & Jam Sesi:</label>
                                <input
                                  type="text"
                                  value={editingSession.dateTime}
                                  onChange={e => setEditingSession({...editingSession, dateTime: e.target.value})}
                                  className="w-full rounded bg-white border border-neutral-300 p-1.5 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-amber-800 uppercase font-mono mb-0.5">Master Trainer:</label>
                                <input
                                  type="text"
                                  value={editingSession.instructor}
                                  onChange={e => setEditingSession({...editingSession, instructor: e.target.value})}
                                  className="w-full rounded bg-white border border-neutral-300 p-1.5 text-xs"
                                />
                              </div>
                              <div className="flex flex-col justify-center">
                                <label className="block text-[8px] font-bold text-amber-800 uppercase font-mono mb-0.5">Tindakan Sesi:</label>
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-[#0b2240] h-full pt-1.5">
                                  <input
                                    type="checkbox"
                                    checked={!!editingSession.isCertificateIssued}
                                    onChange={e => setEditingSession({...editingSession, isCertificateIssued: e.target.checked})}
                                    className="rounded border-neutral-300 text-[#0b2240] focus:ring-[#0b2240] w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span>Terbit Sertifikat 🏆</span>
                                </label>
                              </div>
                              <div className="flex flex-col justify-center">
                                <label className="block text-[8px] font-bold text-amber-800 uppercase font-mono mb-0.5">Rujukan Sesi Lanjutan:</label>
                                <div className="space-y-1">
                                  <label className="inline-flex items-center gap-1 cursor-pointer text-[9px] font-bold text-amber-700">
                                    <input
                                      type="checkbox"
                                      checked={!!editingSession.isWebinarSequence}
                                      onChange={e => setEditingSession({...editingSession, isWebinarSequence: e.target.checked, webinarSequenceLabel: e.target.checked ? (editingSession.webinarSequenceLabel || 'Webinar ke-2') : undefined})}
                                      className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>Sesi Lanjutan</span>
                                  </label>
                                  {editingSession.isWebinarSequence && (
                                    <select
                                      value={editingSession.webinarSequenceLabel || 'Webinar ke-2'}
                                      onChange={e => setEditingSession({...editingSession, webinarSequenceLabel: e.target.value})}
                                      className="rounded border border-neutral-300 p-1 text-[9px] bg-white outline-none w-full cursor-pointer"
                                    >
                                      <option value="Webinar ke-2">Webinar ke-2</option>
                                      <option value="Webinar ke-3">Webinar ke-3</option>
                                      <option value="Webinar ke-4">Webinar ke-4</option>
                                      <option value="Webinar ke-5">Webinar ke-5</option>
                                      <option value="Webinar ke-6">Webinar ke-6</option>
                                      <option value="Sesi Ekstra & Simulasi">Sesi Ekstra & Simulasi</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 shrink-0 pt-2 sm:pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editingSession.title.trim() || !editingSession.dateTime.trim()) {
                                    alert('Judul dan waktu sesi wajib diisi.');
                                    return;
                                  }
                                  setSessions(sessions.map(s => s.id === editingSession.id ? editingSession : s));
                                  setEditingSession(null);
                                  alert('Sesi berhasil diperbarui!');
                                }}
                                className="px-2.5 py-1.5 bg-green-700 text-white rounded-lg text-[10px] font-bold hover:bg-green-800 transition-all cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSession(null)}
                                className="px-2.5 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg text-[10px] hover:bg-neutral-300 transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Row Display */
                          <>
                            <div className="space-y-0.5 text-left flex-1">
                              <div className="font-bold text-xs text-brand-blue flex flex-wrap items-center gap-2">
                                <span>{sess.title}</span>
                                {sess.isCertificateIssued ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-bold font-mono rounded flex items-center gap-0.5 border border-emerald-300 shadow-sm">
                                    🏆 Terbit Sertifikat (Bisa Download)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-400 text-[8px] font-bold font-mono rounded flex items-center gap-0.5 border border-neutral-200">
                                    ⏳ Sertifikat Belum Diterbitkan
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 font-sans">
                                Jadwal: <strong className="text-neutral-700">{sess.dateTime}</strong> • Pengampu Master: <strong className="text-brand-gold">{sess.instructor}</strong>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0 justify-end">
                              {/* Quick toggle check for Terbit Sertifikat */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSess: LearningSession = { ...sess, isCertificateIssued: !sess.isCertificateIssued };
                                  setSessions(sessions.map(s => s.id === sess.id ? updatedSess : s));
                                  alert(`Sertifikat kepesertaan untuk "${sess.title}" berhasil ${!sess.isCertificateIssued ? 'DITERBITKAN! Peserta pendaftar sesi ini kini dapat mengakses, melihat, dan mencetak piagam sertifikat kelulusan digital mereka.' : 'DIBATALKAN.'}`);
                                }}
                                className={`px-2 py-1 py-1.5 rounded-lg border text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  sess.isCertificateIssued
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-neutral-100/60 text-neutral-500 border-neutral-200 hover:bg-neutral-200/50'
                                }`}
                                title="Klik untuk menerbitkan atau membatalkan rilis sertifikat untuk peserta sesi ini"
                              >
                                {sess.isCertificateIssued ? '✅ Terbit Aktif' : '☑️ Terbitkan Sertifikat'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingSession(sess)}
                                className="p-1 px-2.5 bg-white hover:bg-blue-50 text-brand-blue border border-neutral-200 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                                title="Edit Sesi"
                              >
                                <Edit3 className="w-3 w-3" /> Sunting
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSession(sess.id)}
                                className="p-1.5 bg-white hover:bg-red-50 hover:text-red-700 text-neutral-400 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                                title="Hapus Jadwal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Create Session Form */}
                <form onSubmit={handleAddSession} className="bg-neutral-50/50 p-4 rounded-xl border border-dashed text-xs space-y-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Tambah Jadwal Sesi Pembelajaran Baru:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Nama / Label Sesi:</label>
                      <input
                        type="text"
                        required
                        value={newSessTitle}
                        onChange={(e) => setNewSessTitle(e.target.value)}
                        placeholder="e.g. Sesi D: Kelas Malam"
                        className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Hari & Jam Sesi:</label>
                      <input
                        type="text"
                        required
                        value={newSessTime}
                        onChange={(e) => setNewSessTime(e.target.value)}
                        placeholder="e.g. Kamis, Jam 19:30 WIB"
                        className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Pengampu Master Trainer:</label>
                      <input
                        type="text"
                        value={newSessInstructor}
                        onChange={(e) => setNewSessInstructor(e.target.value)}
                        className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                      />
                    </div>
                    <div className="flex flex-col justify-center pl-1 space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-0.5">Pilihan Tindakan Sesi:</label>
                      <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#0b2240] text-[11px]">
                          <input
                            type="checkbox"
                            checked={newSessIsCertIssued}
                            onChange={(e) => setNewSessIsCertIssued(e.target.checked)}
                            className="rounded border-neutral-300 text-[#0b2240] focus:ring-[#0b2240] w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Menerbitkan Sertifikat 🏆</span>
                        </label>

                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-amber-650 text-[11px]">
                          <input
                            type="checkbox"
                            checked={newSessIsWebinarSeq}
                            onChange={(e) => setNewSessIsWebinarSeq(e.target.checked)}
                            className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Tandai Sebagai Sesi Lanjutan 📅</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {newSessIsWebinarSeq && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl animate-fadeIn text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-800 uppercase font-mono mb-1">Pilih Label Sesi Lanjutan:</label>
                        <select
                          value={newSessWebinarSeqLabel}
                          onChange={(e) => setNewSessWebinarSeqLabel(e.target.value)}
                          className="w-full rounded bg-white border border-amber-300 p-2 text-xs text-amber-900 outline-none"
                        >
                          <option value="Webinar ke-2">Webinar ke-2 (Sesi Lanjutan)</option>
                          <option value="Webinar ke-3">Webinar ke-3 (Sesi Lanjutan)</option>
                          <option value="Webinar ke-4">Webinar ke-4 (Sesi Lanjutan)</option>
                          <option value="Webinar ke-5">Webinar ke-5 (Sesi Lanjutan)</option>
                          <option value="Webinar ke-6">Webinar ke-6 (Sesi Lanjutan)</option>
                          <option value="Sesi Ekstra & Simulasi">Sesi Ekstra & Simulasi</option>
                        </select>
                      </div>
                      <div className="flex items-center text-[10px] text-amber-700 leading-relaxed pt-3">
                        Sesi ditandai sebagai kelanjutan pembelajaran utama. Catatan ini akan otomatis dirujuk ke menu "Informasi Webinar & Live" peserta di dashboard.
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-white rounded text-xs font-sans font-bold cursor-pointer hover:bg-brand-blue/90 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Daftarkan Jadwal Baru
                  </button>
                </form>
              </div>
            )}

            {subTab === 'articles' && (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h4 className="font-serif text-base font-bold text-brand-blue">Kelola Tips & Artikel Pembelajaran</h4>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">Tulis, edit, dan perbarui artikel tips serta modul pembelajaran JATC lengkap dengan lampiran konten eksternal.</p>
                </div>

                {/* Article Form (Toggle Add vs Edit) */}
                {editingArticle ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateArticle(e);
                    }} 
                    className="bg-amber-50/50 p-4 rounded-xl border border-amber-300 text-xs space-y-4 shadow-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-amber-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Artikel: <span className="text-brand-blue normal-case">{editingArticle.title}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEditingArticle(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold"
                      >
                        ✕ Batalkan Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Judul Artikel:</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.title}
                          onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs focus:border-[#a18241]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Kategori Bahasan:</label>
                        <select
                          value={editingArticle.category}
                          onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs"
                        >
                          <option value="Psikologi Belajar">Psikologi Belajar</option>
                          <option value="Pola Pikir">Pola Pikir</option>
                          <option value="16 Tenses Hub">16 Tenses Hub</option>
                          <option value="Sertifikasi Guru">Sertifikasi Guru</option>
                        </select>
                      </div>

                      {/* File Upload Mode */}
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Ganti Foto Sampul (Upload File):</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'article-edit')}
                          className="w-full text-[10px]"
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Atau gunakan URL gambar langsung di bawah:</span>
                        <input
                          type="text"
                          value={editingArticle.imageUrl || ''}
                          onChange={(e) => setEditingArticle({...editingArticle, imageUrl: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs focus:border-[#a18241] mt-1"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>

                      {/* External Link & Video */}
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Tautan Web Berita Luar / YouTube Video:</label>
                        <input
                          type="text"
                          value={editingArticle.externalUrl || ''}
                          onChange={(e) => setEditingArticle({...editingArticle, externalUrl: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs focus:border-[#a18241]"
                          placeholder="e.g. https://www.youtube.com/watch?v=... / https://news.com"
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Tautkan link informasi tambahan atau video referensi pendukung.</span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Ringkasan Pendek:</label>
                        <input
                          type="text"
                          value={editingArticle.description}
                          onChange={(e) => setEditingArticle({...editingArticle, description: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs focus:border-[#a18241]"
                          placeholder="e.g. Cara cepat mengatasi ketakutan salah grammatical..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Konten Lengkap:</label>
                        <textarea
                          required
                          value={editingArticle.content}
                          onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs h-28 focus:border-[#a18241]"
                          placeholder="Tulis artikel tips selengkapnya..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold font-sans cursor-pointer hover:bg-green-800 shadow"
                      >
                        <Save className="w-3.5 h-3.5" /> Simpan Perubahan Artikel
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingArticle(null)}
                        className="px-3 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-300 transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Create New Article Form */
                  <form onSubmit={handleAddArticle} className="bg-neutral-50/50 p-4 rounded-xl border border-dashed border-neutral-300 text-xs space-y-4">
                    <div className="font-bold text-gray-500 uppercase tracking-widest font-mono">Buat Artikel Baru:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] text-gray-450 font-mono uppercase mb-1">Judul Artikel:</label>
                        <input
                          type="text"
                          required
                          value={newArtTitle}
                          onChange={(e) => setNewArtTitle(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs focus:border-[#a18241]"
                          placeholder="e.g. 5 Rahasia Berani Speak English Kontemporer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-455 font-mono uppercase mb-1">Kategori Bahasan:</label>
                        <select
                          value={newArtCategory}
                          onChange={(e) => setNewArtCategory(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                        >
                          <option value="Psikologi Belajar">Psikologi Belajar</option>
                          <option value="Pola Pikir">Pola Pikir</option>
                          <option value="16 Tenses Hub">16 Tenses Hub</option>
                          <option value="Sertifikasi Guru">Sertifikasi Guru</option>
                        </select>
                      </div>

                      {/* File Upload Mode */}
                      <div>
                        <label className="block text-[10px] text-gray-450 font-mono uppercase mb-1">Upload File Foto Utama (Image Sampul):</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'article-new')}
                          className="w-full text-[10px]"
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Atau masukkan URL gambar langsung di bawah:</span>
                        <input
                          type="text"
                          value={newArtImgUrl}
                          onChange={(e) => setNewArtImgUrl(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs focus:border-[#a18241] mt-1"
                          placeholder="e.g. https://images.unsplash.com/..."
                        />
                      </div>

                      {/* External Link & Video */}
                      <div>
                        <label className="block text-[10px] text-gray-450 font-mono uppercase mb-1">Tautan Web Berita Luar / YouTube Video:</label>
                        <input
                          type="text"
                          value={newArtExternalUrl}
                          onChange={(e) => setNewArtExternalUrl(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs focus:border-[#a18241]"
                          placeholder="e.g. https://www.youtube.com/watch?v=... / https://news.com"
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Hubungkan artikel ini dengan video YouTube atau halaman referensi eksternal.</span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-450 font-mono uppercase mb-1">Ringkasan Deskripsi:</label>
                        <input
                          type="text"
                          value={newArtDesc}
                          onChange={(e) => setNewArtDesc(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs focus:border-[#a18241]"
                          placeholder="e.g. Cara cepat mengatasi ketakutan salah grammatical..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-450 font-mono uppercase mb-1">Konten Lengkap:</label>
                        <textarea
                          required
                          value={newArtContent}
                          onChange={(e) => setNewArtContent(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs h-24 focus:border-[#a18241]"
                          placeholder="Tulis artikel tips selengkapnya..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold font-sans cursor-pointer shadow hover:bg-brand-blue/90"
                    >
                      <Plus className="w-3.5 h-3.5" /> Terbitkan Tips Pembelajaran
                    </button>
                  </form>
                )}

                {/* Article list table */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-500 uppercase font-mono">Daftar Terbitan Artikel:</div>
                  {articles.length === 0 ? (
                    <p className="text-xs italic text-gray-400">Belum ada artikel terbitan.</p>
                  ) : (
                    articles.map(art => (
                      <div key={art.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-100/50 transition-all">
                        <div className="flex items-center gap-3">
                          {art.imageUrl && (
                            <img src={art.imageUrl} alt="Cover" className="w-10 h-10 object-cover rounded-md border shrink-0 bg-neutral-100" />
                          )}
                          <div className="text-left">
                            <div className="font-bold text-xs text-brand-blue">{art.title}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-sans">
                              Tanggal: {art.date} | Kategori: <strong className="text-brand-gold">{art.category}</strong>
                              {art.externalUrl && <span className="ml-1 text-[9px] text-brand-blue/85 bg-blue-50 px-1 rounded">🔗 has link</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.25">
                          <button
                            onClick={() => setEditingArticle(art)}
                            className="p-1.5 bg-white hover:bg-blue-50 text-brand-blue rounded-lg border border-neutral-200 flex items-center justify-center cursor-pointer font-bold inline-flex text-[10px]"
                            title="Edit Artikel"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 bg-white hover:bg-red-50 hover:text-red-700 text-neutral-400 rounded-lg border border-neutral-200 flex items-center justify-center cursor-pointer"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {subTab === 'gallery' && (
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h4 className="font-serif text-base font-bold text-brand-blue">Kelola Galeri Media Dokumentasi</h4>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">Kelola foto dokumentasi, kelas online ZOOM, video YouTube, dan link referensi luar terkait JATC Indonesia.</p>
                </div>

                {editingGallery ? (
                  /* Edit Mode Form */
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateGallery(e);
                    }} 
                    className="bg-amber-50/50 p-4 rounded-xl border border-amber-300 text-xs space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-amber-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Media Galeri: <span className="text-brand-blue normal-case">{editingGallery.title}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setEditingGallery(null)}
                        className="text-gray-400 hover:text-gray-650 font-bold"
                      >
                        ✕ Batalkan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Nama / Caption Media:</label>
                        <input
                          type="text"
                          required
                          value={editingGallery.title}
                          onChange={(e) => setEditingGallery({...editingGallery, title: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Kategori Dokumentasi:</label>
                        <select
                          value={editingGallery.category}
                          onChange={(e) => setEditingGallery({...editingGallery, category: e.target.value as any})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs"
                        >
                          <option value="Pelatihan">Pelatihan</option>
                          <option value="ZOOM">ZOOM (Belajar Online)</option>
                          <option value="Sertifikasi">Sertifikasi</option>
                          <option value="Seminar">Seminar</option>
                          <option value="Dokumentasi">Dokumentasi</option>
                        </select>
                      </div>

                      {/* File Upload / Image URL */}
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Upload File Foto Baru:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'gallery-edit')}
                          className="w-full text-[10px]"
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Atau gunakan URL Gambar di bawah:</span>
                        <input
                          type="text"
                          value={editingGallery.imageUrl || ''}
                          onChange={(e) => setEditingGallery({...editingGallery, imageUrl: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs mt-1"
                        />
                      </div>

                      {/* External URL Link */}
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Link URL Dari Luar (Info Berita / Zoom Join):</label>
                        <input
                          type="text"
                          value={editingGallery.externalUrl || ''}
                          onChange={(e) => setEditingGallery({...editingGallery, externalUrl: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs"
                          placeholder="e.g. https://zoom.us/j/... / https://news.com"
                        />
                      </div>

                      {/* Video URL Link */}
                      <div>
                        <label className="block text-[10px] text-amber-800 font-mono uppercase mb-1">Link URL Video (YouTube):</label>
                        <input
                          type="text"
                          value={editingGallery.videoUrl || ''}
                          onChange={(e) => setEditingGallery({...editingGallery, videoUrl: e.target.value})}
                          className="w-full rounded bg-white border border-neutral-300 p-2 text-xs"
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold font-sans cursor-pointer hover:bg-green-800 shadow"
                      >
                        <Save className="w-3.5 h-3.5" /> Simpan Sampul Media
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGallery(null)}
                        className="px-3 py-2 bg-neutral-200 text-neutral-705 rounded-lg text-xs font-semibold hover:bg-neutral-300"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Create Gallery Form */
                  <form onSubmit={handleAddGallery} className="bg-neutral-50/50 p-4 rounded-xl border border-dashed border-neutral-300 text-xs space-y-4">
                    <div className="font-bold text-gray-500 uppercase tracking-widest font-mono">Daftarkan Dokumentasi Foto / Media Baru:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Nama / Caption Foto:</label>
                        <input
                          type="text"
                          required
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                          placeholder="e.g. Workshop Slipi JATC"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Kategori Dokumentasi:</label>
                        <select
                          value={newGalCat}
                          onChange={(e) => setNewGalCat(e.target.value as any)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                        >
                          <option value="Pelatihan">Pelatihan</option>
                          <option value="ZOOM">ZOOM (Belajar Online)</option>
                          <option value="Sertifikasi">Sertifikasi</option>
                          <option value="Seminar">Seminar</option>
                          <option value="Dokumentasi">Dokumentasi</option>
                        </select>
                      </div>

                      {/* File Upload / Image Link */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Upload File Foto Utama (Ganti URL):</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'gallery-new')}
                          className="w-full text-[10px]"
                        />
                        <span className="text-[9px] text-gray-450 mt-1 block">Atau gunakan URL Gambar di bawah:</span>
                        <input
                          type="text"
                          value={newGalImgUrl}
                          onChange={(e) => setNewGalImgUrl(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs mt-1"
                          placeholder="e.g. https://images.unsplash.com/..."
                        />
                      </div>

                      {/* Outer URL */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Link URL Dari Luar (Zoom Join / Berita):</label>
                        <input
                          type="text"
                          value={newGalExternalUrl}
                          onChange={(e) => setNewGalExternalUrl(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                          placeholder="e.g. https://us02web.zoom.us/j/..."
                        />
                      </div>

                      {/* Video URL */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Link Vidio (e.g. YouTube):</label>
                        <input
                          type="text"
                          value={newGalVideoUrl}
                          onChange={(e) => setNewGalVideoUrl(e.target.value)}
                          className="w-full rounded bg-white border border-neutral-200 p-2 text-xs"
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold font-sans cursor-pointer shadow hover:bg-brand-blue/90"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Foto Dokumentasi
                    </button>
                  </form>
                )}

                {/* Image listings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {gallery.length === 0 ? (
                    <p className="text-xs italic text-gray-400 p-2.5 col-span-4 text-center">Belum ada media dokumentasi terbit.</p>
                  ) : (
                    gallery.map(item => (
                      <div key={item.id} className="relative bg-neutral-100 rounded-lg group overflow-hidden border border-neutral-200 shadow-xs text-left">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-24 object-cover hover:scale-105 transition-all" />
                        ) : (
                          <div className="w-full h-24 bg-neutral-205 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                            No Img (Video Link Only)
                          </div>
                        )}
                        <div className="p-2 text-[10px] space-y-0.5">
                          <div className="font-bold font-sans truncate text-brand-blue" title={item.title}>{item.title}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono font-bold uppercase text-brand-gold">{item.category}</span>
                            <div className="flex gap-1">
                              {item.externalUrl && <span className="text-[8px] bg-blue-55 text-blue-800 px-1 rounded hover:underline" title={item.externalUrl}>🔗 Link</span>}
                              {item.videoUrl && <span className="text-[8px] bg-red-55 text-red-800 px-1 rounded hover:underline" title={item.videoUrl}>▶ Vid</span>}
                            </div>
                          </div>
                        </div>

                        {/* Hover utility actions overlay */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {/* edit action */}
                          <button
                            onClick={() => setEditingGallery(item)}
                            className="p-1 bg-white hover:bg-neutral-100 text-brand-blue rounded border transition-all cursor-pointer"
                            title="Edit Media"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          {/* delete action */}
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 pointer-events-auto transition-all cursor-pointer"
                            title="Hapus Media"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
