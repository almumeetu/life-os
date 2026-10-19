import { intlLocale, type Locale } from "@/lib/i18n";

export const LIFE_AREAS = [
  { id: "tasks", label: "Tasks", description: "Plan the next useful step.", icon: "CheckSquare", color: "orange" },
  { id: "abroad", label: "Study abroad", description: "Universities, exams, documents and visa steps.", icon: "Globe2", color: "blue" },
  { id: "career", label: "Career", description: "Build skills and move your career forward.", icon: "BriefcaseBusiness", color: "green" },
  { id: "research", label: "Research", description: "Keep research notes, sources and next actions.", icon: "FlaskConical", color: "purple" },
  { id: "goals", label: "Goals", description: "Break a long-term goal into small actions.", icon: "Target", color: "pink" },
  { id: "money", label: "Money plans", description: "Set savings goals and next steps for your money.", icon: "WalletCards", color: "amber" },
  { id: "health", label: "Health", description: "Build routines that support your energy.", icon: "HeartPulse", color: "teal" },
  { id: "ideas", label: "Ideas & notes", description: "Capture thoughts before they disappear.", icon: "Lightbulb", color: "slate" },
] as const;

export const DEFAULT_CATEGORIES = ["Food", "Transport", "Study/Exam", "Bills", "Shopping", "Health", "Other"];
export const APPLICATION_STATUSES = ["Wishlist", "Preparing", "Applied", "Interview", "Offer", "Rejected"] as const;
export const APPLICATION_TYPES = ["University", "Job", "Scholarship"] as const;
export const PRIORITIES = [
  { value: 1, label: "High" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Low" },
] as const;

export const STARTER_ITEMS: Record<string, string[]> = {
  tasks: ["Plan tomorrow tonight", "Reply to pending messages"],
  abroad: [
    "Choose country and course",
    "Shortlist 8–10 universities (safe / target / dream)",
    "Set IELTS target score and exam date",
    "Check passport validity",
    "Collect transcripts and certificates",
    "Write first draft of SOP",
    "Request 2 recommendation letters",
    "Update academic CV",
    "Research scholarships and deadlines",
    "Prepare budget and proof of funds",
    "Note each university’s application deadline",
    "Prepare for admission and visa interview",
  ],
  career: ["Update CV and LinkedIn", "Apply to 5 jobs this week", "Prepare 3 STAR stories", "Do 1 mock interview", "Polish GitHub and portfolio"],
  research: ["Compare 3 countries: cost, jobs, visa", "List 10 scholarships with deadlines", "Find 5 professors or labs of interest", "Read each university’s official requirements page"],
  goals: ["Reach my target IELTS band", "Speak English 20 minutes daily"],
  money: ["Track monthly expenses", "Save for exam and application fees"],
  health: ["Walk 30 minutes", "Drink enough water", "Sleep on time"],
  ideas: [],
};

export function getArea(area: string) {
  return LIFE_AREAS.find((entry) => entry.id === area);
}

export function formatMoney(cents: number, currency = "BDT", locale: Locale = "en") {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
