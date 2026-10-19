export const LIFE_AREAS = [
  { id: "abroad", label: "Study abroad", description: "Universities, exams, documents and visa steps.", icon: "Globe2", color: "blue" },
] as const;

export const APPLICATION_STATUSES = ["Wishlist", "Preparing", "Applied", "Interview", "Offer", "Rejected"] as const;
export const PRIORITIES = [
  { value: 1, label: "High" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Low" },
] as const;

export const STARTER_ITEMS: Record<string, string[]> = {
  abroad: [
    "Choose target country, course and intake",
    "Read the official entry requirements for each university",
    "Compare tuition, living costs and application deadlines",
    "Set an IELTS target band and exam date",
    "Check passport validity and renewal time",
    "Collect transcripts, certificates and grading records",
    "Prepare a first draft of your statement of purpose",
    "Request recommendation letters from suitable referees",
    "Prepare an academic CV and portfolio if required",
    "Shortlist scholarships and record their official deadlines",
    "Plan tuition, living costs and proof-of-funds documents",
    "Check the destination country's official student visa checklist",
    "Prepare for university and visa interviews",
  ],
};
