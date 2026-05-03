import { pool } from './config/db';

const allVideos = [
  // ── React.js Mastery ──
  { old: 'What is React?',        title: 'React JS Crash Course',                          youtube_id: 'w7ejDZ8SWv8', duration: 5640 },
  { old: 'JSX Syntax',            title: 'React JSX Tutorial',                             youtube_id: 'RVA0KlgXMDQ', duration: 780  },
  { old: 'Components',            title: 'React Components & Props',                       youtube_id: 'Y6aYx_KKM7A', duration: 1200 },
  { old: 'useState Hook',         title: 'React useState Hook Tutorial',                   youtube_id: 'O6P86uwfdR0', duration: 1560 },
  { old: 'useEffect Hook',        title: 'React useEffect Hook Tutorial',                  youtube_id: '0ZJgIjIuY7U', duration: 1800 },
  { old: 'Context API',           title: 'React Context API Tutorial',                     youtube_id: 'HYKDUF8X3qI', duration: 1920 },
  { old: 'Custom Hooks',          title: 'React Custom Hooks Tutorial',                    youtube_id: 'J-g9ZJha8FE', duration: 1680 },
  { old: 'Performance',           title: 'React Performance Optimization',                 youtube_id: 'uojLJFt9SzY', duration: 2100 },
  { old: 'React Router',          title: 'React Router v6 Tutorial',                       youtube_id: 'Ul3y1LXxzdU', duration: 1980 },

  // ── Node.js Backend ──
  { old: 'Node.js Intro',         title: 'Node.js Tutorial for Beginners',                 youtube_id: 'TlB_eWDSMt4', duration: 4680 },
  { old: 'Node Modules',          title: 'Node.js Module System Explained',                youtube_id: 'xHLd36QoS4k', duration: 1260 },
  { old: 'File System',           title: 'Node.js File System Module',                     youtube_id: 'U57kU311-nE', duration: 1680 },
  { old: 'Express Basics',        title: 'Express JS Crash Course',                        youtube_id: 'L72fhGm1tfE', duration: 3960 },
  { old: 'Routing',               title: 'Express JS Routing Tutorial',                    youtube_id: 'lY6icfhap2o', duration: 1800 },
  { old: 'REST API',              title: 'Build a REST API with Node & Express',            youtube_id: 'pKd0Rpw7O48', duration: 5400 },
  { old: 'MySQL Integration',     title: 'Node.js MySQL Tutorial',                         youtube_id: 'EN6Dx22cPRI', duration: 4920 },
  { old: 'MongoDB',               title: 'Node.js MongoDB Tutorial',                       youtube_id: 'fbYExfeFsI0', duration: 5400 },
  { old: 'Best Practices',        title: 'Node.js Best Practices',                         youtube_id: 'W2Z7fbCLSTw', duration: 1680 },

  // ── Python Programming ──
  { old: 'Python Introduction',   title: 'Python for Beginners Full Course',               youtube_id: 'kqtD5dpn9C8', duration: 21600 },
  { old: 'Python Variables',      title: 'Python Variables and Data Types',                youtube_id: 'cQT33yu9pY8', duration: 1560 },
  { old: 'Python Functions',      title: 'Python Functions Tutorial',                      youtube_id: 'NSbOtYzIQI0', duration: 2520 },
  { old: 'Classes and Objects',   title: 'Python OOP - Classes and Objects',               youtube_id: 'ZDa-Z5JzLYM', duration: 2340 },
  { old: 'Inheritance',           title: 'Python Inheritance Tutorial',                    youtube_id: 'RSl87lqOXDE', duration: 1800 },
  { old: 'Polymorphism',          title: 'Python Polymorphism Explained',                  youtube_id: 'wfcWRAxRVBA', duration: 1980 },
  { old: 'Web Scraper',           title: 'Python Web Scraping with BeautifulSoup',         youtube_id: 'XQgXKtPSzUI', duration: 4200 },
  { old: 'Data Analysis',         title: 'Python Data Analysis with Pandas',               youtube_id: 'vmEHCJofslg', duration: 5400 },
  { old: 'Automation',            title: 'Python Automation Tutorial',                     youtube_id: 'PXMJ6FS7llk', duration: 4920 },

  // ── Machine Learning Basics ──
  { old: 'ML Introduction',       title: 'Machine Learning for Beginners',                 youtube_id: 'ukzFI9rgwfU', duration: 3600 },
  { old: 'ML Algorithms',         title: 'Machine Learning Algorithms Explained',          youtube_id: 'E0W1ZZYIV8o', duration: 3240 },
  { old: 'Data Preprocessing',    title: 'Data Preprocessing for Machine Learning',        youtube_id: 'Gv9_4yMHFhI', duration: 4200 },
  { old: 'Linear Regression',     title: 'Linear Regression in Python',                   youtube_id: 'nk2CQITm_eo', duration: 3960 },
  { old: 'Classification',        title: 'Classification Algorithms in Python',            youtube_id: 'vsWrXfO3wWw', duration: 4680 },
  { old: 'Decision Trees',        title: 'Decision Trees and Random Forests',              youtube_id: 'RmajweUFKvM', duration: 5040 },
  { old: 'Neural Networks',       title: 'Neural Networks from Scratch',                   youtube_id: 'aircAruvnKk', duration: 4320 },
  { old: 'CNN',                   title: 'Convolutional Neural Networks Explained',        youtube_id: 'YRhxdVk_sIs', duration: 5400 },
  { old: 'RNN',                   title: 'Recurrent Neural Networks Tutorial',             youtube_id: 'LHXXI4-IEns', duration: 5040 },

  // ── Web Design Fundamentals ──
  { old: 'HTML Basics',           title: 'HTML Full Course for Beginners',                 youtube_id: 'qz0aGYrrlhU', duration: 7200 },
  { old: 'CSS Fundamentals',      title: 'CSS Tutorial Full Course',                       youtube_id: 'yfoY53QXEnI', duration: 6600 },
  { old: 'HTML Forms',            title: 'HTML Forms and Validation',                      youtube_id: 'fNcJuPIZ2WE', duration: 3240 },
  { old: 'Flexbox Layout',        title: 'CSS Flexbox Tutorial',                           youtube_id: 'JJSoEo8JSnc', duration: 3960 },
  { old: 'CSS Grid',              title: 'CSS Grid Layout Tutorial',                       youtube_id: 'jV8B24rSN5o', duration: 4680 },
  { old: 'Media Queries',         title: 'CSS Media Queries Tutorial',                     youtube_id: 'yU7jJ3NbPdA', duration: 5040 },
  { old: 'CSS Variables',         title: 'CSS Variables Tutorial',                         youtube_id: 'oZPR_78wCnY', duration: 4320 },
  { old: 'CSS Animations',        title: 'CSS Animations and Transitions',                 youtube_id: 'zHUpx90NerM', duration: 5400 },
  { old: 'Sass/SCSS',             title: 'Sass CSS Preprocessor Tutorial',                 youtube_id: '_a5j7KoflTs', duration: 5040 },

  // ── Database Management ──
  { old: 'SQL Introduction',      title: 'SQL Tutorial for Beginners',                     youtube_id: 'HXV3zeQKqGY', duration: 14400 },
  { old: 'SELECT Queries',        title: 'SQL SELECT Statement Tutorial',                  youtube_id: '9Pzj7Aj25lw', duration: 3240 },
  { old: 'WHERE Clause',          title: 'SQL WHERE Clause Tutorial',                      youtube_id: 'YufocuHbYZo', duration: 4320 },
  { old: 'Database Design',       title: 'Database Design Tutorial',                       youtube_id: 'ztHopE5Wnpc', duration: 3960 },
  { old: 'Normalization',         title: 'Database Normalization Explained',               youtube_id: 'GFQaEYEc8_8', duration: 4680 },
  { old: 'ER Diagrams',           title: 'Entity Relationship Diagram Tutorial',           youtube_id: 'QpdhBUYk7Kk', duration: 5040 },
  { old: 'JOINs',                 title: 'SQL Joins Tutorial',                             youtube_id: '9yeOJ0ZMUYw', duration: 4320 },
  { old: 'Subqueries',            title: 'SQL Subqueries Tutorial',                        youtube_id: 'nJIEIzF7tDw', duration: 5400 },
  { old: 'Indexes',               title: 'SQL Indexes Explained',                          youtube_id: 'fsG1XaZEa78', duration: 5040 },

  // ── Cloud Computing AWS ──
  { old: 'AWS Introduction',      title: 'AWS Cloud Practitioner Full Course',             youtube_id: 'JIbIYCM48to', duration: 14400 },
  { old: 'AWS Account Setup',     title: 'AWS Account Setup and IAM',                      youtube_id: 'XhW17g73fvY', duration: 3240 },
  { old: 'IAM Basics',            title: 'AWS IAM Tutorial for Beginners',                 youtube_id: 'iS9ZjJ2Bnlg', duration: 4320 },
  { old: 'EC2 Instances',         title: 'AWS EC2 Tutorial for Beginners',                 youtube_id: 'iHX-jtKIVNA', duration: 3960 },
  { old: 'S3 Storage',            title: 'AWS S3 Tutorial for Beginners',                  youtube_id: 'tfU0JEZjcsg', duration: 4680 },
  { old: 'EBS Volumes',           title: 'AWS EBS Volumes Tutorial',                       youtube_id: 'S0NB3RRgFSs', duration: 5040 },
  { old: 'VPC Networking',        title: 'AWS VPC Tutorial for Beginners',                 youtube_id: 'fpxDGU2KdkA', duration: 4320 },
  { old: 'Load Balancers',        title: 'AWS Load Balancer Tutorial',                     youtube_id: 'VIgAT7vjol8', duration: 5400 },
  { old: 'Auto Scaling',          title: 'AWS Auto Scaling Tutorial',                      youtube_id: 'SZyOlBmFMoE', duration: 5040 },

  // ── Mobile App Development ──
  { old: 'React Native Intro',    title: 'React Native Tutorial for Beginners',            youtube_id: 'ur6I5m2nTvk', duration: 7200 },
  { old: 'Setup Environment',     title: 'React Native Environment Setup',                 youtube_id: 'ANdSdIlgsEw', duration: 3240 },
  { old: 'First App',             title: 'Build Your First React Native App',              youtube_id: 'obH0Po_RdWk', duration: 4320 },
  { old: 'Mobile Components',     title: 'React Native Core Components',                   youtube_id: 'qSRrxpdMpVc', duration: 3960 },
  { old: 'Navigation',            title: 'React Native Navigation Tutorial',               youtube_id: 'nQVCkqvU1uE', duration: 4680 },
  { old: 'Styling',               title: 'React Native Styling Tutorial',                  youtube_id: 'GrfOsWUiwrw', duration: 5040 },
  { old: 'App Store Deploy',      title: 'Deploy React Native App to App Store',           youtube_id: 'LE4Mgkrf7Sk', duration: 4320 },
  { old: 'Play Store Deploy',     title: 'Deploy React Native App to Play Store',          youtube_id: 'oBWBDaqNuws', duration: 5400 },
  { old: 'App Testing',           title: 'React Native App Testing Tutorial',              youtube_id: 'CfdGIZkYwEU', duration: 5040 },

  // ── Cybersecurity Essentials ──
  { old: 'Security Basics',       title: 'Cybersecurity for Beginners Full Course',        youtube_id: 'inWWhr5tnEA', duration: 14400 },
  { old: 'Encryption',            title: 'Encryption and Cryptography Explained',          youtube_id: 'AQDCe585Lnc', duration: 3240 },
  { old: 'Authentication',        title: 'Authentication and Authorization Tutorial',      youtube_id: 'j8Tywg0H-xQ', duration: 4320 },
  { old: 'Ethical Hacking',       title: 'Ethical Hacking Full Course',                    youtube_id: 'dz7Ntp7KQGA', duration: 14400 },
  { old: 'Penetration Testing',   title: 'Penetration Testing Tutorial',                   youtube_id: '3Kq1MIfTWCE', duration: 4680 },
  { old: 'Vulnerability Scan',    title: 'Vulnerability Scanning Tutorial',                youtube_id: 'lc7scxvKQOo', duration: 5040 },
  { old: 'Network Security',      title: 'Network Security Full Course',                   youtube_id: 'kBzbKUirOFk', duration: 4320 },
  { old: 'Firewall Config',       title: 'Firewall Configuration Tutorial',                youtube_id: 'kDEX1HXybrU', duration: 5400 },
  { old: 'Security Tools',        title: 'Cybersecurity Tools Tutorial',                   youtube_id: 'qPEA6J9pjG8', duration: 5040 },

  // ── Data Science with Python ──
  { old: 'Data Science Intro',    title: 'Data Science Full Course for Beginners',         youtube_id: 'ua-CiDNNj30', duration: 14400 },
  { old: 'Pandas Basics',         title: 'Pandas Tutorial for Beginners',                  youtube_id: 'vmEHCJofslg', duration: 5400 },
  { old: 'NumPy Arrays',          title: 'NumPy Tutorial for Beginners',                   youtube_id: 'QUT1VHiLmmI', duration: 4320 },
  { old: 'Matplotlib',            title: 'Matplotlib Tutorial for Beginners',              youtube_id: '3Xc3CA655Y4', duration: 3960 },
  { old: 'Seaborn',               title: 'Seaborn Tutorial for Beginners',                 youtube_id: '6GUZXDef2U0', duration: 4680 },
  { old: 'Plotly',                title: 'Plotly Tutorial for Beginners',                  youtube_id: 'GGL6U0k8WYA', duration: 5040 },
  { old: 'Scikit-learn',          title: 'Scikit-learn Tutorial for Beginners',            youtube_id: '0Lt9w-BxKFQ', duration: 4320 },
  { old: 'Model Training',        title: 'Machine Learning Model Training Tutorial',       youtube_id: 'i_LwzRVP7bg', duration: 5400 },
  { old: 'Model Evaluation',      title: 'Machine Learning Model Evaluation Tutorial',     youtube_id: 'Kdsp6soqA7o', duration: 5040 },

  // ── DevOps Engineering ──
  { old: 'DevOps Introduction',   title: 'DevOps Tutorial for Beginners',                  youtube_id: 'Xrgk023l4lI', duration: 14400 },
  { old: 'CI/CD Basics',          title: 'CI/CD Pipeline Tutorial',                        youtube_id: 'scEDHsr3APg', duration: 3240 },
  { old: 'Git Workflow',          title: 'Git and GitHub Full Course',                     youtube_id: 'HVsySz-h9r4', duration: 4320 },
  { old: 'Docker Basics',         title: 'Docker Tutorial for Beginners',                  youtube_id: 'fqMOX6JJhGo', duration: 3960 },
  { old: 'Docker Compose',        title: 'Docker Compose Tutorial',                        youtube_id: 'Qw9zlE3t8Ko', duration: 4680 },
  { old: 'Kubernetes Intro',      title: 'Kubernetes Tutorial for Beginners',              youtube_id: 'X48VuDVv0do', duration: 5040 },
  { old: 'Jenkins Pipeline',      title: 'Jenkins Tutorial for Beginners',                 youtube_id: 'pMO26j2OUME', duration: 4320 },
  { old: 'GitHub Actions',        title: 'GitHub Actions Tutorial',                        youtube_id: 'R8_veQiYBjI', duration: 5400 },
  { old: 'Terraform',             title: 'Terraform Tutorial for Beginners',               youtube_id: 'l5k1ai_GBDE', duration: 5040 },

  // ── UI/UX Design ──
  { old: 'Design Principles',     title: 'UI UX Design Principles Full Course',            youtube_id: 'a5KYlHNKQB8', duration: 3600 },
  { old: 'Color Theory',          title: 'Color Theory for Designers',                     youtube_id: '_2LLXnUdUIc', duration: 3240 },
  { old: 'Typography',            title: 'Typography Tutorial for Beginners',              youtube_id: 'sByzHoiYFX0', duration: 4320 },
  { old: 'Figma Basics',          title: 'Figma Tutorial for Beginners',                   youtube_id: 'FTFaQWZBqQ8', duration: 3960 },
  { old: 'Prototyping',           title: 'Figma Prototyping Tutorial',                     youtube_id: 'lTIeZ2ahEkQ', duration: 4680 },
  { old: 'Design Systems',        title: 'Design Systems in Figma',                        youtube_id: 'Dtd40cHQQlk', duration: 5040 },
  { old: 'User Research',         title: 'UX Research Methods Tutorial',                   youtube_id: 'Ovj4hFxko7c', duration: 4320 },
  { old: 'Usability Testing',     title: 'Usability Testing Tutorial',                     youtube_id: 'Z5gqrow7wNs', duration: 5400 },
  { old: 'UX Strategy',           title: 'UX Strategy and Design Thinking',                youtube_id: 'gUja_9QLKR4', duration: 5040 },

  // ── Blockchain Development ──
  { old: 'Blockchain Basics',     title: 'Blockchain Technology Explained',                youtube_id: 'SSo_EIwHSd4', duration: 3600 },
  { old: 'Cryptocurrency',        title: 'Cryptocurrency Explained for Beginners',         youtube_id: '1YyAzVmP9xQ', duration: 3240 },
  { old: 'Bitcoin Explained',     title: 'How Bitcoin Works Explained',                    youtube_id: 'bBC-nXj3Ng4', duration: 4320 },
  { old: 'Solidity Basics',       title: 'Solidity Tutorial for Beginners',                youtube_id: 'ipwxYa-F1uY', duration: 3960 },
  { old: 'Smart Contracts',       title: 'Smart Contracts Tutorial',                       youtube_id: 'M576WGiDBdQ', duration: 4680 },
  { old: 'Ethereum',              title: 'Ethereum Blockchain Tutorial',                   youtube_id: 'jxLkbJozKbY', duration: 5040 },
  { old: 'Web3.js',               title: 'Web3.js Tutorial for Beginners',                 youtube_id: 'u3PtGMRmGA0', duration: 4320 },
  { old: 'DApp Development',      title: 'Build a DApp Tutorial',                          youtube_id: 'coQ5dg8wM2o', duration: 5400 },
  { old: 'NFT Creation',          title: 'How to Create and Deploy NFTs',                  youtube_id: 'meTpMP0J5E8', duration: 5040 },

  // ── Game Development Unity ──
  { old: 'Unity Introduction',    title: 'Unity Tutorial for Beginners',                   youtube_id: 'pwZpJzpE2lQ', duration: 3600 },
  { old: 'Unity Interface',       title: 'Unity Editor Interface Tutorial',                youtube_id: 'IlKaB1etrik', duration: 3240 },
  { old: 'First Game',            title: 'Build Your First Game in Unity',                 youtube_id: 'j48LtUkZRjU', duration: 4320 },
  { old: 'Game Physics',          title: 'Unity Physics Tutorial',                         youtube_id: 'wB1pcXtEwIs', duration: 3960 },
  { old: 'Collision Detection',   title: 'Unity Collision Detection Tutorial',             youtube_id: 'vFjXKOXdgGo', duration: 4680 },
  { old: 'Player Movement',       title: 'Unity Player Movement Tutorial',                 youtube_id: 'f473C43s8nE', duration: 5040 },
  { old: '3D Modeling',           title: '3D Modeling for Unity Games',                    youtube_id: 'f3Cn0CGytSQ', duration: 4320 },
  { old: 'Game AI',               title: 'Unity Game AI Tutorial',                         youtube_id: 'aR6wt5BlE-', duration: 5400 },
  { old: 'Game Publishing',       title: 'How to Publish Your Unity Game',                 youtube_id: 'HlDGSStxuHI', duration: 5040 },
];

const updateAllVideos = async () => {
  try {
    console.log(`🔄 Updating ${allVideos.length} videos across all courses...\n`);

    let success = 0, failed = 0;

    for (const v of allVideos) {
      const [r1]: any = await pool.query(
        `UPDATE videos SET title=?, youtube_id=?, duration=? WHERE title=?`,
        [v.title, v.youtube_id, v.duration, v.old]
      );
      if (r1.affectedRows > 0) {
        const m = Math.floor(v.duration / 3600);
        const rem = v.duration % 3600;
        const min = Math.floor(rem / 60);
        const sec = rem % 60;
        const dur = m > 0 ? `${m}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${min}:${String(sec).padStart(2,'0')}`;
        console.log(`✅ "${v.old}" → "${v.title}" | ${dur}`);
        success++;
      } else {
        // try partial match
        const [r2]: any = await pool.query(
          `UPDATE videos SET title=?, youtube_id=?, duration=? WHERE title LIKE ?`,
          [v.title, v.youtube_id, v.duration, `%${v.old}%`]
        );
        if (r2.affectedRows > 0) {
          console.log(`✅ (partial) "${v.old}" → "${v.title}"`);
          success++;
        } else {
          console.log(`❌ NOT FOUND: "${v.old}"`);
          failed++;
        }
      }
    }

    console.log(`\n✅ Updated: ${success} | ❌ Failed: ${failed}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateAllVideos();
