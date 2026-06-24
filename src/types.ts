export interface PersonalProfile {
  fullName: string;
  nickname: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface Resume {
  id: string;
  title: string; // e.g., "ATS Resume", "Corporate Resume", "Freelance CV"
  summary: string;
  experienceIds: string[];
  educationIds: string[];
  skillIds: string[];
  projectIds: string[];
  customSections: { title: string; content: string }[];
}

export interface CaseStudy {
  title: string;
  challenge: string;
  solution: string;
  results: string;
}

export interface Portfolio {
  url: string;
  liveDemoUrl: string;
  caseStudies: CaseStudy[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  challenges?: string;
  solutions?: string;
  features?: string;
  futureImprovements?: string;
  status: 'Planning' | 'In Progress' | 'Completed';
}

export interface CareerExperience {
  id: string;
  company: string;
  designation: string;
  startDate: string;
  endDate: string;
  current: boolean;
  salary: string;
  achievements: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  gpa: string;
  startDate: string;
  endDate: string;
  certificates: string[];
  transcripts: string[];
}

export interface LearningItem {
  id: string;
  course: string;
  technology: string;
  roadmap: string[];
  progress: number; // percentage 0-100
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft' | 'Language';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Proposal {
  id: string;
  client: string;
  jobTitle: string;
  status: 'Submitted' | 'Accepted' | 'Declined';
  date: string;
}

export interface Contract {
  id: string;
  title: string;
  value: number;
  status: 'Active' | 'Completed' | 'Pending';
}

export interface FreelancingHub {
  upworkUrl: string;
  fiverrUrl: string;
  freelancerUrl: string;
  peoplePerHourUrl: string;
  earnings: number;
  proposals: Proposal[];
  clients: string[];
  contracts: Contract[];
}

export interface DocumentFile {
  id: string;
  name: string;
  category: 'Personal' | 'Financial' | 'Professional';
  type: 'National ID' | 'Passport' | 'Birth Certificate' | 'Driving License' | 'Bank Account' | 'Tax' | 'Resume' | 'Certificate' | 'Other';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  expiryDate?: string;
  fileContent?: string; // base64 or server URL
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  applicationDate: string;
  interviewDate?: string;
  status: 'Applied' | 'HR Review' | 'Technical Interview' | 'Final Interview' | 'Offer' | 'Rejected';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  credentialUrl?: string;
  expiryDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  timeframe: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  completed: boolean;
  dueDate?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown supported
  tags?: string[];
  updatedAt: string;
  folder?: 'Personal' | 'Professional' | 'Learning' | 'Quick Capture';
}

export interface Contact {
  id: string;
  name: string;
  relationship?: 'Family' | 'Friend' | 'Professional' | 'Emergency' | 'Other';
  email: string;
  phone: string;
  notes?: string;
  designation?: string;
  company?: string;
  category?: 'Client' | 'Colleague' | 'Mentor' | 'Emergency' | 'Friend';
}

export interface BankInfo {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  iban?: string;
  swiftCode?: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Other';
}

export interface Subscription {
  id: string;
  serviceName: string;
  cost: number;
  billingCycle: 'Monthly' | 'Yearly' | 'Annual';
  nextRenewal: string;
  active: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Hardware' | 'Digital' | 'License' | 'Other';
  details?: string; // SN, Domain name, License key
  cost: number;
  expiryDate?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
}

export interface PasswordItem {
  id: string;
  website: string;
  username: string;
  encryptedPassword?: string;
  iv?: string; // Initialization vector for client-side Web Crypto AES-GCM
  notes?: string;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  details: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  type: 'Identity' | 'Education' | 'Employment';
  url: string;
}

export interface EncryptedPassword {
  id: string;
  serviceName: string;
  encryptedUsername: string;
  encryptedValue: string;
  encryptedNotes?: string;
  salt: string;
  iv: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Complete central storage schema for local storage backing
export interface LifeOSState {
  profile: PersonalProfile;
  resumes: Resume[];
  portfolio: Portfolio;
  projects: Project[];
  career: CareerExperience[];
  education: EducationEntry[];
  learning: LearningItem[];
  skills: Skill[];
  freelancing: FreelancingHub;
  documents: DocumentFile[];
  applications: JobApplication[];
  certifications: Certification[];
  goals: Goal[];
  notes: Note[];
  contacts: Contact[];
  assets: Asset[];
  passwords: PasswordItem[];
  activity: ActivityTimelineItem[];
  banks?: BankInfo[];
  subscriptions?: Subscription[];
  vaultDocuments?: VaultDocument[];
  encryptedPasswords?: EncryptedPassword[];
  aiSessionMessages?: AIChatMessage[];
}
