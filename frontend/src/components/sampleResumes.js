export const sampleResumes = [
  {
    id: "cs-fresher",
    label: "CS Graduate",
    category: "Fresher",
    description: "B.Tech CS graduate targeting entry-level developer roles",
    template: "teal-edge",
    color: "#0f766e",
    data: {
      candidateType: "Fresher",
      fullName: "Arjun Mehta",
      title: "Software Developer",
      contact: {
        email: "arjun.mehta@email.com",
        phone: "+91 98765 43210",
        location: "Pune, India",
        linkedin: "linkedin.com/in/arjun-mehta",
        portfolio: "github.com/arjunmehta"
      },
      summary: "Detail-oriented Computer Science graduate with strong foundations in web development and data structures. Completed 3 industry-grade projects using React and Node.js. Seeking an entry-level Software Developer role to build scalable applications and grow within a product-driven team.",
      skills: ["Python", "Java", "JavaScript", "React.js", "Node.js", "SQL", "Data Structures & Algorithms", "Git & GitHub", "REST APIs", "HTML & CSS"],
      experience: [],
      projects: [
        {
          name: "Student Task Manager",
          subtitle: "React, Node.js, MongoDB",
          bullets: [
            "Built a full-stack task management app for 200+ college students with JWT authentication and real-time notifications",
            "Reduced task overdue rate by 35% among beta testers through deadline reminders and progress tracking",
            "Deployed on Heroku with automated CI/CD pipeline using GitHub Actions, achieving 99.7% uptime"
          ]
        },
        {
          name: "E-Commerce Price Tracker",
          subtitle: "Python, BeautifulSoup, PostgreSQL",
          bullets: [
            "Developed a web scraper tracking 500+ product prices across 3 major e-commerce platforms",
            "Automated daily price alerts via email, saving users an average of 18% on tracked purchases",
            "Built a REST API to expose price history data, handling 1,000+ requests per day"
          ]
        },
        {
          name: "Library Management System",
          subtitle: "Java, Spring Boot, MySQL",
          bullets: [
            "Created a library management system for a 10,000-book catalog with role-based access for librarians and students",
            "Implemented search and filter functionality that reduced book retrieval time by 60%"
          ]
        }
      ],
      education: [
        {
          degree: "B.Tech in Computer Science & Engineering",
          institution: "VIT University, Pune",
          duration: "2020 – 2024",
          details: "8.6 CGPA · Specialization in Cloud Computing"
        }
      ],
      certifications: ["AWS Certified Cloud Practitioner", "Meta Frontend Developer Certificate (Coursera)", "HackerRank Python Gold Badge"],
      coursework: ["Data Structures & Algorithms", "Database Management Systems", "Operating Systems", "Computer Networks", "Cloud Computing", "Software Engineering"],
      achievements: [
        "1st place at Intra-College Hackathon 2023 — 45 competing teams",
        "Solved 300+ problems on LeetCode (Top 15% globally)",
        "Technical Head, CS Association — organised 4 coding events for 200+ students",
        "Published research paper on Efficient Graph Traversal Algorithms in college tech journal"
      ],
      keywords: ["software developer", "fresher", "React", "Node.js", "Java", "Python", "AWS", "entry level"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "frontend-dev",
    label: "Frontend Developer",
    category: "Experienced",
    description: "React specialist with 2 years building production web apps",
    template: "indigo-column",
    color: "#4338ca",
    data: {
      fullName: "Priya Sharma",
      title: "Frontend Developer",
      contact: {
        email: "priya.sharma@email.com",
        phone: "+91 98800 12345",
        location: "Bengaluru, India",
        linkedin: "linkedin.com/in/priya-sharma-dev",
        portfolio: "priyasharma.dev"
      },
      summary: "Frontend Developer with 2+ years of experience building responsive, accessible web applications using React and TypeScript. Delivered 5 production features across fintech and SaaS products. Skilled in component architecture, performance optimisation, and cross-team collaboration with design and backend teams.",
      skills: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "Redux Toolkit", "GraphQL", "Jest & React Testing Library", "Figma", "Git", "CI/CD", "Web Accessibility (WCAG)"],
      experience: [
        {
          role: "Frontend Developer",
          company: "FinFlow Technologies",
          duration: "Jul 2022 – Present",
          location: "Bengaluru (Hybrid)",
          bullets: [
            "Built and shipped 5 customer-facing dashboard features used by 40,000+ active users with zero critical post-release bugs",
            "Reduced initial page load time by 42% by implementing code splitting, lazy loading, and image optimisation across the product",
            "Migrated a 15,000-line codebase from JavaScript to TypeScript, eliminating 38 runtime type errors in production",
            "Established component library of 30+ reusable UI components, cutting feature development time by 25% across the team",
            "Led bi-weekly frontend guild sessions on React performance patterns attended by 8 engineers"
          ]
        },
        {
          role: "Junior Frontend Developer",
          company: "WebCraft Studio",
          duration: "Jan 2022 – Jun 2022",
          location: "Remote",
          bullets: [
            "Developed responsive landing pages and product UIs for 6 client projects using React and vanilla CSS",
            "Collaborated with designers to implement pixel-perfect designs with cross-browser compatibility",
            "Reduced CSS bundle size by 30% by auditing and removing unused styles across 3 projects"
          ]
        }
      ],
      projects: [
        {
          name: "Design System – FinFlow UI Kit",
          subtitle: "React, Storybook, Tailwind CSS",
          bullets: [
            "Architected a shared design system with 30+ components used across 3 product teams",
            "Documented components in Storybook; reduced designer-developer sync meetings by 40%"
          ]
        }
      ],
      education: [
        {
          degree: "B.E. in Computer Science",
          institution: "RV College of Engineering, Bengaluru",
          duration: "2018 – 2022",
          details: "8.1 CGPA"
        }
      ],
      certifications: ["Meta React Developer Certificate", "Google UX Design Certificate (Coursera)"],
      coursework: [],
      achievements: [],
      keywords: ["frontend developer", "React", "TypeScript", "Next.js", "web performance", "UI", "component library"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "backend-dev",
    label: "Backend Developer",
    category: "Experienced",
    description: "Java/Spring Boot engineer with 3 years in API & microservices",
    template: "executive-slate",
    color: "#16324f",
    data: {
      fullName: "Rohan Kumar",
      title: "Backend Developer",
      contact: {
        email: "rohan.kumar@email.com",
        phone: "+91 97700 56789",
        location: "Hyderabad, India",
        linkedin: "linkedin.com/in/rohan-kumar-backend",
        portfolio: "github.com/rohankumar"
      },
      summary: "Backend Developer with 3 years of experience designing and maintaining high-throughput Java microservices. Delivered APIs serving 2M+ daily requests at Infosys and Paytm. Deep expertise in Spring Boot, PostgreSQL, and Kafka. Passionate about building resilient, observable systems with clean, testable code.",
      skills: ["Java 17", "Spring Boot", "Microservices", "PostgreSQL", "Redis", "Apache Kafka", "Docker", "Kubernetes", "REST APIs", "JUnit & Mockito", "CI/CD (Jenkins)", "AWS (EC2, RDS, SQS)"],
      experience: [
        {
          role: "Backend Developer",
          company: "Paytm (One97 Communications)",
          duration: "Aug 2022 – Present",
          location: "Noida, India",
          bullets: [
            "Designed and owned 4 core payment microservices processing 2M+ transactions per day with 99.95% uptime",
            "Reduced API p99 latency from 420ms to 110ms by introducing Redis caching and query optimisation across 3 high-traffic endpoints",
            "Implemented idempotency keys and distributed locks to eliminate 100% of duplicate payment events",
            "Led migration of legacy monolith module to event-driven architecture using Kafka, reducing inter-service coupling and improving team deployment independence",
            "Mentored 2 junior developers; reviewed 150+ pull requests over 12 months"
          ]
        },
        {
          role: "Software Engineer",
          company: "Infosys Limited",
          duration: "Jul 2021 – Jul 2022",
          location: "Pune, India",
          bullets: [
            "Developed 12 REST APIs for a banking client's loan origination system, handling 50,000+ daily requests",
            "Wrote 300+ unit and integration tests achieving 88% code coverage, reducing regression defects by 65%",
            "Participated in on-call rotation and resolved 15+ production incidents with average MTTR of 22 minutes"
          ]
        }
      ],
      projects: [
        {
          name: "Payment Reconciliation Engine",
          subtitle: "Java, Spring Batch, PostgreSQL, Kafka",
          bullets: [
            "Built a batch processing engine reconciling 500,000+ daily transactions between 3 payment gateways",
            "Reduced reconciliation discrepancies by 94% and manual finance team effort by 8 hours per week"
          ]
        }
      ],
      education: [
        {
          degree: "B.Tech in Information Technology",
          institution: "NIT Warangal",
          duration: "2017 – 2021",
          details: "8.3 CGPA"
        }
      ],
      certifications: ["AWS Certified Developer – Associate", "Oracle Java SE 11 Developer Certified"],
      coursework: [],
      achievements: [],
      keywords: ["backend developer", "Java", "Spring Boot", "microservices", "Kafka", "PostgreSQL", "AWS", "REST API"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "data-analyst",
    label: "Data Analyst",
    category: "Experienced",
    description: "SQL & Python analyst turning raw data into business decisions",
    template: "data-sharp",
    color: "#0891b2",
    data: {
      fullName: "Sneha Reddy",
      title: "Data Analyst",
      contact: {
        email: "sneha.reddy@email.com",
        phone: "+91 99900 34567",
        location: "Bengaluru, India",
        linkedin: "linkedin.com/in/sneha-reddy-data",
        portfolio: ""
      },
      summary: "Data Analyst with 2+ years of experience translating complex datasets into actionable business insights for growth and product teams. Delivered 15+ analytical reports at Flipkart that directly influenced pricing and inventory decisions worth ₹8Cr+. Proficient in SQL, Python, and Power BI.",
      skills: ["SQL (PostgreSQL, MySQL)", "Python (Pandas, NumPy, Matplotlib)", "Power BI", "Tableau", "Excel & Google Sheets", "Statistical Analysis", "A/B Testing", "Data Cleaning & EDA", "BigQuery", "Looker"],
      experience: [
        {
          role: "Data Analyst",
          company: "Flipkart Internet Pvt. Ltd.",
          duration: "Sep 2022 – Present",
          location: "Bengaluru, India",
          bullets: [
            "Built and maintained 12 Power BI dashboards tracking GMV, conversion rates, and category performance, used daily by 25 stakeholders across product and business teams",
            "Conducted A/B test analysis on 4 checkout UX experiments, identifying changes that improved conversion rate by 8.5% (revenue impact: ₹2.3Cr/month)",
            "Automated 6 weekly reports using Python scripts, saving 12 hours of manual analyst effort per week",
            "Designed a demand forecasting model using time-series analysis that reduced overstock by 14% in the electronics category",
            "Performed cohort analysis on 500K+ user records to identify churn drivers, informing a retention campaign with 22% re-engagement rate"
          ]
        },
        {
          role: "Business Analyst Intern",
          company: "InMobi Technologies",
          duration: "Jan 2022 – Aug 2022",
          location: "Bengaluru, India",
          bullets: [
            "Analysed ad campaign performance data for 50+ clients using SQL and Excel, delivering weekly performance decks",
            "Cleaned and processed 3M+ rows of raw event data from BI tools, improving data reliability for 4 downstream dashboards"
          ]
        }
      ],
      projects: [
        {
          name: "Customer Churn Prediction Model",
          subtitle: "Python, Scikit-learn, Logistic Regression",
          bullets: [
            "Built a churn prediction model on 100K subscriber records achieving 84% accuracy and 0.79 AUC",
            "Delivered findings to the retention team; model-driven outreach reduced churn by 18% over the following quarter"
          ]
        }
      ],
      education: [
        {
          degree: "B.Sc. in Statistics & Data Science",
          institution: "Christ University, Bengaluru",
          duration: "2019 – 2022",
          details: "8.8 CGPA · First Class with Distinction"
        }
      ],
      certifications: ["Google Data Analytics Professional Certificate", "Microsoft Power BI Data Analyst (PL-300)", "HackerRank SQL Advanced"],
      coursework: [],
      achievements: [],
      keywords: ["data analyst", "SQL", "Python", "Power BI", "Tableau", "A/B testing", "analytics", "business intelligence"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "fullstack-dev",
    label: "Full Stack Developer",
    category: "Experienced",
    description: "MERN stack engineer with 4 years end-to-end product delivery",
    template: "startup-clean",
    color: "#059669",
    data: {
      fullName: "Vikram Singh",
      title: "Full Stack Developer",
      contact: {
        email: "vikram.singh@email.com",
        phone: "+91 96600 78901",
        location: "Bengaluru, India",
        linkedin: "linkedin.com/in/vikram-singh-fullstack",
        portfolio: "vikramsingh.dev"
      },
      summary: "Full Stack Developer with 4 years of experience delivering end-to-end features across React frontends and Node.js/Python backends. Contributed to products used by 200K+ users at Razorpay and Urban Company. Strong ownership mindset — from API design to production deployment on AWS.",
      skills: ["React.js", "Next.js", "Node.js", "Express.js", "Python (FastAPI)", "MongoDB", "PostgreSQL", "Redis", "AWS (EC2, S3, Lambda)", "Docker", "TypeScript", "GraphQL", "Stripe API", "Jest"],
      experience: [
        {
          role: "Full Stack Developer",
          company: "Razorpay Software Pvt. Ltd.",
          duration: "Mar 2022 – Present",
          location: "Bengaluru (Hybrid)",
          bullets: [
            "Owned end-to-end development of the merchant onboarding flow used by 80,000+ new businesses, reducing drop-off by 31%",
            "Built a real-time webhook delivery system in Node.js processing 500K+ events/day with at-least-once delivery guarantees",
            "Reduced backend API response times by 55% through database indexing, query rewrites, and Redis caching strategies",
            "Architected a multi-tenant dashboard with role-based access control serving 3 product tiers with zero cross-tenant data leaks",
            "Collaborated with 2 designers and 3 backend engineers across 8 feature releases; maintained 95%+ sprint velocity"
          ]
        },
        {
          role: "Software Developer",
          company: "Urban Company (UrbanClap)",
          duration: "Jun 2020 – Feb 2022",
          location: "Gurugram, India",
          bullets: [
            "Developed consumer-facing booking flow features in React Native and Node.js used by 1.2M monthly active users",
            "Integrated 3rd-party payment gateways (Paytm, UPI, Cards) handling ₹5Cr+ in monthly transactions",
            "Built a service partner location-tracking feature using WebSockets, improving customer satisfaction scores by 14%"
          ]
        }
      ],
      projects: [
        {
          name: "Open-Source SaaS Starter Kit",
          subtitle: "Next.js, Prisma, PostgreSQL, Stripe",
          bullets: [
            "Built a production-ready SaaS boilerplate with auth, billing, and team management — 1,200+ GitHub stars",
            "Integrated Stripe subscriptions, multi-tenant routing, and email workflows in a single deployable template"
          ]
        }
      ],
      education: [
        {
          degree: "B.E. in Computer Science",
          institution: "BITS Pilani, Goa Campus",
          duration: "2016 – 2020",
          details: "7.9 CGPA"
        }
      ],
      certifications: ["AWS Certified Solutions Architect – Associate", "MongoDB Certified Developer"],
      coursework: [],
      achievements: [],
      keywords: ["full stack", "MERN", "React", "Node.js", "AWS", "MongoDB", "PostgreSQL", "microservices"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "product-manager",
    label: "Product Manager",
    category: "Experienced",
    description: "Growth-focused PM with 5 years shipping B2C and B2B products",
    template: "product-leader",
    color: "#7c3aed",
    data: {
      fullName: "Aditya Gupta",
      title: "Product Manager",
      contact: {
        email: "aditya.gupta@pm.com",
        phone: "+91 95555 22334",
        location: "Mumbai, India",
        linkedin: "linkedin.com/in/aditya-gupta-pm",
        portfolio: ""
      },
      summary: "Product Manager with 5 years leading cross-functional teams to ship growth and retention products for B2C and SaaS platforms. Drove 34% DAU growth at Meesho and launched a zero-to-one subscription product at Zoho. Strong background in user research, data-informed decision making, and working across engineering, design, and business teams.",
      skills: ["Product Strategy & Roadmapping", "User Research & Interviews", "A/B Testing & Experimentation", "SQL & Data Analysis", "Wireframing (Figma)", "OKR Frameworks", "Agile / Scrum", "Jira & Confluence", "Growth Metrics (DAU, Retention, LTV)", "Stakeholder Management"],
      experience: [
        {
          role: "Product Manager – Growth",
          company: "Meesho (Fashnear Technologies)",
          duration: "Apr 2022 – Present",
          location: "Bengaluru, India",
          bullets: [
            "Owned the new user activation funnel for 8M+ monthly new installs; shipped 6 onboarding experiments that improved D7 retention by 22%",
            "Led discovery and delivery of a social sharing feature that drove 34% increase in DAU from referral channels within 2 quarters",
            "Ran a 4-week user research sprint (16 in-depth interviews, 2,000 survey responses) that identified 3 friction points in the first-time buyer journey, directly informing Q3 roadmap",
            "Defined and tracked growth OKRs across 3 squads; built weekly dashboards used by VP Product in leadership reviews",
            "Reduced average time-to-first-purchase by 40% by simplifying the checkout flow from 7 steps to 4"
          ]
        },
        {
          role: "Associate Product Manager",
          company: "Zoho Corporation",
          duration: "Jul 2019 – Mar 2022",
          location: "Chennai, India",
          bullets: [
            "Launched a zero-to-one subscription tier for Zoho Books, acquiring 4,200 paying customers in the first 6 months",
            "Collaborated with engineering (8 engineers) and design (3 designers) to deliver 18 features across 4 release cycles",
            "Interviewed 40+ SME customers to define the MLP; reduced scope by 35% without compromising core value delivery"
          ]
        }
      ],
      projects: [
        {
          name: "Referral Growth Loop – Meesho",
          subtitle: "Cross-functional project: Growth PM + Data + Engineering",
          bullets: [
            "Designed and shipped a peer-referral program from scratch that became the #2 channel for new user acquisition",
            "Program generated 1.2M referred installs within 3 months with CAC 60% lower than paid channels"
          ]
        }
      ],
      education: [
        {
          degree: "MBA – Marketing & Strategy",
          institution: "IIM Lucknow",
          duration: "2017 – 2019",
          details: "Dean's List · Consulting Club President"
        },
        {
          degree: "B.Tech in Electronics & Communication",
          institution: "NIT Trichy",
          duration: "2013 – 2017",
          details: "7.6 CGPA"
        }
      ],
      certifications: ["Product Management Certificate – Reforge", "Google Analytics Individual Qualification"],
      coursework: [],
      achievements: [],
      keywords: ["product manager", "growth", "roadmap", "A/B testing", "retention", "OKR", "agile", "user research", "DAU"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "marketing-exec",
    label: "Digital Marketing Executive",
    category: "Experienced",
    description: "SEO & content specialist driving organic growth for D2C brands",
    template: "creative-line",
    color: "#be185d",
    data: {
      fullName: "Kavya Nair",
      title: "Digital Marketing Executive",
      contact: {
        email: "kavya.nair@marketing.com",
        phone: "+91 93300 87654",
        location: "Kochi, India",
        linkedin: "linkedin.com/in/kavya-nair-marketing",
        portfolio: ""
      },
      summary: "Digital Marketing Executive with 3 years of experience growing organic traffic and brand presence for D2C and e-commerce brands. Grew organic traffic by 210% at Nykaa through SEO and content initiatives. Skilled in SEO, paid media, social strategy, and email marketing with a data-first approach to every campaign.",
      skills: ["Search Engine Optimisation (SEO)", "Google Ads & Meta Ads", "Content Marketing & Copywriting", "Email Marketing (Klaviyo, Mailchimp)", "Social Media Strategy", "Google Analytics 4", "Ahrefs & SEMrush", "Canva & Adobe Express", "HubSpot CRM", "A/B Testing – Campaigns"],
      experience: [
        {
          role: "Digital Marketing Executive",
          company: "Nykaa Fashion (FSN E-Commerce)",
          duration: "Aug 2022 – Present",
          location: "Mumbai, India",
          bullets: [
            "Grew organic search traffic by 210% over 18 months through on-page SEO, technical audits, and 40+ optimised blog articles",
            "Managed Google Ads and Meta Ads campaigns with a combined monthly budget of ₹12 lakhs, achieving average ROAS of 4.2x",
            "Launched a 6-touch email nurture sequence for cart abandonment that recovered ₹35 lakhs in lost revenue in Q3 FY24",
            "Grew Instagram following from 42K to 118K followers in 14 months through influencer partnerships and reels strategy",
            "Led a 3-person content team; planned and published 20+ pieces of content monthly across blog, social, and email"
          ]
        },
        {
          role: "Marketing Executive",
          company: "The Souled Store",
          duration: "May 2021 – Jul 2022",
          location: "Mumbai, India",
          bullets: [
            "Created and scheduled 120+ social media posts per quarter, growing engagement rate from 2.1% to 4.6%",
            "Assisted in managing Meta Ads campaigns with ₹3 lakhs monthly budget; reduced CPL by 28% through audience segmentation",
            "Wrote product descriptions for 200+ SKUs, improving organic discovery and on-site conversion"
          ]
        }
      ],
      projects: [
        {
          name: "Summer Sale SEO Campaign – Nykaa",
          subtitle: "SEO + Paid + Content integrated campaign",
          bullets: [
            "Planned and executed integrated campaign across SEO, Google Shopping, and social media for the annual summer sale",
            "Generated 3.2 lakh organic sessions in 4 weeks — the highest organic single-campaign traffic in brand history"
          ]
        }
      ],
      education: [
        {
          degree: "BBA in Marketing",
          institution: "Symbiosis Institute of Business Management, Pune",
          duration: "2018 – 2021",
          details: "8.0 CGPA"
        }
      ],
      certifications: ["Google Analytics 4 Certification", "HubSpot Content Marketing Certification", "Meta Blueprint – Digital Marketing Associate"],
      coursework: [],
      achievements: [],
      keywords: ["digital marketing", "SEO", "content marketing", "Google Ads", "Meta Ads", "email marketing", "social media", "organic growth"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "qa-manual-fresher",
    label: "Manual QA Fresher",
    category: "Fresher",
    description: "Entry-level QA profile with testing projects and defect reporting practice",
    template: "recruiter-focus",
    color: "#2563eb",
    data: {
      candidateType: "Fresher",
      fullName: "Neha Patil",
      title: "Manual QA Tester",
      contact: {
        email: "neha.patil.qa@email.com",
        phone: "+91 98710 22446",
        location: "Pune, India",
        linkedin: "linkedin.com/in/neha-patil-qa",
        portfolio: "github.com/nehapatilqa"
      },
      summary: "Detail-oriented Computer Science graduate seeking an entry-level Manual QA Tester role. Skilled in test case design, functional testing, regression testing, bug reporting, and SDLC/STLC concepts through academic and self-practice projects.",
      skills: ["Manual Testing", "Functional Testing", "Regression Testing", "Smoke Testing", "Test Case Design", "Bug Reporting", "Jira", "Postman", "SQL Basics", "SDLC & STLC", "Agile Basics"],
      experience: [],
      projects: [
        {
          name: "E-Commerce Website Testing",
          subtitle: "Manual Testing, Jira, Test Scenarios",
          bullets: [
            "Prepared 80+ test cases covering login, product search, cart, checkout, and payment flows",
            "Logged 25 defects in Jira with clear severity, priority, screenshots, and reproduction steps",
            "Performed regression testing after fixes and maintained a traceability sheet for core user journeys"
          ]
        },
        {
          name: "Banking Application Test Plan",
          subtitle: "Functional Testing, UAT, Excel",
          bullets: [
            "Created test scenarios for account creation, fund transfer, beneficiary addition, and transaction history",
            "Documented positive and negative test cases with expected results and pass/fail status"
          ]
        }
      ],
      education: [
        {
          degree: "B.Sc. in Computer Science",
          institution: "Savitribai Phule Pune University",
          duration: "2021 - 2024",
          details: "8.4 CGPA"
        }
      ],
      certifications: ["Manual Testing and Jira Certification - Udemy", "Postman API Fundamentals Student Expert"],
      coursework: [],
      achievements: ["Completed 150+ practice test cases across web and mobile app scenarios", "Presented final-year seminar on Software Testing Life Cycle"],
      keywords: ["manual testing", "QA tester", "test cases", "bug reporting", "Jira", "regression testing", "fresher"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "qa-manual-experienced",
    label: "Manual QA Tester",
    category: "Experienced",
    description: "Manual QA professional with web, mobile, and API testing exposure",
    template: "data-sharp",
    color: "#0891b2",
    data: {
      candidateType: "Experienced",
      fullName: "Saurabh Joshi",
      title: "Manual QA Tester",
      contact: {
        email: "saurabh.joshi.qa@email.com",
        phone: "+91 97654 11890",
        location: "Mumbai, India",
        linkedin: "linkedin.com/in/saurabh-joshi-qa",
        portfolio: ""
      },
      summary: "Manual QA Tester with 3 years of experience validating web and mobile applications in fintech and SaaS environments. Strong in test planning, functional testing, regression cycles, API validation, defect lifecycle management, and release sign-off coordination.",
      skills: ["Manual Testing", "Functional Testing", "Regression Testing", "API Testing", "Postman", "Jira", "TestRail", "SQL", "Mobile App Testing", "UAT Support", "Agile Scrum", "Defect Triage"],
      experience: [
        {
          role: "QA Analyst",
          company: "FinEdge Solutions",
          duration: "Jun 2022 - Present",
          location: "Mumbai, India",
          bullets: [
            "Executed functional and regression testing for 12 fintech release cycles with zero critical defects leaked to production",
            "Created and maintained 650+ test cases in TestRail across onboarding, KYC, payments, and reporting modules",
            "Validated REST APIs using Postman and SQL queries, reducing backend defect turnaround time by 30%",
            "Led defect triage calls with product and engineering teams, improving release readiness visibility"
          ]
        },
        {
          role: "Junior QA Tester",
          company: "WebWorks Digital",
          duration: "Jan 2021 - May 2022",
          location: "Pune, India",
          bullets: [
            "Tested 8 client web applications across Chrome, Firefox, Safari, Android, and iOS devices",
            "Reported 300+ actionable defects with reproduction steps, screenshots, logs, and severity mapping"
          ]
        }
      ],
      projects: [
        {
          name: "Loan Origination QA Cycle",
          subtitle: "Manual QA, API Testing, SQL",
          bullets: [
            "Owned end-to-end test execution for customer onboarding and loan approval workflows",
            "Improved test coverage by adding edge cases for failed KYC, duplicate PAN, and payment retry flows"
          ]
        }
      ],
      education: [
        {
          degree: "B.E. in Information Technology",
          institution: "Mumbai University",
          duration: "2017 - 2021",
          details: "7.8 CGPA"
        }
      ],
      certifications: ["ISTQB Foundation Level", "Postman API Testing Certificate"],
      coursework: [],
      achievements: ["Recognized as Release Quality Champion for Q4 2023", "Reduced recurring regression defects by 22% through checklist standardization"],
      languages: ["English", "Hindi", "Marathi"],
      keywords: ["manual QA", "test cases", "Jira", "Postman", "regression testing", "API testing", "defect lifecycle"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "hr-fresher",
    label: "HR Fresher",
    category: "Fresher",
    description: "MBA/BBA fresher targeting HR executive and recruiter roles",
    template: "amber-frame",
    color: "#b45309",
    data: {
      candidateType: "Fresher",
      fullName: "Ananya Verma",
      title: "HR Executive",
      contact: {
        email: "ananya.verma.hr@email.com",
        phone: "+91 98990 44221",
        location: "Delhi, India",
        linkedin: "linkedin.com/in/ananya-verma-hr",
        portfolio: ""
      },
      summary: "MBA HR fresher seeking an HR Executive role to support recruitment, onboarding, employee engagement, and HR operations. Strong understanding of HR policies, talent acquisition basics, HRMS data handling, and employee communication.",
      skills: ["Recruitment Coordination", "Candidate Screening", "Onboarding", "Employee Engagement", "HRMS Basics", "MS Excel", "Interview Scheduling", "HR Documentation", "Communication", "Payroll Basics", "Labour Law Basics"],
      experience: [
        {
          role: "HR Intern",
          company: "PeopleFirst Consulting",
          duration: "May 2024 - Jul 2024",
          location: "Delhi, India",
          bullets: [
            "Screened 120+ resumes for sales and operations roles using job criteria shared by hiring managers",
            "Scheduled 45 interviews and maintained candidate trackers in Excel with follow-up status",
            "Assisted onboarding documentation for 18 new joiners including offer letters, ID proofs, and joining forms"
          ]
        }
      ],
      projects: [
        {
          name: "Employee Engagement Survey Analysis",
          subtitle: "Excel, Google Forms, HR Analytics",
          bullets: [
            "Collected and analyzed 150+ survey responses to identify top engagement drivers among college interns",
            "Presented 5 recommendations around recognition, feedback, and manager communication"
          ]
        }
      ],
      education: [
        {
          degree: "MBA in Human Resource Management",
          institution: "Guru Gobind Singh Indraprastha University",
          duration: "2022 - 2024",
          details: "8.2 CGPA"
        }
      ],
      certifications: ["HR Analytics Foundation", "Recruitment and Talent Acquisition - Coursera"],
      coursework: [],
      achievements: ["Coordinated campus HR club event with 200+ attendees", "Completed internship project on improving onboarding experience"],
      keywords: ["HR fresher", "recruitment", "onboarding", "HR executive", "employee engagement", "HRMS"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "hr-executive",
    label: "HR Executive",
    category: "Experienced",
    description: "HR generalist profile covering recruitment, onboarding, and HR operations",
    template: "burgundy-line",
    color: "#9f1239",
    data: {
      candidateType: "Experienced",
      fullName: "Ritika Menon",
      title: "HR Executive",
      contact: {
        email: "ritika.menon.hr@email.com",
        phone: "+91 98220 33445",
        location: "Chennai, India",
        linkedin: "linkedin.com/in/ritika-menon-hr",
        portfolio: ""
      },
      summary: "HR Executive with 4 years of experience across recruitment, onboarding, HR operations, employee engagement, and payroll coordination. Supported hiring for 120+ roles annually and improved onboarding completion time by 35% through structured documentation and HRMS workflows.",
      skills: ["Talent Acquisition", "HR Operations", "Onboarding", "Employee Engagement", "HRMS", "Payroll Coordination", "Attendance Management", "MIS Reporting", "Policy Communication", "Vendor Coordination", "Exit Formalities"],
      experience: [
        {
          role: "HR Executive",
          company: "TechNova Services",
          duration: "Apr 2021 - Present",
          location: "Chennai, India",
          bullets: [
            "Managed end-to-end hiring coordination for 120+ annual openings across support, sales, and operations teams",
            "Reduced average onboarding completion time from 5 days to 3 days by standardizing document collection and HRMS updates",
            "Prepared monthly HR MIS reports covering headcount, attrition, attendance, and recruitment pipeline metrics",
            "Organized 18 employee engagement activities with average participation above 78%"
          ]
        },
        {
          role: "HR Coordinator",
          company: "BrightPath BPO",
          duration: "Jul 2019 - Mar 2021",
          location: "Chennai, India",
          bullets: [
            "Maintained employee records for 450+ staff members and supported payroll inputs with 99% data accuracy",
            "Handled joining, confirmation, transfer, and exit documentation for frontline employees"
          ]
        }
      ],
      projects: [
        {
          name: "Structured Onboarding Checklist",
          subtitle: "HRMS, Excel, Process Improvement",
          bullets: [
            "Created a 30-day onboarding checklist adopted across 4 departments",
            "Improved new joiner documentation compliance from 82% to 98%"
          ]
        }
      ],
      education: [
        {
          degree: "MBA in Human Resource Management",
          institution: "University of Madras",
          duration: "2017 - 2019",
          details: "First Class"
        }
      ],
      certifications: ["SHRM Essentials of Human Resources", "Advanced Excel for HR"],
      coursework: [],
      achievements: ["Awarded HR Operations Star in 2023", "Reduced joining no-show rate by 18% through candidate engagement process"],
      languages: ["English", "Hindi", "Tamil"],
      keywords: ["HR executive", "recruitment", "onboarding", "HR operations", "payroll", "employee engagement", "HRMS"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "accountant-fresher",
    label: "Accountant Fresher",
    category: "Fresher",
    description: "Commerce graduate targeting accounts assistant and junior accountant roles",
    template: "academic-classic",
    color: "#6b4f2a",
    data: {
      candidateType: "Fresher",
      fullName: "Kunal Shah",
      title: "Junior Accountant",
      contact: {
        email: "kunal.shah.accounts@email.com",
        phone: "+91 97020 55667",
        location: "Ahmedabad, India",
        linkedin: "linkedin.com/in/kunal-shah-accounts",
        portfolio: ""
      },
      summary: "B.Com graduate seeking a Junior Accountant role with knowledge of bookkeeping, GST, TDS, bank reconciliation, journal entries, and financial reporting basics. Comfortable using Tally Prime, MS Excel, and accounting documentation workflows.",
      skills: ["Tally Prime", "MS Excel", "Bookkeeping", "Journal Entries", "Ledger Reconciliation", "Bank Reconciliation", "GST Basics", "TDS Basics", "Accounts Payable", "Accounts Receivable", "Financial Statements"],
      experience: [],
      projects: [
        {
          name: "GST Invoice and Ledger Practice",
          subtitle: "Tally Prime, Excel, GST",
          bullets: [
            "Created sample purchase and sales entries for 3 mock businesses using Tally Prime",
            "Prepared GST invoice registers, ledger summaries, and reconciliation sheets in Excel",
            "Practiced monthly closing entries and trial balance preparation with 100+ transactions"
          ]
        },
        {
          name: "Bank Reconciliation Statement",
          subtitle: "Excel, Accounting Basics",
          bullets: [
            "Prepared BRS for sample current account statements and identified unmatched cheques, bank charges, and delayed deposits",
            "Documented reconciliation steps and closing balance adjustments"
          ]
        }
      ],
      education: [
        {
          degree: "B.Com in Accounting and Finance",
          institution: "Gujarat University",
          duration: "2021 - 2024",
          details: "8.1 CGPA"
        }
      ],
      certifications: ["Tally Prime with GST Certificate", "Advanced Excel for Accounting"],
      coursework: [],
      achievements: ["Prepared final-year project on GST compliance for small businesses", "Handled accounts volunteer work for college commerce fest"],
      keywords: ["junior accountant", "accounts assistant", "Tally", "GST", "TDS", "bookkeeping", "bank reconciliation"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "accountant-experienced",
    label: "Accountant",
    category: "Experienced",
    description: "Accounting profile with GST, TDS, reconciliation, and month-end closing",
    template: "copper-block",
    color: "#92400e",
    data: {
      candidateType: "Experienced",
      fullName: "Meera Iyer",
      title: "Accountant",
      contact: {
        email: "meera.iyer.accounts@email.com",
        phone: "+91 98400 88776",
        location: "Coimbatore, India",
        linkedin: "linkedin.com/in/meera-iyer-accounts",
        portfolio: ""
      },
      summary: "Accountant with 5 years of experience managing bookkeeping, GST filing support, TDS calculations, accounts payable, accounts receivable, bank reconciliation, and month-end closing. Maintained accurate books for SME clients with monthly transaction volume above 2,000 entries.",
      skills: ["Tally ERP", "Tally Prime", "GST Returns", "TDS", "Accounts Payable", "Accounts Receivable", "Bank Reconciliation", "General Ledger", "Month-End Closing", "MS Excel", "MIS Reporting", "Vendor Reconciliation"],
      experience: [
        {
          role: "Accountant",
          company: "Sri Balaji Traders",
          duration: "Aug 2021 - Present",
          location: "Coimbatore, India",
          bullets: [
            "Managed daily accounting for 2,000+ monthly purchase, sales, payment, and receipt entries in Tally Prime",
            "Prepared GST working sheets and supported timely filing of GSTR-1 and GSTR-3B with 99% data accuracy",
            "Completed bank reconciliation for 6 accounts every month and resolved unmatched entries within closing timelines",
            "Maintained vendor and customer ledgers, reducing overdue receivables by 16% through weekly follow-ups"
          ]
        },
        {
          role: "Accounts Assistant",
          company: "Raman & Co.",
          duration: "Jun 2019 - Jul 2021",
          location: "Coimbatore, India",
          bullets: [
            "Processed purchase bills, expense vouchers, and payment entries for 25+ SME clients",
            "Assisted in TDS calculations, ledger scrutiny, and audit file preparation during year-end closing"
          ]
        }
      ],
      projects: [
        {
          name: "Receivables Aging Cleanup",
          subtitle: "Excel, Ledger Review, Follow-up Process",
          bullets: [
            "Created weekly aging report to track overdue customer balances across 180+ accounts",
            "Helped recover Rs.18 lakhs in overdue receivables over 4 months"
          ]
        }
      ],
      education: [
        {
          degree: "B.Com in Accounting",
          institution: "Bharathiar University",
          duration: "2016 - 2019",
          details: "First Class"
        }
      ],
      certifications: ["Tally Prime Professional", "GST Practitioner Training"],
      coursework: [],
      achievements: ["Supported successful statutory audit closure for FY2023 without major observations", "Improved monthly closing checklist adopted by 3 accounting staff"],
      languages: ["English", "Tamil", "Hindi"],
      keywords: ["accountant", "Tally", "GST", "TDS", "bank reconciliation", "accounts payable", "accounts receivable"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "customer-service-fresher",
    label: "Customer Service Fresher",
    category: "Fresher",
    description: "Service-focused fresher for customer support and core service roles",
    template: "global-cv",
    color: "#0e7490",
    data: {
      candidateType: "Fresher",
      fullName: "Farhan Ali",
      title: "Customer Service Associate",
      contact: {
        email: "farhan.ali.service@email.com",
        phone: "+91 99555 44332",
        location: "Lucknow, India",
        linkedin: "linkedin.com/in/farhan-ali-service",
        portfolio: ""
      },
      summary: "Customer-focused graduate seeking a Customer Service Associate role to support query resolution, complaint handling, CRM updates, and service quality. Strong communication skills with practice in call handling, email support, and customer escalation scenarios.",
      skills: ["Customer Support", "Call Handling", "Email Support", "Complaint Resolution", "CRM Basics", "MS Excel", "Problem Solving", "Active Listening", "Service Documentation", "Hindi & English Communication"],
      experience: [],
      projects: [
        {
          name: "Customer Complaint Resolution Simulation",
          subtitle: "CRM Practice, Email Support, Escalation Matrix",
          bullets: [
            "Created 30 sample support cases covering billing issues, delayed delivery, product defects, and refund requests",
            "Drafted professional email responses and escalation notes with clear resolution timelines",
            "Built an Excel tracker to monitor ticket status, SLA, priority, and follow-up ownership"
          ]
        },
        {
          name: "Service Quality Improvement Study",
          subtitle: "Survey, Excel, Customer Feedback",
          bullets: [
            "Collected 100 survey responses on service experience and identified response time as the top improvement area",
            "Presented 4 recommendations to improve first-contact resolution and customer satisfaction"
          ]
        }
      ],
      education: [
        {
          degree: "B.A. in English",
          institution: "University of Lucknow",
          duration: "2021 - 2024",
          details: "7.9 CGPA"
        }
      ],
      certifications: ["Customer Service Skills - LinkedIn Learning", "Excel Basics for Business"],
      coursework: [],
      achievements: ["Volunteered at college helpdesk during admissions season and guided 300+ students", "Won 2nd prize in inter-college debate competition"],
      keywords: ["customer service", "customer support", "CRM", "email support", "call handling", "complaint resolution", "fresher"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "customer-service-experienced",
    label: "Customer Service Executive",
    category: "Experienced",
    description: "Core service profile for support, escalation, and CRM operations",
    template: "ocean-ribbon",
    color: "#0369a1",
    data: {
      candidateType: "Experienced",
      fullName: "Pooja Nair",
      title: "Customer Service Executive",
      contact: {
        email: "pooja.nair.service@email.com",
        phone: "+91 97444 22110",
        location: "Kochi, India",
        linkedin: "linkedin.com/in/pooja-nair-service",
        portfolio: ""
      },
      summary: "Customer Service Executive with 4 years of experience handling voice, email, and chat support for e-commerce and telecom customers. Skilled in CRM documentation, complaint resolution, SLA adherence, escalation management, and improving customer satisfaction scores.",
      skills: ["Customer Support", "Voice Process", "Email & Chat Support", "CRM Tools", "SLA Management", "Complaint Handling", "Escalation Management", "Zendesk", "Freshdesk", "MS Excel", "Quality Monitoring", "Customer Retention"],
      experience: [
        {
          role: "Customer Service Executive",
          company: "QuickCart Services",
          duration: "Mar 2021 - Present",
          location: "Kochi, India",
          bullets: [
            "Handled 70+ customer interactions daily across calls, email, and chat while maintaining 94% quality score",
            "Resolved order, refund, delivery, and product queries with 82% first-contact resolution rate",
            "Reduced average response time by 28% by creating reusable response templates for frequent issues",
            "Escalated high-priority complaints with complete case notes, improving turnaround visibility for supervisors"
          ]
        },
        {
          role: "Customer Support Associate",
          company: "ConnectTel Solutions",
          duration: "Jan 2019 - Feb 2021",
          location: "Kochi, India",
          bullets: [
            "Supported telecom customers with billing, plan activation, network complaints, and service requests",
            "Maintained CRM records with accurate call disposition, follow-up date, and resolution notes"
          ]
        }
      ],
      projects: [
        {
          name: "Refund Query Template Library",
          subtitle: "Zendesk, Process Improvement",
          bullets: [
            "Built 25 approved email templates for common refund and replacement cases",
            "Improved response consistency and reduced average handle time by 18%"
          ]
        }
      ],
      education: [
        {
          degree: "B.Com",
          institution: "Mahatma Gandhi University",
          duration: "2015 - 2018",
          details: "First Class"
        }
      ],
      certifications: ["Zendesk Customer Service Professional", "Business Communication Certificate"],
      coursework: [],
      achievements: ["Employee of the Month - 3 times for quality and CSAT performance", "Maintained CSAT above 91% for 6 consecutive months"],
      languages: ["English", "Hindi", "Malayalam"],
      keywords: ["customer service", "customer support", "CRM", "Zendesk", "SLA", "escalation management", "CSAT"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "test-automation-fresher",
    label: "Test Automation Fresher",
    category: "Fresher",
    description: "Entry-level automation testing profile with Selenium and Java projects",
    template: "tech-matrix",
    color: "#4f46e5",
    data: {
      candidateType: "Fresher",
      fullName: "Ishita Rao",
      title: "Test Automation Engineer",
      contact: {
        email: "ishita.rao.automation@email.com",
        phone: "+91 98888 66770",
        location: "Hyderabad, India",
        linkedin: "linkedin.com/in/ishita-rao-qa",
        portfolio: "github.com/ishitaraoqa"
      },
      summary: "Computer Science graduate seeking a Test Automation Engineer role with hands-on practice in Selenium WebDriver, Java, TestNG, Maven, API testing, and basic CI/CD. Built automation scripts for web application flows and understands test case design, locators, assertions, and reporting.",
      skills: ["Selenium WebDriver", "Java", "TestNG", "Maven", "API Testing", "Postman", "Git", "Jenkins Basics", "Manual Testing", "XPath & CSS Selectors", "Page Object Model", "SQL Basics"],
      experience: [],
      projects: [
        {
          name: "E-Commerce Automation Framework",
          subtitle: "Selenium, Java, TestNG, Maven",
          bullets: [
            "Built a Selenium automation framework covering login, search, cart, checkout, and order confirmation flows",
            "Implemented Page Object Model and reusable utilities for waits, assertions, screenshots, and browser setup",
            "Generated TestNG reports and documented failed test scenarios with screenshots"
          ]
        },
        {
          name: "API Test Collection",
          subtitle: "Postman, Newman, JSON",
          bullets: [
            "Created Postman collections for user, product, and order APIs with positive and negative validations",
            "Automated collection execution using Newman and exported HTML reports"
          ]
        }
      ],
      education: [
        {
          degree: "B.Tech in Computer Science",
          institution: "JNTU Hyderabad",
          duration: "2020 - 2024",
          details: "8.3 CGPA"
        }
      ],
      certifications: ["Selenium WebDriver with Java - Udemy", "Postman API Fundamentals Student Expert"],
      coursework: [],
      achievements: ["Built 60+ automation scripts as part of capstone testing project", "Solved 120+ Java practice problems"],
      keywords: ["test automation", "Selenium", "Java", "TestNG", "Maven", "Postman", "QA fresher"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  },

  {
    id: "test-automation-engineer",
    label: "Test Automation Engineer",
    category: "Experienced",
    description: "Automation QA engineer with Selenium, API testing, and CI pipelines",
    template: "aurora-luxe",
    color: "#2563eb",
    data: {
      candidateType: "Experienced",
      fullName: "Nikhil Bansal",
      title: "Test Automation Engineer",
      contact: {
        email: "nikhil.bansal.qa@email.com",
        phone: "+91 98123 44556",
        location: "Noida, India",
        linkedin: "linkedin.com/in/nikhil-bansal-automation",
        portfolio: "github.com/nikhilbansalqa"
      },
      summary: "Test Automation Engineer with 4 years of experience designing Selenium, Java, TestNG, and API automation frameworks for banking and SaaS products. Reduced regression execution time by 70% through CI-integrated automation suites and improved release confidence across 20+ production deployments.",
      skills: ["Selenium WebDriver", "Java", "TestNG", "Cucumber BDD", "RestAssured", "Postman", "Maven", "Jenkins", "Git", "SQL", "Page Object Model", "Allure Reports", "Agile Scrum"],
      experience: [
        {
          role: "Test Automation Engineer",
          company: "HCLTech",
          duration: "May 2021 - Present",
          location: "Noida, India",
          bullets: [
            "Built and maintained Selenium automation suite with 420+ test scripts covering core banking workflows",
            "Reduced manual regression effort from 5 days to 1.5 days by integrating TestNG suites with Jenkins pipelines",
            "Developed RestAssured API tests for 60+ endpoints and improved backend defect detection before UI testing",
            "Implemented Allure reporting with screenshots and logs, reducing failed-test analysis time by 35%"
          ]
        },
        {
          role: "QA Engineer",
          company: "SoftServe Labs",
          duration: "Jul 2019 - Apr 2021",
          location: "Gurugram, India",
          bullets: [
            "Automated smoke test suites for SaaS dashboards using Selenium, Java, Maven, and Page Object Model",
            "Collaborated with manual QA team to convert high-priority regression cases into reusable automation scripts"
          ]
        }
      ],
      projects: [
        {
          name: "BDD Automation Framework",
          subtitle: "Selenium, Cucumber, TestNG, Jenkins",
          bullets: [
            "Designed BDD framework with reusable step definitions for login, payments, reports, and role-based access",
            "Enabled QA and business users to review readable Gherkin scenarios before release sign-off"
          ]
        }
      ],
      education: [
        {
          degree: "B.Tech in Information Technology",
          institution: "AKTU Lucknow",
          duration: "2015 - 2019",
          details: "7.7 CGPA"
        }
      ],
      certifications: ["ISTQB Foundation Level", "Selenium Java Automation Framework Certificate"],
      coursework: [],
      achievements: ["Reduced production regression defects by 40% through automation coverage expansion", "Recognized for stabilizing flaky test suite from 78% to 96% pass rate"],
      languages: ["English", "Hindi"],
      keywords: ["test automation engineer", "Selenium", "Java", "TestNG", "RestAssured", "Jenkins", "Cucumber", "automation framework"],
      atsStrategy: { targetPhrases: [], insertedKeywords: [], rolePhrases: [] },
      verification: { status: "", checkedLines: 0, notes: [], lineChecks: [] }
    }
  }
];
