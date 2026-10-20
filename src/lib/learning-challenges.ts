export type ChallengeTopic = "everyday" | "grammar" | "interview";
export type LearningChallenge = {
  id: string;
  prompt: string;
  promptBn: string;
  options: string[];
  answer: number;
  explanation: string;
  explanationBn: string;
};

export const CHALLENGE_TOPICS = [
  { id: "everyday", title: "Everyday English", titleBn: "প্রতিদিনের ইংরেজি", description: "Small conversations, real confidence.", descriptionBn: "ছোট কথোপকথন, একটু বেশি আত্মবিশ্বাস।" },
  { id: "grammar", title: "Sentence detective", titleBn: "বাক্যের গোয়েন্দা", description: "Spot the pattern. Make it yours.", descriptionBn: "বাক্যের নিয়ম বুঝুন, নিজেই ব্যবহার করুন।" },
  { id: "interview", title: "Interview warm-up", titleBn: "ইন্টারভিউর প্রস্তুতি", description: "Practise clear, thoughtful answers.", descriptionBn: "স্পষ্ট ও গুছিয়ে উত্তর দেওয়া শিখুন।" },
] as const;

export const LEARNING_CHALLENGES: Record<ChallengeTopic, LearningChallenge[]> = {
  everyday: [
    { id: "introduction", prompt: "You meet a new classmate. How do you introduce yourself?", promptBn: "নতুন সহপাঠীর সঙ্গে পরিচয় হচ্ছে। কী বলবেন?", options: ["Myself is Rafi.", "Hi, I'm Rafi. Nice to meet you!", "You must know me."], answer: 1, explanation: "“I'm” means “I am.” Add “Nice to meet you” to make a first introduction friendly.", explanationBn: "“I'm” মানে “I am”। প্রথম পরিচয়ে “Nice to meet you” বললে কথাটি আরও আন্তরিক হয়।" },
    { id: "repeat", prompt: "You didn't catch what someone said. What could you say?", promptBn: "কারও কথা বুঝতে পারেননি। ভদ্রভাবে কী বলবেন?", options: ["Could you say that again, please?", "You say wrong.", "I no hear."], answer: 0, explanation: "“Could you… please?” is a polite way to ask for help. You can also say, “Could you speak more slowly?”", explanationBn: "“Could you… please?” দিয়ে ভদ্রভাবে অনুরোধ করা যায়। ধীরে বলতে চাইলে বলুন, “Could you speak more slowly?”" },
    { id: "routine", prompt: "Choose the natural sentence about a daily routine.", promptBn: "প্রতিদিনের অভ্যাস বোঝাতে সঠিক বাক্যটি বেছে নিন।", options: ["I practising English every day.", "I am practise English every day.", "I practise English every day."], answer: 2, explanation: "Use the present simple for routines: I practise, you practise, she practises.", explanationBn: "নিয়মিত কাজ বোঝাতে present simple: I practise, you practise, she practises। I-এর পরে এখানে am লাগে না।" },
    { id: "thanks", prompt: "A friend helps you study. How do you thank them?", promptBn: "বন্ধু পড়তে সাহায্য করেছে। কীভাবে ধন্যবাদ দেবেন?", options: ["Thanks for helping me. I really appreciate it.", "Thanks to help me yesterday tomorrow.", "You are required to help."], answer: 0, explanation: "After “thanks for,” use a noun or an -ing form: thanks for your time; thanks for helping.", explanationBn: "“Thanks for”-এর পরে noun বা verb-এর -ing form বসে: thanks for your time; thanks for helping।" },
  ],
  grammar: [
    { id: "past", prompt: "Yesterday, I ___ to the library.", promptBn: "গতকালের ঘটনা: Yesterday, I ___ to the library.", options: ["go", "went", "going"], answer: 1, explanation: "“Yesterday” refers to a finished past event. The past form of “go” is “went.”", explanationBn: "Yesterday মানে গতকাল—শেষ হয়ে যাওয়া ঘটনা। Go-এর past form হলো went।" },
    { id: "question", prompt: "Which question is correct?", promptBn: "কোন প্রশ্নটি সঠিক?", options: ["Did you went to class?", "Did you going to class?", "Did you go to class?"], answer: 2, explanation: "After “did,” use the base verb: did you go, did you read, did you practise.", explanationBn: "Did-এর পরে verb-এর base form বসে: did you go, did you read, did you practise।" },
    { id: "reason", prompt: "I practise speaking ___ I want to feel more confident.", promptBn: "কারণ বোঝাতে কোন শব্দ বসবে?", options: ["because", "but", "or"], answer: 0, explanation: "“Because” introduces a reason. Try adding your own reason to “I learn English because…”", explanationBn: "Because দিয়ে কারণ বোঝানো হয়। এবার নিজে বলুন: “I learn English because…”" },
    { id: "future", prompt: "Tomorrow, she ___ practise her introduction.", promptBn: "আগামীকালের পরিকল্পনা: Tomorrow, she ___ practise her introduction.", options: ["did", "will", "was"], answer: 1, explanation: "Use “will” followed by the base verb to describe a future action: she will practise.", explanationBn: "ভবিষ্যতের কাজ বোঝাতে will + base verb: she will practise। Will-এর পরে practises হবে না।" },
  ],
  interview: [
    { id: "example", prompt: "Which answer gives the clearest evidence of teamwork?", promptBn: "কোন উত্তরে দলগত কাজের পরিষ্কার উদাহরণ আছে?", options: ["I am the best at everything.", "I like teamwork very much.", "In our class project, I organised tasks and helped us finish on time."], answer: 2, explanation: "A specific situation, your action, and a result make an answer easier to understand and discuss.", explanationBn: "একটি নির্দিষ্ট ঘটনা, আপনার কাজ এবং ফলাফল বললে উত্তর বোঝা সহজ হয়। নিজের বাস্তব অভিজ্ঞতা ব্যবহার করুন।" },
    { id: "clarify", prompt: "An interview question is unclear. What is a useful response?", promptBn: "ইন্টারভিউর প্রশ্ন পরিষ্কার হয়নি। কী বলতে পারেন?", options: ["Could you clarify what you mean by that?", "I will answer a different question.", "I understand everything."], answer: 0, explanation: "Asking for clarification helps you answer the question accurately. It is fine to take a moment to think.", explanationBn: "প্রশ্ন বুঝে নিতে চাইলে সঠিক উত্তর দেওয়া সহজ হয়। ভেবে নেওয়ার জন্য একটু সময় নেওয়াও স্বাভাবিক।" },
    { id: "strength", prompt: "How could you describe a strength without exaggerating?", promptBn: "অতিরঞ্জন না করে নিজের দক্ষতা কীভাবে বলবেন?", options: ["I never make any mistakes.", "I plan my work carefully. For example, I use a checklist to meet deadlines.", "Nobody works as well as me."], answer: 1, explanation: "Name a relevant strength and support it with an honest example. Avoid absolute claims such as “never.”", explanationBn: "প্রাসঙ্গিক একটি দক্ষতা বলুন এবং সত্য উদাহরণ দিন। “কখনো ভুল করি না”—এমন দাবি এড়িয়ে চলুন।" },
    { id: "growth", prompt: "Which answer shows a practical approach to improvement?", promptBn: "কোন উত্তরে উন্নতির বাস্তব চেষ্টা বোঝা যায়?", options: ["I don't need to improve.", "My weaknesses are everyone else's fault.", "I'm working on public speaking by practising short presentations each week."], answer: 2, explanation: "A clear improvement area and a specific action show reflection. Use a real example that applies to you.", explanationBn: "কোথায় উন্নতি দরকার এবং কী করছেন—দুটিই বলুন। নিজের সঙ্গে মেলে এমন সত্য উদাহরণ ব্যবহার করুন।" },
  ],
};

export type ChallengeProgress = Partial<Record<ChallengeTopic, { best: number; rounds: number }>>;

// Browser storage is optional and untrusted; only retain known topics and bounded numbers.
export function parseChallengeProgress(raw: string | null): ChallengeProgress {
  try {
    const value: unknown = JSON.parse(raw || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result: ChallengeProgress = {};
    for (const { id } of CHALLENGE_TOPICS) {
      const entry = (value as Record<string, unknown>)[id];
      if (!entry || typeof entry !== "object") continue;
      const { best, rounds } = entry as Record<string, unknown>;
      if (typeof best === "number" && Number.isInteger(best) && best >= 0 && best <= LEARNING_CHALLENGES[id].length &&
          typeof rounds === "number" && Number.isSafeInteger(rounds) && rounds > 0 && rounds <= 100000) {
        result[id] = { best, rounds };
      }
    }
    return result;
  } catch {
    return {};
  }
}
