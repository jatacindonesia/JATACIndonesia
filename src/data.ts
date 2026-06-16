import { SiteConfig, Article, KoperasiAnnouncement, GalleryItem, LearningSession, LMSModule } from './types';

export const INITIAL_SITE_CONFIG: SiteConfig = {
  hero: {
    companyName: "JOHN ANDERSEN TRAINING AND CONSULTING INDONESIA",
    tagline: "Two Day English Learning Revolution",
    subtitle: "Solusi proses pembelajaran  bahasa Inggris  berbasis  pendekatan psikologi, komunikasi  dan pendekatan komunikatif",
    webinarSeriesTitle: "Two Day English Learning Revolution (12 Hour Method)",
    webinarDuration: "12 Jam Intensif (Terbagi dalam 4 Bagian/Times)",
    webinarParts: [
      { id: "p1", part: "Part One", title: "Developing English Mindset and Paradigm" },
      { id: "p2", part: "Part Two", title: "Mastering English Grammar Logic & Sentence Generation" },
      { id: "p3", part: "Part Three", title: "The 12-Hour Mastery of 16 English Tenses" },
      { id: "p4", part: "Part Four", title: "Instructor Program: Teaching Methodology & Leadership" }
    ],
    certificateNote: "Sertifikat resmi dan eksklusif akan diberikan dengan bangga kepada para peserta yang telah menyelesaikan ke-4 bagian webinar ini.",
    trainerName: "Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL",
    trainerTitle: "Lead Master Trainer & Founder",
    backgroundImageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=85&w=1800",
    backgroundImageUrl2: "https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?auto=format&fit=crop&q=85&w=1800",
    backgroundImageUrl3: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=85&w=1800",
    backgroundImageUrl4: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=85&w=1800"
  },
  importanceReasons: [
    {
      id: "imp-1",
      title: "Global Bridge / Jembatan Global",
      description: "Di era globalisasi, bahasa Inggris berperan sebagai jembatan utama yang menghubungkan manusia lintas negara dan budaya. Hampir semua sektor penting menggunakan bahasa Inggris sebagai bahasa pengantar.",
      iconName: "Globe"
    },
    {
      id: "imp-2",
      title: "Key to the Job Market / Kunci Karir",
      description: "Perusahaan multinasional menjadikan bahasa Inggris syarat utama rekrutmen. Menguasai bahasa Inggris membuka akses ke peluang karier internasional, gaji lebih tinggi, dan kolaborasi tim global.",
      iconName: "Briefcase"
    },
    {
      id: "imp-3",
      title: "Access to Knowledge / Akses Ilmu Pengetahuan",
      description: "80% lebih jurnal ilmiah, riset terbaru, dan materi kuliah terbaik dunia diterbitkan dalam bahasa Inggris. Tanpa menguasainya, kita akan tertinggal dari perkembangan pesat sains dan teknologi.",
      iconName: "BookOpen"
    }
  ],
  failureReasons: [
    {
      id: "fail-1",
      title: "Mindset and Paradigm (Pola Pikir)",
      description: "Pembelajaran sering melihat bahasa Inggris hanya sebagai subjek hapalan nilai sekolah, bukan alat bantu logika untuk berpikir sehari-hari."
    },
    {
      id: "fail-2",
      title: "Situational Logic (Logika Bahasa)",
      description: "Bahasa Indonesia cenderung sangat situasional dan implisit, sementara bahasa Inggris sangat eksplisit serta terstruktur ketat."
    },
    {
      id: "fail-3",
      title: "Grammatical Logic (Logika Grammar)",
      description: "Kecenderungan menerjemahkan kata per kata di kepala ('translate in the head') padahal Inggris memiliki ikatan waktu (Tenses) dan to be / auxiliaries."
    },
    {
      id: "fail-4",
      title: "Psychological Dimensions (Rasa Takut)",
      description: "Ketakutan berlebih akan membuat kesalahan tata bahasa, kurang percaya diri, dan hambatan sosiologis lingkungan."
    }
  ],
  methodologies: [
    {
      id: "meth-1",
      title: "Psychological Approach",
      subtitle: "Pendekatan Psikologis",
      description: "Menghilangkan trauma grammar, rasa takut bersalah, dan kecemasan mental. Membangun kecerdasan emosional yang siap menerima serta mempraktekkan bahasa Inggris secara aman, nyaman, dan berani.",
      forWho: "Pembelajaran yang mengalami trauma grammar, merasa malu berbicara, atau memiliki motivasi belajar rendah.",
      iconName: "Smile"
    },
    {
      id: "meth-2",
      title: "Communicative Approach",
      subtitle: "Pendekatan Komunikatif",
      description: "Memprioritaskan pemakaian bahasa sebagai media komunikasi nyata, mengesampingkan penghapalan rumus kaku. Belajar melalui simulasi diskusi interaktif, permainan peran (role-play), dan studi kasus nyata.",
      forWho: "Pembelajaran yang ingin melatih kelancaran berbicara (speaking) dan menyimak (listening) dalam percakapan sehari-hari.",
      iconName: "MessageSquare"
    },
    {
      id: "meth-3",
      title: "Neuro Linguistic Programming (NLP)",
      subtitle: "Komunikasi Otak & Keyakinan",
      description: "Memrogram ulang keyakinan yang membatasi diri seperti 'belajar bahasa Inggris itu sulit'. Menggunakan visual, auditory, dan kinesthetic (VAK) anchors agar memori linguistik tersimpan awet di otak.",
      forWho: "Pembelajaran yang ingin meruntuhkan hambatan belajar bawah sadar dan meningkatkan kecepatan penguasaan bahasa.",
      iconName: "Zap"
    },
    {
      id: "meth-4",
      title: "Transformative Geberative Grammar",
      subtitle: "Logika Generatif Mandiri",
      description: "Mengajarkan logika tata bahasa yang mendalam. Pembelajaran tidak sekedar menghapal kalimat contoh, melainkan memahami rancang bangun struktur bahasa untuk membuat jutaan kalimat secara mandiri sesuai tatanan asli.",
      forWho: "Pembelajaran yang ingin mahir menulis dan menyusun struktur gramatikal formal dengan logika berpikir bahasa Inggris.",
      iconName: "Cpu"
    },
    {
      id: "meth-5",
      title: "Developing English Mindset",
      subtitle: "Pembudayaan Pola Alternatif",
      description: "Mengubah kebiasaan menerjemahkan di dalam kepala. Membujuk otak agar berpikir langsung dalam konfigurasi bahasa Inggris melalui eksposur terarah, pembiasaan harian, dan immersion total.",
      forWho: "Semua pembelajar yang ingin mencapai tingkat kefasihan alami (fluency) setara penutur asli.",
      iconName: "BrainCircuit"
    }
  ],
  learningGoals: [
    { id: "lg-1", number: 1, goal: "Mengembangkan Pola Pikir dan Paradigma Bahasa Inggris (English Mindset & Paradigm)", goalId: "Developing the Mindset and Paradigm of the English Language" },
    { id: "lg-2", number: 2, goal: "Memahami dan Menguasai Logika Tata Bahasa Inggris (English Grammar Logic)", goalId: "Understand and Master the Grammar Logic of English" },
    { id: "lg-3", number: 3, goal: "Menguasai Konsep Dasar Pembelajaran Bahasa Inggris (Fundamental Concepts)", goalId: "Master the Fundamental Concept of English Learning" },
    { id: "lg-4", number: 4, goal: "Mempelajari Materi Pembelajaran Paling Dasar Kursus Bahasa Inggris (Core Materials)", goalId: "Learn the Most Fundamental Learning Material of English Course" },
    { id: "lg-5", number: 5, goal: "Mengembangkan Kepercayaan Diri dan Keberanian Saat Berbahasa Inggris (Confidence & Courage)", goalId: "Developing Self-Confidence and Courage When Using English" },
    { id: "lg-6", number: 6, goal: "Mempelajari & Menguasai 16 Tenses Bahasa Inggris (16 English Tenses)", goalId: "Learn the 16 English Tenses" },
    { id: "lg-7", number: 7, goal: "Menjadi Instruktur Bahasa Inggris Profesional (Become an English Instructor)", goalId: "To Become an English Instructor" }
  ],
  learningGoalsSubtitle: "Sistem materi kurikulum kami didesain presisi untuk melampaui hambatan mental konvensional hingga Anda siap dinobatkan menjadi instruktur.",
  learningGoalsArrowUrl: "/tribal_arrow.jpg",
  about: {
    profile: "JOHN ANDERSEN TRAINING AND CONSULTING INDONESIA adalah lembaga pelatihan dan konsultasi bahasa Inggris kontemporer revolusioner yang didirikan dengan tekad mulia untuk mendobrak kebuntuan metode pengajaran konvensional. Kami percaya bahwa bahasa bukanlah pengetahuan teoritis yang sekedar dihafalkan, melainkan sebuah alat berpikir, berkomunikasi, dan mengekspresikan diri secara merdeka.",
    vision: "Menjadi pusat edukasi bahasa Inggris, pelatihan instruktur, dan konsultasi komunikasi terdepan di Indonesia yang berlandaskan pemikiran logis, penguatan psikologis, dan metodologi kontemporer berstandar global.",
    mission: [
      "Mengikis ketakutan (grammar trauma) masyarakat Indonesia dalam menggunakan bahasa Inggris melalui pendekatan psikologis.",
      "Mengajarkan logika tata bahasa (Grammar Logic) secara revolusioner agar pembelajaran mampu memproduksi kalimat secara mandiri.",
      "Mencetak instruktur-instruktur bahasa Inggris handal yang memiliki etika pengajaran unggul dan bersertifikat resmi.",
      "Membangun komunitas pembelajar aktif yang saling mendukung dalam meningkatkan rasa percaya diri dan keberanian berbahasa."
    ],
    trainerBio: {
      details: [
        "Founder & Lead Master Trainer kami adalah Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL.",
        "Beliau merupakan sosok pakar linguistik praktis dan akademisi senior yang mengantongi gelar Diploma TEFL (Teaching of English as a Foreign Language).",
        "Dengan pengalaman lebih dari 30 tahun mengajar di berbagai korporasi multinasional, institusi pemerintahan, dan universitas ternama, beliau menyimpulkan hambatan terbesar pembelajar Indonesia terletak pada 'Tabrakan Mindset' antara bahasa Indonesia dengan bahasa Inggris.",
        "Drs. Eddy Sudarmadji merumuskan 5 Contemporary Teaching Methodologies yang telah membantu puluhan ribu profesional, guru, dan mahasiswa menyembuhkan kekakuan berbahasa Inggris mendalam secara instan."
      ]
    },
    legalities: [
      "SK Kemenkumham RI: AHU-0034912.AH.01.01.TAHUN 2024",
      "NIB (Nomor Induk Berusaha): 1209328401349 ",
      "Izin Operasional Pelatihan Lembaga Swasta Nasional No: LKP/349/2024",
      "Sertifikasi Kompetensi Pengajaran Terakreditasi Nasional"
    ],
    history: [
      {
        id: "hist-1",
        title: "Seminar Kebangsaan Pembudayaan Logika di Universitas Indonesia",
        year: "2018",
        description: "Drs. Eddy Sudarmadji membedah 5 Contemporary Methodologies untuk menyembuhkan trauma belajar bahasa Inggris di depan ribuan mahasiswa dan dosen.",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "hist-2",
        title: "Pelantikan Sertifikasi Instruktur JATC Gelombang Pertama",
        year: "2021",
        description: "Melahirkan 30 instruktur bahasa Inggris handal yang tersertifikasi secara profesional untuk menyebarkan metode revolusioner John Andersen.",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "hist-3",
        title: "Program Pelatihan Intensif English Logic untuk Eksekutif BUMN",
        year: "2023",
        description: "Meningkatkan daya saing global jajaran pimpinan BUMN melalui pemahaman mendalam tentang penataan struktur berpikir kalimat.",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  contact: {
    officeAddress: "Gedung Graha John Andersen, Lantai 3 Blok B-14, Jl. Letjen S. Parman No. 24, Slipi, Jakarta Barat, DKI Jakarta 11480",
    whatsappNumber: "6281234567890",
    operationalHours: "Senin - Sabtu: 08.00 - 17.00 WIB (Minggu dan Hari Libur Nasional Nasional Sesi Online Saja)"
  },
  certificate: {
    signatureName: "Drs. Eddy Sudarmadji MM.,MBA",
    signatureRole: "Lead Master Trainer & Founder JATC",
    backgroundStyle: "abstract-soft",
    accentColor: "#0b2240",
    logoUrl: "", // Defaults to standard typographic custom logo if empty
    rightLogoUrl: "", // Secondary brand/partner logo on top right if uploaded
    signatureUrl: "", // Defaults to empty string or handwritten font signature if empty
    issueDate: "14 Juni 2026" // Default date for certificate issuance
  },
  showLmsAndLive: true,
  targetParticipants: [
    {
      id: "tp-1",
      text: "Peserta dengan tingkat pendidikan : Profesor, S3, S2, S1, SMA.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "tp-2",
      text: "Lembaga-lembaga pemerintahan dan swasta.",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "tp-3",
      text: "Lembaga-lembaga lain yang menginginkan",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=150&auto=format&fit=crop"
    }
  ],
  institutions: [
    {
      id: "inst-1",
      name: "Kementerian Keuangan RI",
      logoUrl: "https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "inst-2",
      name: "Badan Perencanaan Pembangunan Nasional (Bappenas)",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "inst-3",
      name: "PT Pertamina (Persero)",
      logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "inst-4",
      name: "Universitas Indonesia (UI)",
      logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "inst-5",
      name: "PT Telekomunikasi Indonesia Tbk",
      logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop"
    }
  ]
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Menyembuhkan Grammar Trauma: Mengapa Anda Takut Berbicara?",
    description: "Banyak pembelajar bahasa Inggris menderita sindrom takut salah tata bahasa. Simak panduan praktis berbasis Pendekatan Psikologis Drs. Eddy Sudarmadji untuk meruntuhkan dinding ketakutan ini.",
    content: "Grammar trauma adalah ketakutan bawah sadar yang menyabotase kemampuan berbicara kita sebelum kalimat tersebut keluar dari mulut. Masalah utamanya adalah sistem edukasi sekolah yang sering menghukum kesalahan tata bahasa, bukannya mendorong ekspresi ide. Dalam metodologi pengajaran John Andersen Training, langkah pertama bukanlah mengajarkan rumus, melaikan 'pemulihan psikologis'. Kami menciptakan lingkungan yang aman, di mana kesalahan dipandang sebagai proses navigasi logis di otak, bukan sebagai kecacatan intelektual.",
    author: "Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL",
    date: "2026-06-10",
    category: "Psikologi Belajar",
    readTime: "5 min baca",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "art-2",
    title: "Mengapa Otak Anda Selalu Menerjemahkan di Kepala? (Indonesian vs English Mindset)",
    description: "Jika Anda masih menerjemahkan kata demi kata dari Bahasa Indonesia ke Bahasa Inggris, progres Anda akan selalu lambat. Temukan solusinya di sini.",
    content: "Saat penutur asli bahasa Indonesia berbicara bahasa Inggris, mereka seringkali memindahkan susunan pola kata bahasa Indonesia ke bahasa Inggris mentah-mentah. Contohnya: 'Di sini sangat dingin' diterjemahkan menjadi 'Here very cold' padahal secara Grammar Logic bahasa Inggris, kalimat harus memiliki subjek formal dan auxiliary verb (to be) seperti 'It is very cold here'. Mempelajari Bahasa Inggris sebagai tool untuk mendesain pikiran adalah cara terbaik mengatasi kebiasaan menerjemahkan di dalam kepala.",
    author: "Drs. Eddy Sudarmadji MM.,MBA.,Dipl TEFL",
    date: "2026-06-12",
    category: "Pola Pikir",
    readTime: "7 min baca",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop"
  }
];

export const INITIAL_KOPERASI_ANNOUNCEMENTS: KoperasiAnnouncement[] = [
  {
    id: "kop-1",
    title: "Rapat Anggota Tahunan & Program Investasi Pendidikan Guru",
    content: "Diberitahukan kepada seluruh anggota Koperasi John Andersen Training bahwa Rapat Tahunan akan diadakan pada awal bulan depan untuk membahas dana patungan investasi program sertifikasi instruktur gratis bagi masyarakat miskin daerah tertinggal.",
    date: "2026-06-14",
    status: "Aktif"
  },
  {
    id: "kop-2",
    title: "Peluncuran Unit Usaha Percetakan Buku & Panduan Grammar Kontemporer",
    content: "Selamat atas terbentuknya Unit Usaha koperasi baru di bidang penerbitan mandiri. Buku panduan revolusioner 'English Grammar Logic' karya Drs. Eddy Sudarmadji kini tersedia dengan diskon 30% bagi seluruh anggota koperasi aktif.",
    date: "2026-06-01",
    status: "Aktif"
  }
];

export const INITIAL_SESSIONS: LearningSession[] = [
  {
    id: "sess-1",
    title: "Sesi A: Webinar Revolution Part One (Hari Sabtu - Jam 09.00 WIB)",
    dateTime: "Sabtu, Kursus Jam 09:00 - 12:00 WIB",
    instructor: "Drs. Eddy Sudarmadji",
    status: "Aktif"
  },
  {
    id: "sess-2",
    title: "Sesi B: Webinar Revolution Part One (Hari Minggu - Jam 14.00 WIB)",
    dateTime: "Minggu, Kursus Jam 14:00 - 17:00 WIB",
    instructor: "Drs. Eddy Sudarmadji",
    status: "Aktif"
  },
  {
    id: "sess-3",
    title: "Sesi C: Kursus Eksekutif Logika Grammar & Sertifikasi Instruktur (Malam)",
    dateTime: "Rabu & Jumat, Jam 19:00 - 21:00 WIB",
    instructor: "Drs. Eddy Sudarmadji",
    status: "Aktif"
  }
];

export interface TenseDetail {
  slug: string;
  name: string;
  formula: string;
  examplePositive: string;
  exampleNegative: string;
  exampleQuestion: string;
  explanation: string;
  timeSignals: string[];
}

export const SIXTEEN_TENSES_DATA: TenseDetail[] = [
  {
    slug: "simple-present",
    name: "Simple Present Tense",
    formula: "S + V1 (s/es)  /  S + am/is/are + Nominal",
    examplePositive: "I output direct sentences based on English logic.",
    exampleNegative: "He does not translate Indonesian structures in his head.",
    exampleQuestion: "Do you feel confident when speaking English?",
    explanation: "Digunakan untuk menyatakan fakta umum, kebenaran mutlak, atau kebiasaan sehari-hari.",
    timeSignals: ["every day", "always", "usually", "often", "seldom"]
  },
  {
    slug: "present-continuous",
    name: "Present Continuous Tense",
    formula: "S + am/is/are + V-ing",
    examplePositive: "Drs. Eddy Sudarmadji is explaining the Psychological Approach now.",
    exampleNegative: "We are not memorizing boring rows of irregular verbs.",
    exampleQuestion: "Are they practicing target English tenses in class?",
    explanation: "Digunakan untuk menyatakan aksi/kejadian yang sedang berlangsung saat dibicarakan.",
    timeSignals: ["now", "at present", "at the moment", "right now"]
  },
  {
    slug: "present-perfect",
    name: "Present Perfect Tense",
    formula: "S + have/has + V3",
    examplePositive: "We have mastered the fundamental concept of grammar logic.",
    exampleNegative: "She has not felt grammar anxiety since joining John Andersen Training.",
    exampleQuestion: "Have you attended all four parts of the webinar series?",
    explanation: "Digunakan untuk menyatakan aksi yang telah selesai dilakukan tapi masih ada dampaknya sekarang, atau pengalaman hidup.",
    timeSignals: ["already", "just", "yet", "ever", "never", "since", "for"]
  },
  {
    slug: "present-perfect-continuous",
    name: "Present Perfect Continuous Tense",
    formula: "S + have/has + been + V-ing",
    examplePositive: "I have been practicing deep structural thinking for three hours.",
    exampleNegative: "He has not been following the traditional rote learning method.",
    exampleQuestion: "Have they been training as an English instructor today?",
    explanation: "Menyatakan aksi yang dimulai di masa lalu, masih berlanjut hingga sekarang, dan kemungkinan berketerusan.",
    timeSignals: ["for two hours", "since morning", "all day"]
  },
  {
    slug: "simple-past",
    name: "Simple Past Tense",
    formula: "S + V2  /  S + was/were + Nominal",
    examplePositive: "He graduated with an elite Diploma of TEFL last year.",
    exampleNegative: "They did not understand English word order in high school.",
    exampleQuestion: "Did the student join the webinar part one yesterday?",
    explanation: "Menyatakan aksi atau peristiwa yang terjadi dan selesai di masa lampau pada waktu spesifik.",
    timeSignals: ["yesterday", "last night", "two days ago", "in 2024"]
  },
  {
    slug: "past-continuous",
    name: "Past Continuous Tense",
    formula: "S + was/were + V-ing",
    examplePositive: "The instructor was coaching the candidate when I entered the classroom.",
    exampleNegative: "We were not translating in our heads during the speaking quiz.",
    exampleQuestion: "Were you studying the 16 tenses when he called you?",
    explanation: "Menyatakan kejadian yang sedang berlangsung di masa lampau ketika kejadian lain menyela.",
    timeSignals: ["when", "while", "at 9 o'clock yesterday"]
  },
  {
    slug: "past-perfect",
    name: "Past Perfect Tense",
    formula: "S + had + V3",
    examplePositive: "The students had prepared their mental model before the instructor started teaching.",
    exampleNegative: "She had not realized how easy English logic was before meeting Drs. Eddy.",
    exampleQuestion: "Had they registered for the webinar before the portal closed?",
    explanation: "Menyatakan kejadian yang telah selesai sebelum kejadian lampau lainnya terjadi.",
    timeSignals: ["before", "after", "by the time"]
  },
  {
    slug: "past-perfect-continuous",
    name: "Past Perfect Continuous Tense",
    formula: "S + had + been + V-ing",
    examplePositive: "The team had been designing the new curriculum for months before it got released.",
    exampleNegative: "They had not been experiencing progress before they switched to the pragmatic solution.",
    exampleQuestion: "Had you been teaching English for long before getting the instructor certificate?",
    explanation: "Menyatakan durasi aksi yang berlangsung di masa lalu sebelum titik waktu tertentu di masa lalu juga.",
    timeSignals: ["for weeks", "before registration"]
  },
  {
    slug: "simple-future",
    name: "Simple Future Tense",
    formula: "S + will + V1  /  S + is/am/are + going to + V1",
    examplePositive: "John Andersen Training will empower active speakers in Indonesia.",
    exampleNegative: "We will not let fear of grammar block our career growth.",
    exampleQuestion: "Will you implement the NLP anchors in your teaching sessions?",
    explanation: "Menyatakan peristiwa yang akan terjadi di masa yang akan datang.",
    timeSignals: ["tomorrow", "next week", "later", "tonight"]
  },
  {
    slug: "future-continuous",
    name: "Future Continuous Tense",
    formula: "S + will + be + V-ing",
    examplePositive: "At this time tomorrow, they will be presenting their lesson plans.",
    exampleNegative: "I will not be using outdated learning systems next semester.",
    exampleQuestion: "Will you be mentoring junior candidates at 10 AM on Monday?",
    explanation: "Menyatakan aksi yang diperkirakan sedang berlangsung pada waktu tertentu di masa depan.",
    timeSignals: ["at this time tomorrow", "at 8 PM next Monday"]
  },
  {
    slug: "future-perfect",
    name: "Future Perfect Tense",
    formula: "S + will + have + V3",
    examplePositive: "By next month, I will have finished my English teacher evaluation.",
    exampleNegative: "He will not have accomplished the 12-Hour training before Saturday.",
    exampleQuestion: "Will they have obtained their certificates by the end of this webinar series?",
    explanation: "Menyatakan aksi yang diprediksi akan telah selesai sebelum batas waktu tertentu di masa depan.",
    timeSignals: ["by next week", "by the end of this year"]
  },
  {
    slug: "future-perfect-continuous",
    name: "Future Perfect Continuous Tense",
    formula: "S + will + have + been + V-ing",
    examplePositive: "By the end of this year, we will have been practicing this method for ten months.",
    exampleNegative: "She will not have been leading sessions for long by the time of her graduation.",
    exampleQuestion: "Will you have been living in this English immersive house for a year by winter?",
    explanation: "Menyatakan durasi atau keberlangsungan suatu aksi hingga titik waktu tertentu di masa depan.",
    timeSignals: ["by the end of...", "for five months"]
  },
  {
    slug: "simple-future-past",
    name: "Past Future Tense",
    formula: "S + should/would + V1  /  S + was/were + going to + V1",
    examplePositive: "We said we would join the training school last year.",
    exampleNegative: "She told him she would not panic during the speaking test.",
    exampleQuestion: "Would you teach if you were appointed as the key speaker?",
    explanation: "Digunakan untuk mengandalkan aksi yang direncanakan di masa lalu, atau mengutarakan pengkondisian (conditional type 2).",
    timeSignals: ["yesterday", "if I were you", "would"]
  },
  {
    slug: "past-future-continuous",
    name: "Past Future Continuous Tense",
    formula: "S + should/would + be + V-ing",
    examplePositive: "I knew they would be attending the English Mindset class at that moment.",
    exampleNegative: "He would not be working on translations if he knew the direct thinking rule.",
    exampleQuestion: "Would you be teaching at this time if you had chosen this career?",
    explanation: "Menyatakan peristiwa yang sedang direncanakan berlangsung di waktu tertentu di masa lalu.",
    timeSignals: ["at that hour", "if they came"]
  },
  {
    slug: "past-future-perfect",
    name: "Past Future Perfect Tense",
    formula: "S + should/would + have + V3",
    examplePositive: "You would have successfully become an instructor if you had submitted the assessment.",
    exampleNegative: "I would not have failed the grammar test if I had learned the structural SVO logic.",
    exampleQuestion: "Would he have built self-confidence if he hadn't experienced the program?",
    explanation: "Menyatakan aksi yang direncanakan telah selesai di masa lampau seandainya kondisi terpenuhi (conditional type 3).",
    timeSignals: ["if he had...", "by last week"]
  },
  {
    slug: "past-future-perfect-continuous",
    name: "Past Future Perfect Continuous Tense",
    formula: "S + should/would + have + been + V-ing",
    examplePositive: "By 2025, Mr. Eddy would have been refining this contemporary methodology for 30 years.",
    exampleNegative: "We would not have been struggling for hours if we had adapted early.",
    exampleQuestion: "Would you have been leading the corporate webinar for long if you took the job?",
    explanation: "Menyatakan perkiraan durasi kejadian yang sedang direncanakan berlangsung di masa lampau.",
    timeSignals: ["for years by then", "since 1995"]
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sertifikasi Instruktur Gelombang XV",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop",
    category: "Sertifikasi",
    date: "2026-05-20"
  },
  {
    id: "gal-2",
    title: "Pelatihan Karyawan PT Pos Indonesia (Persero)",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    category: "Pelatihan",
    date: "2026-06-05"
  },
  {
    id: "gal-3",
    title: "Simulasi Mengajar Calon Trainer",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
    category: "Seminar",
    date: "2026-06-11"
  }
];

export const INITIAL_LMS_MODULES: LMSModule[] = [
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

