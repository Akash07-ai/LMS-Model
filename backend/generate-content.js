const fs = require('fs');

const domains = [
  'Programming',
  'Web Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'Mobile Development',
  'Blockchain',
  'UI/UX Design',
  'Computer Science',
  'Game Development',
  'Software Engineering',
  'Database Systems'
];

const courseTemplates = {
  'Programming': [
    { title: 'Python Programming Masterclass', desc: 'Complete Python course from basics to advanced' },
    { title: 'Java Programming Complete Course', desc: 'Master Java programming with hands-on projects' },
    { title: 'C++ Programming Fundamentals', desc: 'Learn C++ from scratch to professional level' },
    { title: 'JavaScript ES6+ Modern Development', desc: 'Modern JavaScript for web development' },
    { title: 'Go Programming Language Bootcamp', desc: 'Master Go for backend development' }
  ],
  'Web Development': [
    { title: 'Full Stack Web Development Bootcamp', desc: 'Complete web development from frontend to backend' },
    { title: 'React.js Complete Guide', desc: 'Master React.js for modern web apps' },
    { title: 'Node.js Backend Development', desc: 'Build scalable backend with Node.js' },
    { title: 'Vue.js Framework Mastery', desc: 'Complete Vue.js course with real projects' },
    { title: 'Angular Complete Course', desc: 'Enterprise web apps with Angular' }
  ],
  'Artificial Intelligence': [
    { title: 'AI Fundamentals and Applications', desc: 'Introduction to artificial intelligence' },
    { title: 'Deep Learning Specialization', desc: 'Master deep learning with neural networks' },
    { title: 'Natural Language Processing', desc: 'NLP from basics to advanced applications' },
    { title: 'Computer Vision Masterclass', desc: 'Image processing and computer vision' },
    { title: 'AI Ethics and Responsible AI', desc: 'Ethical considerations in AI development' }
  ],
  'Machine Learning': [
    { title: 'Machine Learning A-Z', desc: 'Complete machine learning bootcamp' },
    { title: 'Advanced Machine Learning Algorithms', desc: 'Deep dive into ML algorithms' },
    { title: 'ML with Python and Scikit-Learn', desc: 'Practical machine learning with Python' },
    { title: 'TensorFlow for Machine Learning', desc: 'Build ML models with TensorFlow' },
    { title: 'MLOps and Model Deployment', desc: 'Deploy and maintain ML models in production' }
  ],
  'Data Science': [
    { title: 'Data Science Complete Bootcamp', desc: 'From data analysis to visualization' },
    { title: 'Python for Data Analysis', desc: 'Master pandas, numpy, and matplotlib' },
    { title: 'Statistical Analysis with R', desc: 'Statistical methods for data science' },
    { title: 'Big Data Analytics', desc: 'Process and analyze large datasets' },
    { title: 'Data Visualization Masterclass', desc: 'Create stunning data visualizations' }
  ],
  'Cybersecurity': [
    { title: 'Ethical Hacking Complete Course', desc: 'Learn penetration testing and security' },
    { title: 'Network Security Fundamentals', desc: 'Secure networks and infrastructure' },
    { title: 'Web Application Security', desc: 'Protect web apps from vulnerabilities' },
    { title: 'Cloud Security Best Practices', desc: 'Secure cloud infrastructure' },
    { title: 'Cryptography and Encryption', desc: 'Master encryption and cryptographic systems' }
  ],
  'Cloud Computing': [
    { title: 'AWS Solutions Architect', desc: 'Master Amazon Web Services' },
    { title: 'Microsoft Azure Fundamentals', desc: 'Complete Azure cloud platform' },
    { title: 'Google Cloud Platform Mastery', desc: 'Build on Google Cloud' },
    { title: 'Multi-Cloud Architecture', desc: 'Design multi-cloud solutions' },
    { title: 'Serverless Computing', desc: 'Build serverless applications' }
  ],
  'DevOps': [
    { title: 'DevOps Complete Bootcamp', desc: 'Master DevOps practices and tools' },
    { title: 'Docker and Kubernetes', desc: 'Container orchestration mastery' },
    { title: 'CI/CD Pipeline Automation', desc: 'Automate deployment pipelines' },
    { title: 'Infrastructure as Code', desc: 'Terraform and CloudFormation' },
    { title: 'Monitoring and Observability', desc: 'Monitor production systems' }
  ],
  'Mobile Development': [
    { title: 'iOS Development with Swift', desc: 'Build iOS apps from scratch' },
    { title: 'Android Development Masterclass', desc: 'Complete Android app development' },
    { title: 'React Native Cross-Platform', desc: 'Build apps for iOS and Android' },
    { title: 'Flutter App Development', desc: 'Create beautiful mobile apps with Flutter' },
    { title: 'Mobile UI/UX Design', desc: 'Design principles for mobile apps' }
  ],
  'Blockchain': [
    { title: 'Blockchain Fundamentals', desc: 'Understanding blockchain technology' },
    { title: 'Ethereum Smart Contracts', desc: 'Build smart contracts with Solidity' },
    { title: 'DApp Development', desc: 'Create decentralized applications' },
    { title: 'Cryptocurrency Trading', desc: 'Trade and invest in cryptocurrencies' },
    { title: 'NFT Development', desc: 'Create and deploy NFT projects' }
  ],
  'UI/UX Design': [
    { title: 'UI/UX Design Fundamentals', desc: 'Design principles and best practices' },
    { title: 'Figma Complete Course', desc: 'Master Figma for UI design' },
    { title: 'User Research and Testing', desc: 'Conduct effective user research' },
    { title: 'Design Systems', desc: 'Build scalable design systems' },
    { title: 'Mobile App Design', desc: 'Design beautiful mobile interfaces' }
  ],
  'Computer Science': [
    { title: 'Data Structures and Algorithms', desc: 'Master DSA for interviews' },
    { title: 'Operating Systems Concepts', desc: 'Understanding OS fundamentals' },
    { title: 'Computer Networks', desc: 'Network protocols and architecture' },
    { title: 'Compiler Design', desc: 'Build compilers and interpreters' },
    { title: 'Theory of Computation', desc: 'Automata and formal languages' }
  ],
  'Game Development': [
    { title: 'Unity Game Development', desc: 'Create games with Unity engine' },
    { title: 'Unreal Engine Masterclass', desc: 'Build AAA games with Unreal' },
    { title: 'Game Design Principles', desc: 'Design engaging game mechanics' },
    { title: '2D Game Development', desc: 'Create 2D games from scratch' },
    { title: '3D Modeling for Games', desc: 'Create 3D assets for games' }
  ],
  'Software Engineering': [
    { title: 'Software Architecture Patterns', desc: 'Design scalable software systems' },
    { title: 'Microservices Architecture', desc: 'Build microservices applications' },
    { title: 'Clean Code Principles', desc: 'Write maintainable code' },
    { title: 'Test-Driven Development', desc: 'Master TDD practices' },
    { title: 'Agile and Scrum', desc: 'Agile project management' }
  ],
  'Database Systems': [
    { title: 'SQL Database Mastery', desc: 'Master SQL and relational databases' },
    { title: 'MongoDB Complete Guide', desc: 'NoSQL database development' },
    { title: 'PostgreSQL Advanced', desc: 'Advanced PostgreSQL features' },
    { title: 'Database Design and Modeling', desc: 'Design efficient databases' },
    { title: 'Redis and Caching', desc: 'High-performance caching strategies' }
  ]
};

const sectionTemplates = [
  'Introduction and Fundamentals',
  'Core Concepts and Theory',
  'Practical Implementation',
  'Advanced Topics and Best Practices'
];

const videoTitles = [
  'Introduction to',
  'Getting Started with',
  'Understanding',
  'Deep Dive into',
  'Mastering'
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateVideos(sectionTitle, sectionIndex) {
  const videos = [];
  for (let i = 1; i <= 5; i++) {
    videos.push({
      video_title: `${videoTitles[i - 1]} ${sectionTitle} - Part ${i}`,
      youtube_url: `https://youtube.com/watch?v=VIDEO_${Math.random().toString(36).substr(2, 9)}`,
      order_index: i,
      duration_seconds: Math.floor(Math.random() * (1200 - 300 + 1)) + 300
    });
  }
  return videos;
}

function generateSections(courseTitle) {
  return sectionTemplates.map((template, index) => ({
    section_title: `${template}`,
    order_index: index + 1,
    videos: generateVideos(template, index + 1)
  }));
}

function generateContent() {
  const content = {
    domains: domains.map(domain => ({
      domain_name: domain,
      courses: courseTemplates[domain].map(course => ({
        title: course.title,
        slug: generateSlug(course.title),
        description: course.desc,
        is_published: true,
        sections: generateSections(course.title)
      }))
    }))
  };

  // Generate featured courses
  const allCourses = [];
  content.domains.forEach(domain => {
    domain.courses.forEach(course => {
      allCourses.push({
        title: course.title,
        slug: course.slug,
        description: course.description,
        domain: domain.domain_name
      });
    });
  });

  // Pick 10 random featured courses
  const featured = [];
  const usedIndexes = new Set();
  while (featured.length < 10) {
    const index = Math.floor(Math.random() * allCourses.length);
    if (!usedIndexes.has(index)) {
      featured.push(allCourses[index]);
      usedIndexes.add(index);
    }
  }

  content.featured_courses = featured;

  return content;
}

// Generate and save
const content = generateContent();
fs.writeFileSync('lms-content.json', JSON.stringify(content, null, 2));

// Statistics
let totalCourses = 0;
let totalSections = 0;
let totalVideos = 0;

content.domains.forEach(domain => {
  totalCourses += domain.courses.length;
  domain.courses.forEach(course => {
    totalSections += course.sections.length;
    course.sections.forEach(section => {
      totalVideos += section.videos.length;
    });
  });
});

console.log('✅ Content generated successfully!');
console.log('📊 Statistics:');
console.log(`   Domains: ${content.domains.length}`);
console.log(`   Courses: ${totalCourses}`);
console.log(`   Sections: ${totalSections}`);
console.log(`   Videos: ${totalVideos}`);
console.log(`   Featured: ${content.featured_courses.length}`);
console.log('\n📁 Saved to: lms-content.json');
