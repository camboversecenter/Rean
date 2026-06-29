
import { Mission, MissionCategory, School, StudentPost, TutorRequest } from './types';

export const HERO_TITLE = "ស្វែងរកអនាគតរបស់អ្នក";
export const HERO_SUBTITLE = "វេទិកាអប់រំធំបំផុតនៅកម្ពុជា - សាលារៀន វគ្គសិក្សា និងគ្រូបង្រៀន";
export const SEARCH_PLACEHOLDER = "ស្វែងរកសាលា ឬជំនាញ...";

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Digital Marketing Strategy: Cafe Launch',
    mentor: 'Sok Vibal',
    price: 100000,
    level: 'Beginner',
    squadSize: 3,
    squadCreation: 'auto',
    enrollmentType: 'open',
    category: MissionCategory.BUSINESS,
    thumbnail: 'https://picsum.photos/400/225?random=1',
    description: 'You and your squad will act as a marketing agency launching a new coffee brand in Phnom Penh. Analyze competitors and create a social media plan.',
    modules: [
      {
        id: 'mod1',
        title: 'Competitor Analysis',
        task: 'Research 3 local coffee shops (e.g., Brown, Amazon, Tube). Create a SWOT analysis for each.',
        aiPersona: 'You are a Senior Marketing Director at a top agency in Phnom Penh. The user is a Junior Marketer. Critique their SWOT analysis. Ask them specifically about their "Weakness" section. Do not give them the answers, guide them to find it.',
        initialPrompt: 'Welcome to the agency. Your first task is to understand the battlefield. Tell me which 3 coffee shops you are analyzing?'
      },
      {
        id: 'mod2',
        title: 'Customer Persona',
        task: 'Define the target audience. Who drinks coffee at 2 PM vs 7 AM?',
        aiPersona: 'You are a Consumer Psychology Expert. Help the student dig deep into "Why" people buy. Challenge their assumptions.',
        initialPrompt: 'Good work on the SWOT. Now, who are we selling to? Describe your ideal customer.'
      },
      {
        id: 'mod3',
        title: 'Social Media Content Plan',
        task: 'Draft 3 Facebook posts for the launch week. One teaser, one launch announcement, and one promotion.',
        aiPersona: 'You are a Social Media Manager. Critique the tone, emoji usage, and call-to-action (CTA).',
        initialPrompt: 'Time to go live. Show me your 3 draft posts for the launch.'
      },
      {
        id: 'mod4',
        title: 'Budgeting & Ads',
        task: 'Create a budget plan for a $500 monthly ad spend. How much for Facebook vs Instagram vs TikTok?',
        aiPersona: 'You are a Media Buyer. Ask about ROI and why they chose that split.',
        initialPrompt: 'We have $500. How are you spending it? Justify your split.'
      }
    ]
  },
  {
    id: 'm4',
    title: 'Physics Lab: Projectile Motion',
    mentor: 'Dr. S. Einstein',
    price: 0,
    level: 'Beginner',
    squadSize: 1,
    squadCreation: 'auto',
    enrollmentType: 'open',
    category: MissionCategory.STEM,
    thumbnail: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion-600.png',
    description: 'Master the physics of projectile motion using the PhET Interactive Simulation. You will conduct experiments to understand how angle and initial speed affect distance.',
    modules: [
        {
            id: 'sim1',
            title: 'Lab 1: Hitting the Target',
            task: 'Set the target to distance 20m. Find the correct Angle and Initial Speed to hit the bullseye. Upload a screenshot of your successful hit.',
            aiPersona: 'You are a Physics Lab Instructor. Verify the student has hit the target based on their screenshot. Ask them what happens to the range if they increase the angle above 45 degrees.',
            initialPrompt: 'Welcome to the lab! Open the simulation tab. Try to hit the target at 20m. What settings worked for you?',
            simulationConfig: {
                type: 'phet',
                url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
                instructions: 'Use the "Intro" mode. Drag the target to 20m.'
            }
        },
        {
            id: 'sim2',
            title: 'Lab 2: Maximum Range',
            task: 'Keep the speed constant at 15 m/s. Find the angle that gives the maximum distance.',
            aiPersona: 'You are a Physics Professor. Explain why 45 degrees usually gives max range (ignoring air resistance).',
            initialPrompt: 'Now, lets optimize. Set speed to 15 m/s. Which angle makes the cannonball go furthest?',
            simulationConfig: {
                type: 'phet',
                url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html'
            }
        }
    ]
  },
  {
    id: 'm2',
    title: 'Frontend Mastery: Personal Portfolio',
    mentor: 'Dev Cambodia',
    price: 160000,
    level: 'Intermediate',
    squadSize: 2,
    squadCreation: 'auto',
    enrollmentType: 'open',
    category: MissionCategory.TECH,
    thumbnail: 'https://picsum.photos/400/225?random=5',
    description: 'Stop watching videos. Build your own portfolio website using React. Your squad will code review each other.',
    modules: [
      {
        id: 'mod1',
        title: 'Structure & Component Design',
        task: 'Draw the wireframe and list the React Components you need.',
        aiPersona: 'You are a Senior React Developer. Focus on "Component Reusability". If the student suggests making one giant component, correct them gently.',
        initialPrompt: 'Alright dev, before we write code, we plan. What sections will your portfolio have?'
      },
      {
        id: 'mod2',
        title: 'Responsive Layout with Tailwind',
        task: 'Implement the Hero section. Ensure it looks good on Mobile (iPhone SE) and Desktop.',
        aiPersona: 'You are a CSS Expert. Check for mobile-first approach.',
        initialPrompt: 'Show me your HTML/CSS structure for the Hero section. Is it responsive?'
      },
      {
        id: 'mod3',
        title: 'State Management',
        task: 'Add a contact form that captures user input and validates it before "sending" (console log).',
        aiPersona: 'You are a QA Engineer. I will try to break your form. Did you handle empty fields?',
        initialPrompt: 'Let\'s build the contact form. How are you handling the state?'
      },
      {
        id: 'mod4',
        title: 'Deployment',
        task: 'Deploy your site to Vercel or Netlify and submit the live URL.',
        aiPersona: 'You are a DevOps Engineer. Check if the build command works.',
        initialPrompt: 'It\'s time to ship. Where are you deploying?'
      }
    ]
  },
  {
    id: 'm3',
    title: 'Startup Pitch: Eco-Tourism',
    mentor: 'Impact Hub Mentor',
    price: 120000,
    level: 'Advanced',
    squadSize: 4,
    squadCreation: 'manual',
    enrollmentType: 'invite_only',
    category: MissionCategory.SOCIAL,
    thumbnail: 'https://picsum.photos/400/225?random=6',
    description: 'Research a province in Cambodia and propose a sustainable eco-tourism business plan.',
    modules: [
        {
            id: 'mod1',
            title: 'Problem Identification',
            task: 'Find a specific environmental or economic problem in a province.',
            aiPersona: 'You are a Venture Capitalist. You only care about "Scalability" and "Impact". Be skeptical about their problem statement.',
            initialPrompt: 'Pitch me the problem. Why should I care about this province?'
        },
        {
            id: 'mod2',
            title: 'Solution Prototype',
            task: 'Describe your eco-tourism service. How does it solve the problem?',
            aiPersona: 'You are a Product Manager. Focus on feasibility.',
            initialPrompt: 'Okay, I see the problem. What is your solution?'
        },
        {
            id: 'mod3',
            title: 'Financial Model',
            task: 'Estimate costs and revenue for the first year.',
            aiPersona: 'You are a CFO. Check their math. Is it sustainable?',
            initialPrompt: 'Show me the numbers. How do we make money?'
        }
    ]
  }
];

export const MOCK_SCHOOLS: School[] = [
  {
    id: 's1',
    name: 'Cambodia Tech University (CTU)',
    logo: 'https://ui-avatars.com/api/?name=CTU&background=0F766E&color=fff&size=128',
    coverImage: 'https://picsum.photos/800/400?random=10',
    location: 'Toul Kork, Phnom Penh',
    type: 'University',
    tuitionRange: '2,400,000 ៛ - 4,800,000 ៛ / ឆ្នាំ',
    description: 'សាកលវិទ្យាល័យឈានមុខគេផ្នែកបច្ចេកវិទ្យា និងវិស្វកម្មនៅកម្ពុជា។ យើងផ្តោតលើការអនុវត្តជាក់ស្តែង និងការបង្កើតថ្មី។',
    majors: ['Computer Science', 'Data Science', 'Civil Engineering', 'Architecture', 'Cyber Security'],
    verified: true,
    gallery: ['https://picsum.photos/400/300?random=11', 'https://picsum.photos/400/300?random=12'],
    admissions: [
      {
        id: 'adm1',
        title: 'ជំនាន់ទី ១៥ (Semester 1)',
        description: 'កំពុងទទួលពាក្យចូលរៀនថ្នាក់បរិញ្ញាបត្រឆ្នាំសិក្សាថ្មី។ មានអាហារូបករណ៍រហូតដល់ ១០០%។',
        majors: ['Computer Science', 'Data Science', 'Civil Engineering', 'Architecture', 'Cyber Security'],
        startDate: '01 Jan 2025',
        endDate: '15 Feb 2025',
        status: 'Open',
        scholarships: [
          { id: 'sch1', title: 'អាហារូបករណ៍សិស្សពូកែ', discount: '100%', deadline: '30 ធ្នូ 2024' },
          { id: 'sch2', title: 'ស្ត្រីក្នុងវិស័យ Tech', discount: '50%', deadline: '15 មករា 2025' }
        ]
      }
    ],
    shortCourses: []
  },
  {
    id: 's2',
    name: 'Phnom Penh Business School',
    logo: 'https://ui-avatars.com/api/?name=PPBS&background=F59E0B&color=fff&size=128',
    coverImage: 'https://picsum.photos/800/400?random=20',
    location: 'BKK1, Phnom Penh',
    type: 'Vocational',
    tuitionRange: '3,200,000 ៛ - 10,000,000 ៛ / វគ្គ',
    description: 'វិទ្យាស្ថានបណ្តុះបណ្តាលជំនាញធុរកិច្ច និងការគ្រប់គ្រងសម្រាប់អ្នកដឹកនាំជំនាន់ថ្មី។',
    majors: ['MBA', 'Digital Marketing', 'Entrepreneurship', 'Accounting'],
    verified: true,
    gallery: ['https://picsum.photos/400/300?random=21', 'https://picsum.photos/400/300?random=22'],
    admissions: [
      {
        id: 'adm2',
        title: 'Professional MBA',
        description: 'កម្មវិធីសិក្សា MBA សម្រាប់អ្នកធ្វើការ។ បិទទទួលពាក្យឆាប់ៗនេះ!',
        majors: ['MBA', 'Digital Marketing', 'Entrepreneurship', 'Accounting'],
        startDate: '10 Jan 2025',
        endDate: '20 Jan 2025',
        status: 'Closing Soon',
        scholarships: []
      }
    ],
    shortCourses: []
  },
  {
    id: 's3',
    name: 'International School of Arts',
    logo: 'https://ui-avatars.com/api/?name=ISA&background=6366f1&color=fff&size=128',
    coverImage: 'https://picsum.photos/800/400?random=30',
    location: 'Sen Sok, Phnom Penh',
    type: 'University',
    tuitionRange: '6,000,000 ៛ - 12,000,000 ៛ / ឆ្នាំ',
    description: 'សាលាសិល្បៈនិងការរចនាលំដាប់អន្តរជាតិ។ បង្រៀនដោយសាស្ត្រាចារ្យបរទេស។',
    majors: ['Graphic Design', 'Fashion Design', 'Interior Design', 'Animation'],
    verified: false,
    gallery: ['https://picsum.photos/400/300?random=31'],
    admissions: [
      {
        id: 'adm3',
        title: 'Spring 2025 Intake',
        description: 'កំពុងស្វែងរកអ្នកដែលមានទេពកោសល្យសិល្បៈ។',
        majors: ['Graphic Design', 'Fashion Design', 'Interior Design', 'Animation'],
        startDate: '01 Feb 2025',
        endDate: '01 Mar 2025',
        status: 'Open',
        scholarships: [
           { id: 'sch3', title: 'Talent Scholarship', discount: '30%', deadline: '01 Feb 2025' }
        ]
      }
    ],
    shortCourses: []
  },
  {
    id: 's4',
    name: 'ACE (Australian Centre for Education)',
    logo: 'https://ui-avatars.com/api/?name=ACE&background=002060&color=fff&size=128',
    coverImage: 'https://picsum.photos/800/400?random=40',
    location: 'Multiple Locations',
    type: 'Vocational',
    tuitionRange: '1,120,000 ៛ - 1,400,000 ៛ / Term',
    description: 'Leading provider of English language teaching services in Cambodia.',
    majors: ['General English', 'IELTS Prep', 'Business English'],
    verified: true,
    gallery: [],
    admissions: [
      {
        id: 'adm4',
        title: 'Term 1, 2025',
        description: 'Term 1 starts soon. Placement test available daily.',
        majors: ['General English', 'IELTS Prep', 'Business English'],
        startDate: '01 Jan 2025',
        endDate: '05 Jan 2025',
        status: 'Open',
        scholarships: []
      }
    ],
    shortCourses: []
  },
  {
    id: 's5',
    name: 'Sisowath High School',
    logo: 'https://ui-avatars.com/api/?name=SHS&background=b91c1c&color=fff&size=128',
    coverImage: 'https://picsum.photos/800/400?random=50',
    location: 'Daun Penh, Phnom Penh',
    type: 'High School',
    tuitionRange: 'State Funded / NGS Program',
    description: 'One of the oldest and most prestigious high schools in Cambodia.',
    majors: ['General Education', 'Science', 'Social Science'],
    verified: true,
    gallery: [],
    admissions: [
      {
        id: 'adm5',
        title: 'Grade 7 & 10 Entrance Exam',
        description: 'ការប្រឡងចូលរៀនបានបញ្ចប់ហើយសម្រាប់ឆ្នាំនេះ។',
        majors: ['General Education', 'Science', 'Social Science'],
        startDate: '01 Oct 2024',
        endDate: '01 Nov 2024',
        status: 'Closed',
        scholarships: []
      }
    ],
    shortCourses: []
  }
];

export const MOCK_TUTOR_REQUESTS: TutorRequest[] = [
    {
        id: 'req1',
        name: 'Parent: Mrs. Mom',
        subject: 'ភាសាខ្មែរ (Khmer)',
        grade: 'Grade 6',
        location: 'Borey Peng Huoth Boeung Snor',
        budget: '32,000 - 40,000 ៛ / ម៉ោង',
        description: 'Need a female tutor for my daughter. Focus on reading and writing. Weekend mornings preferred.',
        timestamp: '2 hours ago'
    },
    {
        id: 'req2',
        name: 'Student: Pich',
        subject: 'Math & Physics',
        grade: 'Grade 12 (BacII Prep)',
        location: 'Near Bak Touk High School',
        budget: '48,000 ៛ / ម៉ោង',
        description: 'Looking for a strict tutor to help me prepare for the upcoming national exam.',
        timestamp: '1 day ago'
    },
    {
        id: 'req3',
        name: 'Student: David',
        subject: 'English Conversation',
        grade: 'Adult',
        location: 'Online (Zoom)',
        budget: '32,000 ៛ / ម៉ោង',
        description: 'I need to practice speaking for my job interview next month.',
        timestamp: '3 days ago'
    }
];

export const MOCK_POSTS: StudentPost[] = [
  {
    id: 'p1',
    authorName: 'Sokheng Chen',
    authorAvatar: 'https://ui-avatars.com/api/?name=Sokheng&background=random',
    content: 'Explain "Quantum Computing" like I am 5 years old.',
    timestamp: '2 mins ago',
    likes: 3,
    reactions: { heart: 3, bulb: 0, thumb: 0 },
    attachmentType: 'text',
    tags: ['#Science', '#LazyLearning'],
    replies: [
      {
        id: 'r1',
        authorName: 'សុភាទន្សាយ',
        authorAvatar: '',
        isAI: true,
        content: 'Imagine a coin spinning on a table. It is neither Heads nor Tails until it stops. Normal computers are Heads OR Tails (0 or 1). Quantum computers are the spinning coin—they can be both at once, letting them solve mazes instantly.',
        timestamp: 'Just now',
        reactions: { heart: 0, bulb: 0, thumb: 0 },
        recommendedLinks: []
      }
    ]
  },
  {
    id: 'p2',
    authorName: 'Lisa Mom',
    authorAvatar: 'https://ui-avatars.com/api/?name=Lisa&background=random',
    content: 'Translate this to Khmer: "Consistency is key to mastery."',
    timestamp: '5 hours ago',
    likes: 5,
    reactions: { heart: 5, bulb: 0, thumb: 0 },
    attachmentType: 'voice',
    tags: ['#Translation'],
    replies: [
        {
            id: 'r2',
            authorName: 'សុភាទន្សាយ',
            authorAvatar: '',
            isAI: true,
            content: 'ភាពមិនប្រែប្រួល គឺជាគន្លឹះនៃភាពស្ទាត់ជំនាញ (Pheap min prae proul keu jea kunleuh nei pheap sdat jumnanh).',
            timestamp: '5 hours ago',
            reactions: { heart: 0, bulb: 0, thumb: 0 },
            recommendedLinks: []
        }
    ]
  }
];

export const CATEGORIES_LIST = Object.values(MissionCategory);
