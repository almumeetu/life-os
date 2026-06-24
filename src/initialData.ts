import { LifeOSState } from './types';

export const INITIAL_LIFE_OS_STATE: LifeOSState = {
  profile: {
    fullName: "Alex Rivera",
    nickname: "Alex",
    dob: "1997-08-14",
    gender: "Non-binary",
    bloodGroup: "O-positive",
    nationality: "American",
    address: "San Francisco, CA, USA",
    phone: "+1 (555) 019-2834",
    email: "alex.rivera@dev.io",
    website: "https://alexrivera.dev",
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexriveradevs",
      github: "https://github.com/alexriveradev",
      twitter: "https://twitter.com/alex_codes",
      youtube: "https://youtube.com/c/alexcodesdesign"
    }
  },
  resumes: [
    {
      id: "res-1",
      title: "Senior Full-Stack Engineer Resume (ATS Friendly)",
      summary: "Results-driven Full-Stack Engineer with 5+ years of experience building high-performance web applications. Specialized in React, Node.js, TypeScript, and cloud architecture. Proven track record of optimizing application load times by 40% and leading cross-functional teams to deliver enterprise-ready features.",
      experienceIds: ["exp-1", "exp-2"],
      educationIds: ["edu-1"],
      skillIds: ["sk-1", "sk-2", "sk-3", "sk-4", "sk-7"],
      projectIds: ["prj-1", "prj-2"],
      customSections: [
        {
          title: "Core Philosophy",
          content: "Believer in clean code, automated testing, and building software that directly drives business metrics. Enthusiastic about mentor-leadership and building supportive engineering cultures."
        }
      ]
    },
    {
      id: "res-2",
      title: "Freelance / Remote Consultant Resume",
      summary: "Autonomous Web Consultant and Technical Architect specializing in rapid prototyping, serverless APIs, and highly scalable frontend systems. Helping startup founders transform napkin ideas into high-converting MVPs using modern technology stacks.",
      experienceIds: ["exp-2"],
      educationIds: ["edu-1"],
      skillIds: ["sk-1", "sk-2", "sk-4", "sk-5"],
      projectIds: ["prj-2"],
      customSections: []
    }
  ],
  portfolio: {
    url: "https://alexrivera.dev",
    liveDemoUrl: "https://portfolio.alexrivera.dev",
    caseStudies: [
      {
        title: "Scaling SaaS Metrics Dashboard to 100k Daily Active Users",
        challenge: "The client dashboard experienced slow queries (8s+) due to unoptimized Postgres joins and un-indexed timestamp queries. Real-time updates choked the browser on low-end devices.",
        solution: "Implemented Redis caching layer, optimized database indexes, and redesigned the frontend state pipeline with React Virtualized to only render visible charts.",
        results: "Dashboard loading time decreased from 8.2s to 320ms. Server CPU load dropped by 65%, and UX scores increased by 44%."
      }
    ]
  },
  projects: [
    {
      id: "prj-1",
      title: "SyncFlow SaaS Dashboard",
      description: "A real-time analytics platform for enterprise team operations. Includes interactive charts, multi-workspace support, and smart telemetry alerts.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express", "D3.js", "Redis"],
      githubUrl: "https://github.com/alexriveradev/syncflow-dashboard",
      liveUrl: "https://syncflow.dev",
      challenges: "Handling real-time visual updates for 1,000+ data points per second without visual lag.",
      solutions: "Used Web Workers to parse incoming web socket metrics, and updated local D3 paths inside requestAnimationFrame.",
      features: "Real-time collaboration, fully editable charts, dynamic alert thresholds, custom workspaces.",
      futureImprovements: "Predictive anomaly detection using lightweight client-side model, deeper integration with Slack webhooks.",
      status: "Completed"
    },
    {
      id: "prj-2",
      title: "EchoNotes Editor",
      description: "A secure, offline-first collaborative markdown editor utilizing CRDTs for frictionless text syncing across distributed devices.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Yjs", "WebRTC", "IndexedDB"],
      githubUrl: "https://github.com/alexriveradev/echonotes-editor",
      liveUrl: "https://echonotes.app",
      challenges: "Handling merge conflicts gracefully when multiple users edit the exact same sentence offline.",
      solutions: "Integrated Yjs CRDT library with IndexedDB, enabling eventual consistency and seamless offline sync over WebRTC.",
      features: "Complete markdown support, focus mode, folder organization, export as PDF/HTML, peer-to-peer live sharing.",
      futureImprovements: "Encrypted notes backup to decentralized IPFS storage, voice-to-text formatting assistants.",
      status: "In Progress"
    }
  ],
  career: [
    {
      id: "exp-1",
      company: "Vortex Tech Solutions",
      designation: "Senior Software Engineer",
      startDate: "2024-02",
      endDate: "Present",
      current: true,
      salary: "$145,000 / year",
      achievements: [
        "Led team of 4 frontend engineers to rebuild core client dashboard, reducing time-to-interactive by 1.8 seconds.",
        "Implemented standardized UI library using Tailwind CSS and Radix UI primitives, increasing team velocity by 30%.",
        "Pioneered end-to-end testing pipeline with Playwright, decreasing production bugs by 22%."
      ]
    },
    {
      id: "exp-2",
      company: "Novis Systems Inc.",
      designation: "Frontend Engineer",
      startDate: "2021-06",
      endDate: "2024-01",
      current: false,
      salary: "$110,000 / year",
      achievements: [
        "Developed and maintained user-facing features for a high-traffic e-commerce portal handling $2M+ in monthly sales.",
        "Optimized asset bundle sizes using Tree Shaking and dynamic imports, reducing production chunk sizes by 40%.",
        "Collaborated with product design teams to build fully WCAG 2.1 AA accessible web layouts."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      gpa: "3.82 / 4.0",
      startDate: "2017-09",
      endDate: "2021-05",
      certificates: ["Dean's Honor List (2019-2021)"],
      transcripts: []
    }
  ],
  learning: [
    {
      id: "lrn-1",
      course: "Next.js 15 App Router Deep Dive",
      technology: "Next.js & React Server Components",
      roadmap: ["Server Component architecture", "Streaming and Suspense", "PPR (Partial Prerendering)", "Server Actions security"],
      progress: 75
    },
    {
      id: "lrn-2",
      course: "Google Cloud Professional Architect Training",
      technology: "GCP Cloud Infrastructure",
      roadmap: ["IAM Policies", "Cloud Run Containerization", "Spanner Database Setup", "Pub/Sub Messaging"],
      progress: 40
    }
  ],
  skills: [
    { id: "sk-1", name: "TypeScript", category: "Technical", level: "Expert" },
    { id: "sk-2", name: "React / React Native", category: "Technical", level: "Expert" },
    { id: "sk-3", name: "Node.js (Express)", category: "Technical", level: "Advanced" },
    { id: "sk-4", name: "Tailwind CSS", category: "Technical", level: "Expert" },
    { id: "sk-5", name: "PostgreSQL", category: "Technical", level: "Advanced" },
    { id: "sk-6", name: "Docker & Kubernetes", category: "Technical", level: "Intermediate" },
    { id: "sk-7", name: "Technical Writing", category: "Soft", level: "Advanced" },
    { id: "sk-8", name: "Spanish", category: "Language", level: "Intermediate" }
  ],
  freelancing: {
    upworkUrl: "https://upwork.com/freelancers/~017a89f92b7c",
    fiverrUrl: "",
    freelancerUrl: "",
    peoplePerHourUrl: "",
    earnings: 45200,
    proposals: [
      {
        id: "prop-1",
        client: "Stark Financials",
        jobTitle: "Senior React Developer for Financial Dashboard MVP",
        status: "Accepted",
        date: "2026-05-12"
      },
      {
        id: "prop-2",
        client: "Lumina Labs",
        jobTitle: "Express API Performance Audit Consultant",
        status: "Submitted",
        date: "2026-06-20"
      }
    ],
    clients: ["Stark Financials", "Novis Labs", "Greenwood Eco"],
    contracts: [
      {
        id: "ctr-1",
        title: "Interactive Charts Implementation",
        value: 4500,
        status: "Completed"
      },
      {
        id: "ctr-2",
        title: "Next.js Migration & Core Web Vitals Audit",
        value: 12000,
        status: "Active"
      }
    ]
  },
  documents: [
    {
      id: "doc-1",
      name: "Alex Rivera US Passport Copy",
      category: "Personal",
      type: "Passport",
      fileName: "Passport_Alex_Rivera_Copy.pdf",
      fileSize: "1.4 MB",
      uploadedAt: "2026-01-10",
      expiryDate: "2031-04-18"
    },
    {
      id: "doc-2",
      name: "Berkeley BS CS Degree Certificate",
      category: "Professional",
      type: "Certificate",
      fileName: "Berkeley_CS_Degree_Official.pdf",
      fileSize: "2.1 MB",
      uploadedAt: "2026-01-10"
    }
  ],
  applications: [
    {
      id: "app-1",
      company: "Linear",
      position: "Senior Frontend Engineer",
      applicationDate: "2026-06-10",
      interviewDate: "2026-06-25",
      status: "Technical Interview"
    },
    {
      id: "app-2",
      company: "Stripe",
      position: "Staff React Engineer",
      applicationDate: "2026-06-05",
      status: "HR Review"
    },
    {
      id: "app-3",
      company: "Notion",
      position: "Product Developer (Systems)",
      applicationDate: "2026-05-20",
      status: "Rejected"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      credentialUrl: "https://aws.amazon.com/verification/129as8djas9",
      expiryDate: "2028-11-20"
    }
  ],
  goals: [
    {
      id: "goal-1",
      title: "Write 3 tech articles on advanced React state patterns",
      timeframe: "Monthly",
      completed: true,
      dueDate: "2026-06-30"
    },
    {
      id: "goal-2",
      title: "Exercise 30 mins each morning before starting coding",
      timeframe: "Daily",
      completed: false
    },
    {
      id: "goal-3",
      title: "Launch Life OS MVP on Product Hunt",
      timeframe: "Yearly",
      completed: false,
      dueDate: "2026-12-15"
    }
  ],
  notes: [
    {
      id: "note-1",
      title: "Self-Marketing Strategies for 2026",
      content: "# Self-Marketing Guide for Developers\n\nTo command premium rates and attract high-caliber projects as a software engineer, building a public brand is crucial. Here are my focal points:\n\n### 1. Build in Public\n- Share architectural diagrams, bottlenecks solved, and performance benchmarks on Twitter/X and LinkedIn.\n- Frame failures as lessons; people connect with the authentic engineering process.\n\n### 2. High-Quality Technical Writing\n- Focus on deep dives rather than generic tutorials. Explain the *internals* (e.g., \"How React Fiber scales diffing loops\").\n- Distribute articles via Dev.to, Medium, and own newsletter.\n\n### 3. Open Source Contributions\n- Maintain tiny, high-utility hooks or utility packages on GitHub.\n- Keep README docs exceptionally detailed with copy-pasteable demos.",
      tags: ["Career", "Writing", "Growth"],
      updatedAt: "2026-06-22"
    },
    {
      id: "note-2",
      title: "Master Password Reminder & Crypto Setup",
      content: "## Password Vault Guide\n\nAll passwords are encrypted client-side using industry-standard **AES-GCM 256-bit** encryption.\nYour Master Password acts as the encryption key through PBKDF2 hashing.\n\n- **Never** share your Master Password.\n- We **do not** store your master password on any server. If lost, your credentials cannot be recovered.\n- Export backups regularly to avoid browser cache loss.",
      tags: ["Security", "Passwords"],
      updatedAt: "2026-06-18"
    }
  ],
  contacts: [
    {
      id: "cnt-1",
      name: "Sarah Rivera",
      relationship: "Family",
      email: "sarah.rivera@family.org",
      phone: "+1 (555) 902-1249",
      notes: "Sister. Primary emergency contact."
    },
    {
      id: "cnt-2",
      name: "Marcus Vance",
      relationship: "Professional",
      email: "m.vance@vortexsolutions.com",
      phone: "+1 (555) 304-9812",
      notes: "Engineering Director at Vortex Tech. Good for reference checks."
    }
  ],
  assets: [
    {
      id: "ast-1",
      name: "MacBook Pro M3 Max (16-inch, 64GB RAM)",
      type: "Hardware",
      details: "Serial Number: C02DF9H8MD6T. Primary work computer.",
      cost: 3899
    },
    {
      id: "ast-2",
      name: "alexrivera.dev Domain Registration",
      type: "Digital",
      details: "Registered via Namecheap. Auto-renews yearly.",
      cost: 12,
      expiryDate: "2027-05-18"
    }
  ],
  passwords: [
    {
      id: "pass-1",
      website: "https://github.com",
      username: "alexriveradev",
      notes: "Personal coding profile & open source source-of-truth."
    },
    {
      id: "pass-2",
      website: "https://linear.app",
      username: "alex.rivera@dev.io",
      notes: "Company issue tracking workspace."
    }
  ],
  activity: [
    {
      id: "act-1",
      timestamp: "2026-06-23T20:15:00Z",
      module: "Profile",
      action: "Updated",
      details: "Updated LinkedIn and Github profile links"
    },
    {
      id: "act-2",
      timestamp: "2026-06-23T18:42:00Z",
      module: "Notes",
      action: "Created",
      details: "Created note 'Self-Marketing Strategies for 2026'"
    },
    {
      id: "act-3",
      timestamp: "2026-06-23T15:10:00Z",
      module: "Job Tracker",
      action: "Added",
      details: "Submitted job application for Senior Frontend Engineer at Linear"
    }
  ],
  banks: [
    {
      id: "bnk-1",
      bankName: "Chase Bank",
      accountName: "Alex Rivera checking",
      accountNumber: "•••• 9012",
      routingNumber: "021000021",
      type: "Checking"
    },
    {
      id: "bnk-2",
      bankName: "Vanguard brokerage",
      accountName: "Alex Rivera investment index",
      accountNumber: "•••• 4567",
      routingNumber: "021000021",
      type: "Savings"
    }
  ],
  subscriptions: [
    {
      id: "sub-1",
      serviceName: "GitHub Copilot Pro",
      cost: 10,
      billingCycle: "Monthly",
      nextRenewal: "2026-07-12",
      active: true
    },
    {
      id: "sub-2",
      serviceName: "Google Cloud AI Platform",
      cost: 49,
      billingCycle: "Monthly",
      nextRenewal: "2026-07-18",
      active: true
    },
    {
      id: "sub-3",
      serviceName: "Figma Professional Plan",
      cost: 15,
      billingCycle: "Monthly",
      nextRenewal: "2026-07-22",
      active: true
    }
  ],
  vaultDocuments: [],
  encryptedPasswords: [],
  aiSessionMessages: []
};
