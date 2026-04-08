import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

// ─── NMIET Faculty Data ───────────────────────────────────────────────────────

const FACULTY_DATA = [
  { name: 'Prof. Varsha Salve',      email: 'varsha.salve@nmiet.edu',      title: 'Prof.', phone: '+91-9820000001', maxGroups: 6 },
  { name: 'Dr. Supriya Vaidya',      email: 'supriya.vaidya@nmiet.edu',    title: 'Dr.',   phone: '+91-9820000002', maxGroups: 7 },
  { name: 'Prof. Amit Khanna',       email: 'amit.khanna@nmiet.edu',       title: 'Prof.', phone: '+91-9820000003', maxGroups: 6 },
  { name: 'Dr. Priya Deshmukh',      email: 'priya.deshmukh@nmiet.edu',    title: 'Dr.',   phone: '+91-9820000004', maxGroups: 7 },
  { name: 'Prof. Rahul Patil',       email: 'rahul.patil@nmiet.edu',       title: 'Prof.', phone: '+91-9820000005', maxGroups: 6 },
  { name: 'Dr. Sneha Joshi',         email: 'sneha.joshi@nmiet.edu',       title: 'Dr.',   phone: '+91-9820000006', maxGroups: 6 },
  { name: 'Prof. Nitin Kulkarni',    email: 'nitin.kulkarni@nmiet.edu',    title: 'Prof.', phone: '+91-9820000007', maxGroups: 5 },
  { name: 'Dr. Manish Sharma',       email: 'manish.sharma@nmiet.edu',     title: 'Dr.',   phone: '+91-9820000008', maxGroups: 6 },
  { name: 'Prof. Kavita Tiwari',     email: 'kavita.tiwari@nmiet.edu',     title: 'Prof.', phone: '+91-9820000009', maxGroups: 5 },
  { name: 'Dr. Rajesh Nair',         email: 'rajesh.nair@nmiet.edu',       title: 'Dr.',   phone: '+91-9820000010', maxGroups: 6 },
]

// ─── Domains ──────────────────────────────────────────────────────────────────

const DOMAINS_DATA = [
  { name: 'Machine Learning',         category: 'AI & Data Science',    color: '#3B82F6' },
  { name: 'Cybersecurity',            category: 'Security',             color: '#EF4444' },
  { name: 'Cloud Computing',          category: 'Infrastructure',       color: '#8B5CF6' },
  { name: 'Internet of Things',       category: 'Embedded & Networking',color: '#10B981' },
  { name: 'Natural Language Processing', category: 'AI & Data Science', color: '#F59E0B' },
  { name: 'Blockchain',               category: 'Emerging Tech',        color: '#6366F1' },
  { name: 'Web Development',          category: 'Software Engineering', color: '#EC4899' },
  { name: 'Mobile App Development',   category: 'Software Engineering', color: '#14B8A6' },
  { name: 'Data Analytics',           category: 'AI & Data Science',    color: '#F97316' },
  { name: 'Deep Learning',            category: 'AI & Data Science',    color: '#06B6D4' },
  { name: 'Computer Vision',          category: 'AI & Data Science',    color: '#84CC16' },
  { name: 'Healthcare Informatics',   category: 'Domain Application',   color: '#A855F7' },
  { name: 'Smart City Technology',    category: 'Domain Application',   color: '#0EA5E9' },
  { name: 'E-Commerce Solutions',     category: 'Domain Application',   color: '#FB923C' },
  { name: 'Education Technology',     category: 'Domain Application',   color: '#34D399' },
  { name: 'Supply Chain Management',  category: 'Domain Application',   color: '#F43F5E' },
  { name: 'Digital Forensics',        category: 'Security',             color: '#DC2626' },
  { name: 'Augmented Reality',        category: 'Emerging Tech',        color: '#7C3AED' },
  { name: 'Robotics & Automation',    category: 'Emerging Tech',        color: '#059669' },
  { name: 'Database Management',      category: 'Infrastructure',       color: '#2563EB' },
  { name: 'Network Security',         category: 'Security',             color: '#B91C1C' },
  { name: 'Quantum Computing',        category: 'Emerging Tech',        color: '#4F46E5' },
  { name: 'Social Media Analytics',   category: 'AI & Data Science',    color: '#D97706' },
  { name: 'Biometric Systems',        category: 'Security',             color: '#065F46' },
  { name: 'Autonomous Vehicles',      category: 'Emerging Tech',        color: '#1D4ED8' },
  { name: 'Financial Technology',     category: 'Domain Application',   color: '#15803D' },
  { name: 'Human-Computer Interaction', category: 'Software Engineering',color: '#9333EA' },
  { name: 'Green Computing',          category: 'Infrastructure',       color: '#16A34A' },
  { name: 'Edge Computing',           category: 'Infrastructure',       color: '#0369A1' },
  { name: 'DevOps & CI/CD',           category: 'Software Engineering', color: '#7E22CE' },
  { name: 'Microservices Architecture', category: 'Software Engineering',color: '#B45309' },
  { name: 'Game Development',         category: 'Software Engineering', color: '#C026D3' },
  { name: 'Compiler Design',          category: 'Systems',              color: '#475569' },
  { name: 'Operating Systems',        category: 'Systems',              color: '#64748B' },
  { name: 'Distributed Systems',      category: 'Infrastructure',       color: '#0F172A' },
  { name: 'Information Retrieval',    category: 'AI & Data Science',    color: '#78716C' },
]

// ─── Research Group Data (58 Groups, A: 29, B: 29) ───────────────────────────

function makeGroups(
  facultyMap: Record<string, string>,
  domainMap: Record<string, string>
): Array<{
  groupId: string; title: string; division: 'A' | 'B'; type: 'Respondent' | 'NonResp' | 'CrossDiv';
  facultyId: string; domainId: string; status: 'Active' | 'Proposed' | 'InReview';
  description?: string; memberCount: number; completionPercent: number; successScore: number;
}> {
  const fKeys = Object.keys(facultyMap)
  const dKeys = Object.keys(domainMap)

  const pick = (arr: string[], i: number) => arr[i % arr.length]

  const groupTitles = [
    // Division A (A-01 to A-29)
    ['A-01', 'Cybersecurity Awareness Portal', 'Cybersecurity', 'Prof. Varsha Salve', 'Respondent'],
    ['A-02', 'ML-Based Crop Disease Detection', 'Machine Learning', 'Dr. Supriya Vaidya', 'Respondent'],
    ['A-03', 'Smart Healthcare Monitoring System', 'Healthcare Informatics', 'Prof. Rahul Patil', 'Respondent'],
    ['A-04', 'Blockchain for Academic Records', 'Blockchain', 'Dr. Priya Deshmukh', 'Respondent'],
    ['A-05', 'IoT-Based Home Automation', 'Internet of Things', 'Prof. Amit Khanna', 'Respondent'],
    ['A-06', 'NLP-Driven Chatbot for Student Services', 'Natural Language Processing', 'Dr. Sneha Joshi', 'Respondent'],
    ['A-07', 'Cloud-Based ERP for SMEs', 'Cloud Computing', 'Prof. Nitin Kulkarni', 'Respondent'],
    ['A-08', 'Deep Learning for Medical Image Analysis', 'Deep Learning', 'Dr. Manish Sharma', 'Respondent'],
    ['A-09', 'Augmented Reality in Education', 'Augmented Reality', 'Prof. Kavita Tiwari', 'Respondent'],
    ['A-10', 'Distributed Ledger for Supply Chain', 'Supply Chain Management', 'Dr. Rajesh Nair', 'Respondent'],
    ['A-11', 'Real-Time Traffic Management System', 'Smart City Technology', 'Prof. Varsha Salve', 'Respondent'],
    ['A-12', 'E-Learning Platform with AI Tutoring', 'Education Technology', 'Dr. Supriya Vaidya', 'Respondent'],
    ['A-13', 'Computer Vision for Retail Analytics', 'Computer Vision', 'Prof. Rahul Patil', 'Respondent'],
    ['A-14', 'Social Media Sentiment Analysis', 'Social Media Analytics', 'Dr. Priya Deshmukh', 'Respondent'],
    ['A-15', 'Mobile Health App for Diabetes Management', 'Mobile App Development', 'Prof. Amit Khanna', 'Respondent'],
    ['A-16', 'Microservices Architecture for Banking', 'Microservices Architecture', 'Dr. Sneha Joshi', 'Respondent'],
    ['A-17', 'Game-Based Learning Platform', 'Game Development', 'Prof. Nitin Kulkarni', 'NonResp'],
    ['A-18', 'Quantum Cryptography Implementation', 'Quantum Computing', 'Dr. Manish Sharma', 'NonResp'],
    ['A-19', 'Edge AI for Smart Surveillance', 'Edge Computing', 'Prof. Kavita Tiwari', 'NonResp'],
    ['A-20', 'FinTech App for Rural Banking', 'Financial Technology', 'Dr. Rajesh Nair', 'NonResp'],
    ['A-21', 'Robotic Process Automation for HR', 'Robotics & Automation', 'Prof. Varsha Salve', 'NonResp'],
    ['A-22', 'Digital Forensics Investigation Tool', 'Digital Forensics', 'Dr. Supriya Vaidya', 'NonResp'],
    ['A-23', 'Biometric Attendance Management System', 'Biometric Systems', 'Prof. Rahul Patil', 'NonResp'],
    ['A-24', 'Green Computing Metrics Dashboard', 'Green Computing', 'Dr. Priya Deshmukh', 'Respondent'],
    ['A-25', 'Autonomous Drone Navigation System', 'Autonomous Vehicles', 'Prof. Amit Khanna', 'NonResp'],
    ['A-26', 'DevOps Pipeline for Microservices', 'DevOps & CI/CD', 'Dr. Sneha Joshi', 'Respondent'],
    ['A-27', 'Information Retrieval from Legal Documents', 'Information Retrieval', 'Prof. Nitin Kulkarni', 'NonResp'],
    ['A-28', 'HCI Design for Elderly Users', 'Human-Computer Interaction', 'Dr. Manish Sharma', 'NonResp'],
    ['A-29', 'Network Intrusion Detection System', 'Network Security', 'Prof. Kavita Tiwari', 'Respondent'],
    // Division B (B-01 to B-29)
    ['B-01', 'E-Commerce Recommendation Engine', 'E-Commerce Solutions', 'Dr. Rajesh Nair', 'Respondent'],
    ['B-02', 'Federated Learning for Privacy', 'Machine Learning', 'Prof. Varsha Salve', 'Respondent'],
    ['B-03', 'Smart Water Quality Monitoring', 'Internet of Things', 'Dr. Supriya Vaidya', 'Respondent'],
    ['B-04', 'Voice-Controlled Smart Home', 'Natural Language Processing', 'Prof. Rahul Patil', 'Respondent'],
    ['B-05', 'AI-Based Stock Market Predictor', 'Data Analytics', 'Dr. Priya Deshmukh', 'Respondent'],
    ['B-06', 'Secure Cloud Storage System', 'Cloud Computing', 'Prof. Amit Khanna', 'Respondent'],
    ['B-07', 'Real-Time Sign Language Interpreter', 'Computer Vision', 'Dr. Sneha Joshi', 'Respondent'],
    ['B-08', 'Blockchain-Based Voting System', 'Blockchain', 'Prof. Nitin Kulkarni', 'Respondent'],
    ['B-09', 'Deep Learning for Fake News Detection', 'Deep Learning', 'Dr. Manish Sharma', 'Respondent'],
    ['B-10', 'Predictive Maintenance for Industry 4.0', 'Machine Learning', 'Prof. Kavita Tiwari', 'Respondent'],
    ['B-11', 'AR-Based Navigation System', 'Augmented Reality', 'Dr. Rajesh Nair', 'Respondent'],
    ['B-12', 'Patient Risk Assessment Dashboard', 'Healthcare Informatics', 'Prof. Varsha Salve', 'Respondent'],
    ['B-13', 'Smart Agriculture Platform', 'Internet of Things', 'Dr. Supriya Vaidya', 'Respondent'],
    ['B-14', 'Distributed Tracing for Microservices', 'Distributed Systems', 'Prof. Rahul Patil', 'Respondent'],
    ['B-15', 'NLP for Resume Screening', 'Natural Language Processing', 'Dr. Priya Deshmukh', 'Respondent'],
    ['B-16', 'Mobile Learning App for Coding', 'Mobile App Development', 'Prof. Amit Khanna', 'Respondent'],
    ['B-17', 'Zero-Trust Network Architecture', 'Network Security', 'Dr. Sneha Joshi', 'NonResp'],
    ['B-18', 'Quantum ML for Optimization', 'Quantum Computing', 'Prof. Nitin Kulkarni', 'NonResp'],
    ['B-19', 'Digital Twin for Smart Manufacturing', 'Smart City Technology', 'Dr. Manish Sharma', 'NonResp'],
    ['B-20', 'Crowdfunding Platform with Smart Contracts', 'Financial Technology', 'Prof. Kavita Tiwari', 'NonResp'],
    ['B-21', 'Autonomous Agricultural Robot', 'Robotics & Automation', 'Dr. Rajesh Nair', 'NonResp'],
    ['B-22', 'Log Analysis Tool for Cybersecurity', 'Cybersecurity', 'Prof. Varsha Salve', 'NonResp'],
    ['B-23', 'Serverless Architecture for APIs', 'Cloud Computing', 'Dr. Supriya Vaidya', 'NonResp'],
    ['B-24', 'Data Governance Framework', 'Database Management', 'Prof. Rahul Patil', 'Respondent'],
    ['B-25', 'Supply Chain Transparency with IoT', 'Supply Chain Management', 'Dr. Priya Deshmukh', 'NonResp'],
    ['B-26', 'CI/CD for AI/ML Pipelines', 'DevOps & CI/CD', 'Prof. Amit Khanna', 'Respondent'],
    ['B-27', 'Browser-Based Compiler Design', 'Compiler Design', 'Dr. Sneha Joshi', 'NonResp'],
    ['B-28', 'OS Kernel Module Development', 'Operating Systems', 'Prof. Nitin Kulkarni', 'NonResp'],
    ['B-29', 'Cross-Platform AR Shopping', 'Augmented Reality', 'Dr. Manish Sharma', 'CrossDiv'],
  ]

  return groupTitles.map(([groupId, title, domain, faculty, type], i) => ({
    groupId,
    title,
    division: (groupId.startsWith('A') ? 'A' : 'B') as 'A' | 'B',
    type: type as 'Respondent' | 'NonResp' | 'CrossDiv',
    facultyId: facultyMap[faculty] ?? pick(fKeys, i),
    domainId: domainMap[domain] ?? pick(dKeys, i),
    status: (i % 5 === 0 ? 'Proposed' : i % 7 === 0 ? 'InReview' : 'Active') as 'Active' | 'Proposed' | 'InReview',
    memberCount: i % 3 === 0 ? 3 : 2,
    completionPercent: Math.floor(Math.random() * 60) + 20,
    successScore: Math.floor(Math.random() * 30) + 65,
    description: `Research project: ${title}. Division ${groupId.startsWith('A') ? 'A' : 'B'}, Type: ${type}.`,
  }))
}

// ─── Student names ────────────────────────────────────────────────────────────

const STUDENT_FIRST = [
  'Aarav','Aditya','Akash','Ananya','Arjun','Arnav','Ayesha','Bhavesh','Chaitanya','Deepak',
  'Divya','Gaurav','Harsh','Ishaan','Janhavi','Kiran','Komal','Lakshmi','Manish','Meera',
  'Mihir','Nandini','Nikhil','Omkar','Pallavi','Parth','Pooja','Pranav','Priya','Rahul',
  'Riya','Rohit','Sakshi','Sanjay','Sanket','Shreya','Shubham','Sneha','Sonal','Soham',
  'Suresh','Swati','Tanmay','Tushar','Uday','Vaibhav','Vijay','Vinayak','Vishal','Yogesh',
]
const STUDENT_LAST = [
  'Bhat','Chavan','Desai','Deshpande','Gaikwad','Jadhav','Joshi','Kamble','Karale','Kulkarni',
  'Mane','More','Patil','Pawar','Salunkhe','Sharma','Shinde','Thorat','Wagh','Yadav',
]

function genStudents(
  groups: Array<{ id: string; groupId: string; division: 'A' | 'B'; memberCount: number }>
) {
  const students: Array<{
    prn: string; name: string; email: string; division: 'A' | 'B'; roll: number;
    groupId: string; skills: string[]; interests: string[]; gpa: number;
  }> = []

  const SKILLS_POOL = ['Python','JavaScript','TypeScript','Java','C++','SQL','React','Node.js','ML','TensorFlow','AWS','Docker','Kubernetes','Git','MongoDB']
  const INTERESTS_POOL = ['AI','Cybersecurity','Web Dev','Mobile Apps','Data Science','Cloud','Blockchain','IoT','Research','Open Source']

  let rollA = 1, rollB = 1, seqNum = 10001

  for (const group of groups) {
    const count = group.memberCount
    for (let i = 0; i < count; i++) {
      const fn = STUDENT_FIRST[(seqNum + i) % STUDENT_FIRST.length]
      const ln = STUDENT_LAST[(seqNum * 3 + i) % STUDENT_LAST.length]
      const name = `${fn} ${ln}`
      const roll = group.division === 'A' ? rollA++ : rollB++
      const prn = `MCA${group.division}2025${String(roll).padStart(3, '0')}`

      students.push({
        prn,
        name,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${roll}@student.nmiet.edu`,
        division: group.division,
        roll,
        groupId: group.id,
        skills: SKILLS_POOL.slice((seqNum + i) % 10, ((seqNum + i) % 10) + 3),
        interests: INTERESTS_POOL.slice((seqNum * 2 + i) % 7, ((seqNum * 2 + i) % 7) + 2),
        gpa: parseFloat((6.5 + Math.random() * 3).toFixed(2)),
      })
      seqNum++
    }
  }
  return students
}

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding NMIET MCA Research Tracker database...')

  // Clear existing data
  await prisma.$transaction([
    prisma.changeLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.student.deleteMany(),
    prisma.researchGroup.deleteMany(),
    prisma.user.deleteMany(),
    prisma.faculty.deleteMany(),
    prisma.domain.deleteMany(),
  ])
  console.log('✓ Cleared existing data')

  // Seed domains
  const domains = await Promise.all(
    DOMAINS_DATA.map(d => prisma.domain.create({ data: d }))
  )
  const domainMap = Object.fromEntries(domains.map(d => [d.name, d.id]))
  console.log(`✓ Created ${domains.length} domains`)

  // Seed faculty
  const faculty = await Promise.all(
    FACULTY_DATA.map(f => prisma.faculty.create({
      data: { ...f, preferredDomains: [], rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) },
    }))
  )
  const facultyMap = Object.fromEntries(faculty.map(f => [f.name, f.id]))
  console.log(`✓ Created ${faculty.length} faculty`)

  // Seed groups
  const groupData = makeGroups(facultyMap, domainMap)
  const groups = await Promise.all(
    groupData.map(g => prisma.researchGroup.create({ data: g }))
  )
  console.log(`✓ Created ${groups.length} research groups`)

  // Update domain groupCounts
  for (const domain of domains) {
    const count = groups.filter(g => g.domainId === domain.id).length
    if (count > 0) await prisma.domain.update({ where: { id: domain.id }, data: { groupCount: count } })
  }

  // Seed students
  const studentData = genStudents(groups.map(g => ({
    id: g.id, groupId: g.groupId, division: g.division, memberCount: g.memberCount,
  })))
  const students = await Promise.all(
    studentData.map(s => prisma.student.create({ data: s }))
  )
  console.log(`✓ Created ${students.length} students`)

  // Seed milestones for each group
  const MILESTONE_TEMPLATES = [
    { name: 'Literature Review',   weeksOffset: 2 },
    { name: 'Research Proposal',   weeksOffset: 5 },
    { name: 'Mid-Term Evaluation', weeksOffset: 9 },
    { name: 'Data Collection',     weeksOffset: 13 },
    { name: 'Final Presentation',  weeksOffset: 17 },
  ]

  const now = new Date('2026-02-01')
  const milestones = await Promise.all(
    groups.flatMap(g =>
      MILESTONE_TEMPLATES.map((m, mi) => {
        const due = new Date(now)
        due.setDate(due.getDate() + m.weeksOffset * 7)
        const status = mi === 0 ? 'Completed' : mi === 1 ? 'InProgress' : 'NotStarted'
        return prisma.milestone.create({
          data: {
            groupId: g.id,
            name: m.name,
            dueDate: due,
            status: status as 'Completed' | 'InProgress' | 'NotStarted',
            completionDate: status === 'Completed' ? new Date(now.getTime() + mi * 7 * 24 * 3600000) : null,
            completionPercent: status === 'Completed' ? 100 : status === 'InProgress' ? 50 : 0,
          },
        })
      })
    )
  )
  console.log(`✓ Created ${milestones.length} milestones`)

  // Seed approval records for active groups
  const activeGroups = groups.filter(g => g.status === 'Active').slice(0, 20)
  await Promise.all(
    activeGroups.flatMap(g => [
      prisma.approval.create({
        data: {
          groupId: g.id, approverType: 'Coordinator', approverName: 'Dr. Meena Coordinator',
          status: 'Approved', approvalDate: new Date(), order: 1, comments: 'Approved - meets requirements',
        },
      }),
      prisma.approval.create({
        data: {
          groupId: g.id, approverType: 'Faculty', approverName: 'Faculty Guide',
          status: 'Approved', approvalDate: new Date(), order: 2, comments: 'Faculty confirmed',
        },
      }),
    ])
  )
  console.log('✓ Created approval records')

  // Seed users (admin + coordinaor + all faculty)
  const passwordHash = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.create({
      data: { email: 'admin@nmiet.edu', passwordHash, role: 'Admin', name: 'System Administrator' },
    }),
    prisma.user.create({
      data: { email: 'coordinator@nmiet.edu', passwordHash, role: 'Coordinator', name: 'MCA Coordinator' },
    }),
    ...faculty.map(f =>
      prisma.user.create({
        data: {
          email: f.email,
          passwordHash,
          role: 'Faculty',
          name: f.name,
          linkedId: f.id,
        },
      })
    ),
  ])
  console.log(`✓ Created ${users.length} user accounts`)

  console.log('\n✅ Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Groups:    ${groups.length}`)
  console.log(`  Students:  ${students.length}`)
  console.log(`  Faculty:   ${faculty.length}`)
  console.log(`  Domains:   ${domains.length}`)
  console.log(`  Milestones:${milestones.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nDefault login credentials:')
  console.log('  Admin:       admin@nmiet.edu / password123')
  console.log('  Coordinator: coordinator@nmiet.edu / password123')
  console.log('  Faculty:     (faculty-email)@nmiet.edu / password123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
