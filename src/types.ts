export interface WebinarPart {
  id: string;
  part: string;
  title: string;
}

export interface HeroConfig {
  companyName: string;
  tagline: string;
  subtitle: string;
  webinarSeriesTitle: string;
  webinarDuration: string;
  webinarParts: WebinarPart[];
  certificateNote: string;
  trainerName: string;
  trainerTitle: string;
}

export interface EnglishImportanceReason {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FailureReason {
  id: string;
  title: string;
  description: string;
}

export interface TeachingMethodology {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  forWho: string;
  iconName: string;
}

export interface LearningGoal {
  id: string;
  number: number;
  goal: string;
  goalId: string;
}

export interface AboutConfig {
  profile: string;
  vision: string;
  mission: string[];
  trainerBio: {
    photoUrl?: string;
    details: string[];
  };
  legalities: string[];
}

export interface Member {
  id: string;
  name: string;
  password?: string; // Optional or required, let's support optional for backward-compatibility and make it string
  birthPlace: string;
  birthDate: string;
  institution: string;
  gender: 'Laki-Laki' | 'Perempuan';
  religion: 'Islam' | 'Kristen' | 'Budha' | 'Hindu' | 'Konghucu' | 'Kepercayaan';
  profession: string;
  phone: string;
  email: string;
  address: string;
  selectedSession: string;
  registeredAt: string;
  status: 'Pending' | 'Selesai' | 'Ditolak';
  isCertificateApproved?: boolean;
}

export interface LearningSession {
  id: string;
  title: string;
  dateTime: string;
  instructor: string;
  status: 'Aktif' | 'Selesai' | 'Penuh';
  isCertificateIssued?: boolean;
  isWebinarSequence?: boolean;
  webinarSequenceLabel?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  imageUrl?: string;
  externalUrl?: string; // Optional external link for video or news
}

export interface KoperasiAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'Aktif' | 'Arsip';
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'Pelatihan' | 'Sertifikasi' | 'Seminar' | 'Dokumentasi' | 'ZOOM';
  date: string;
  externalUrl?: string; // Optional link for zoom/external info
  videoUrl?: string; // Optional YouTube or video link
}

export interface ContactConfig {
  officeAddress: string;
  whatsappNumber: string;
  operationalHours: string;
}

export interface CertificateConfig {
  logoUrl?: string;
  rightLogoUrl?: string; // Secondary brand/partnr logo on top right of the certificate
  signatureUrl?: string; // base64 or url of signature
  signatureName?: string;
  signatureRole?: string;
  backgroundStyle?: string; // e.g. "classic", "abstract-soft", "royal-blue"
  accentColor?: string;
  issueDate?: string; // Date the certificate is issued/released, e.g., "14 Juni 2026"
}

export interface SiteConfig {
  hero: HeroConfig;
  importanceReasons: EnglishImportanceReason[];
  failureReasons: FailureReason[];
  methodologies: TeachingMethodology[];
  learningGoals: LearningGoal[];
  about: AboutConfig;
  contact: ContactConfig;
  certificate?: CertificateConfig;
}

export interface LMSModule {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link';
  durationOrPages: string;
  category: string;
  description: string;
  goalReference: string;
  fileUrl: string;
}

