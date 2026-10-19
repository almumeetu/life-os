export const LEARNING_BOOKS = [
  {
    id: "spoken", title: "ঘরে বসে Spoken English", author: "মুনজেরিন শহীদ",
    pages: 104, contentsPage: 7, firstLessonPage: 12,
    description: "একদম শুরু থেকে ছোট বাক্যে নিজের কথা বলা। প্রথমে এই বইটি পড়ুন।",
    practiceHref: "/dashboard/speaking", practiceLabel: "এই বইয়ের speaking অনুশীলন",
  },
  {
    id: "ielts", title: "ঘরে বসে IELTS প্রস্তুতি", author: "মুনজেরিন শহীদ",
    pages: 352, contentsPage: 2, firstLessonPage: 4,
    description: "Listening, Reading, Writing ও Speaking-এর প্রস্তুতি। বেসিক চর্চার পাশাপাশি পড়তে পারেন।",
    practiceHref: "/dashboard/ielts", practiceLabel: "এই বইয়ের IELTS অনুশীলন",
  },
] as const;

export type LearningBook = (typeof LEARNING_BOOKS)[number];
export type LearningBookId = LearningBook["id"];

// Original beginner exercises for this app, not quotations from the books.
export const BEGINNER_LESSONS = [
  { title: "নিজের পরিচয়", meaning: "নিজের নাম, কোথায় থাকেন ও কী করেন—এই তিনটি কথা বলুন।", english: "My name is Rafi. I live in Dhaka. I am a student.", bangla: "আমার নাম রাফি। আমি ঢাকায় থাকি। আমি একজন শিক্ষার্থী।", rule: "I am + পরিচয় / অবস্থা। I live in + জায়গার নাম।", task: "Rafi ও Dhaka বদলে নিজের নাম ও এলাকার নাম বসান।", mistake: "I am student → I am a student. Student-এর আগে a বসে।" },
  { title: "নতুন কারও সঙ্গে কথা", meaning: "অভিবাদন জানান, পরিচয় দিন, তারপর একটি প্রশ্ন করুন।", english: "Hello! I am Rafi. Nice to meet you. Where do you study?", bangla: "হ্যালো! আমি রাফি। আপনার সঙ্গে পরিচিত হয়ে ভালো লাগল। আপনি কোথায় পড়েন?", rule: "প্রশ্নে Where + do + you + মূল verb ব্যবহার করুন।", task: "এক বন্ধুর সঙ্গে পালা করে পরিচয় ও প্রশ্ন বলুন।", mistake: "Where you study? → Where do you study?" },
  { title: "প্রতিদিনের ছোট বাক্য", meaning: "প্রতিদিন কী করেন, তা ছোট ছোট বাক্যে বলুন।", english: "I wake up early. I go to college. I study English every day.", bangla: "আমি সকালে উঠি। আমি কলেজে যাই। আমি প্রতিদিন ইংরেজি পড়ি।", rule: "অভ্যাস বোঝাতে I + মূল verb। He/She হলে অনেক verb-এ s বা es যোগ হয়।", task: "সকাল থেকে রাতের তিনটি কাজ ইংরেজিতে বলুন।", mistake: "I am go to college → I go to college." },
  { title: "সহজ প্রশ্ন", meaning: "What, Where ও When দিয়ে তথ্য জানতে চান।", english: "What do you study? Where do you live? When do you practise English?", bangla: "আপনি কী পড়েন? কোথায় থাকেন? কখন ইংরেজি অনুশীলন করেন?", rule: "Question word + do + you + verb? Be verb হলে: Where are you?", task: "তিনটি প্রশ্ন বলুন এবং প্রতিটির উত্তর এক বাক্যে দিন।", mistake: "Where do you are? → Where are you?" },
  { title: "একজন মানুষের বর্ণনা", meaning: "বন্ধু বা পরিবারের একজনের গুণ ও অভ্যাস বলুন।", english: "My friend is kind. She helps me with English. She reads every day.", bangla: "আমার বন্ধু দয়ালু। সে আমাকে ইংরেজিতে সাহায্য করে। সে প্রতিদিন পড়ে।", rule: "গুণ: She is + adjective। অভ্যাস: She + verb-s/es।", task: "একজন বন্ধুর দুটি গুণ এবং একটি অভ্যাস বলুন।", mistake: "She help me → She helps me." },
  { title: "আবহাওয়া নিয়ে কথা", meaning: "আজকের আবহাওয়া এবং আপনার পরিকল্পনা বলুন।", english: "It is cloudy today. I will take an umbrella. I like rainy days.", bangla: "আজ আকাশ মেঘলা। আমি ছাতা নিয়ে যাব। আমার বৃষ্টির দিন ভালো লাগে।", rule: "আবহাওয়া: It is + adjective। ভবিষ্যৎ: will + মূল verb।", task: "জানালা দিয়ে দেখুন। আজকের আবহাওয়া নিয়ে তিনটি বাক্য বলুন।", mistake: "It is rain today → It is raining today. অথবা: It is rainy today." },
  { title: "ধন্যবাদ ও উত্তর", meaning: "কীসের জন্য কৃতজ্ঞ, সেটিও বলুন।", english: "Thank you for helping me. Your notes are useful. You are welcome.", bangla: "আমাকে সাহায্য করার জন্য ধন্যবাদ। আপনার নোটগুলো কাজে লাগে। স্বাগতম / সাহায্য করতে পেরে ভালো লাগল।", rule: "Thank you for + verb-ing বা noun।", task: "একজন বন্ধুকে নির্দিষ্ট একটি কাজের জন্য ধন্যবাদ জানান।", mistake: "Thank you for help me → Thank you for helping me." },
] as const;

export const IELTS_BEGINNER_HELP: Record<string, string> = {
  "Academic Writing": "প্রথমে প্রশ্নে কী চাওয়া হয়েছে বুঝুন। বাংলায় ২টি ধারণা লিখে নিন, তারপর ছোট ইংরেজি বাক্যে সাজান। বইয়ের উদাহরণের সঙ্গে নিজের লেখার গঠন মিলিয়ে দেখুন।",
  Listening: "প্রশ্ন আগে পড়ুন। উত্তরে নাম, সংখ্যা নাকি জায়গা লাগবে তা ভাবুন। অডিও শুনে উত্তর লিখুন, পরে আবার শুনে ভুল ধরুন। নিচের বোতামটি অনুশীলনের নির্দেশনা পড়ে শোনায়; বইয়ের listening test audio নয়।",
  "Academic Reading": "শিরোনাম ও প্রশ্ন পড়ুন। প্রশ্নের গুরুত্বপূর্ণ শব্দ খুঁজে অনুচ্ছেদে যান। প্রতিটি অজানা শব্দের অর্থ খুঁজতে থেমে যাবেন না।",
  Speaking: "উত্তর + কারণ + ছোট উদাহরণ—এই তিন ধাপে বলুন। আগে ৩টি সহজ বাক্য, তারপর ধীরে ধীরে বাড়ান। Speaking পেজে শুনে বলার চর্চা করুন।",
  Vocabulary: "আজ ৫টি শব্দ বেছে নিন। বাংলা অর্থের পাশে নিজের জীবনের একটি ইংরেজি বাক্য লিখুন। পরদিন বই বন্ধ রেখে মনে করার চেষ্টা করুন।",
  "Exam facts": "পরীক্ষার ধরন বোঝার জন্য পড়ুন। বুকিংয়ের আগে তারিখ, ফি ও নিয়ম পরীক্ষার আয়োজকের বর্তমান তথ্য থেকে মিলিয়ে নিন।",
};
