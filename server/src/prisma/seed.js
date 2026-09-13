import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SkillBridge database...');

  // Clean existing data in order
  await prisma.submission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'National Institute of Technology (NIT)',
      code: 'NIT-2026',
    },
  });

  // 2. Create 6 Skills
  const skillNames = ['Python', 'SQL', 'C++', 'Data Structures', 'React', 'Communication'];
  const skillMap = {};

  for (const name of skillNames) {
    const skill = await prisma.skill.create({
      data: { name },
    });
    skillMap[name] = skill;
  }

  // 3. Create 3 Students attached to institution
  const student1 = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex.chen@student.nit.edu',
      role: 'student',
      institutionId: institution.id,
      aadhaarVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@student.nit.edu',
      role: 'student',
      institutionId: institution.id,
      aadhaarVerified: true,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@student.nit.edu',
      role: 'student',
      institutionId: institution.id,
      aadhaarVerified: false,
    },
  });

  // 4. Attach Student Skills with levels and statuses
  // Alex: Python verified (lvl 2), SQL claimed (lvl 3), Data Structures pending (lvl 0)
  await prisma.studentSkill.createMany({
    data: [
      { userId: student1.id, skillId: skillMap['Python'].id, status: 'verified', level: 2 },
      { userId: student1.id, skillId: skillMap['SQL'].id, status: 'claimed', level: 3 },
      { userId: student1.id, skillId: skillMap['Data Structures'].id, status: 'pending', level: 0 },
      // Priya: React verified (lvl 3), Python verified (lvl 1), Communication pending (lvl 0)
      { userId: student2.id, skillId: skillMap['React'].id, status: 'verified', level: 3 },
      { userId: student2.id, skillId: skillMap['Python'].id, status: 'verified', level: 1 },
      { userId: student2.id, skillId: skillMap['Communication'].id, status: 'pending', level: 0 },
      // Rohan: C++ pending (lvl 0), Data Structures pending (lvl 0)
      { userId: student3.id, skillId: skillMap['C++'].id, status: 'pending', level: 0 },
      { userId: student3.id, skillId: skillMap['Data Structures'].id, status: 'pending', level: 0 },
    ],
  });

  // 5. Create Recruiters & Companies
  const recruiter1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@techcorp.com',
      role: 'recruiter',
      aadhaarVerified: true,
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      name: 'Vikram Mehta',
      email: 'vikram@cloudscale.io',
      role: 'recruiter',
      aadhaarVerified: true,
    },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@dataflow.ai',
      role: 'recruiter',
      aadhaarVerified: true,
    },
  });

  const recruiter4 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@systemx.tech',
      role: 'recruiter',
      aadhaarVerified: true,
    },
  });

  const company1 = await prisma.company.create({
    data: { name: 'TechCorp Solutions', recruiterId: recruiter1.id },
  });

  const company2 = await prisma.company.create({
    data: { name: 'CloudScale Infrastructure', recruiterId: recruiter2.id },
  });

  const company3 = await prisma.company.create({
    data: { name: 'DataFlow Analytics', recruiterId: recruiter3.id },
  });

  const company4 = await prisma.company.create({
    data: { name: 'SystemX Architectures', recruiterId: recruiter4.id },
  });

  // 6. Create Institution User
  await prisma.user.create({
    data: {
      name: 'Dr. Aris Thorne (NIT Dean)',
      email: 'dean@nit.edu',
      role: 'institution',
      institutionId: institution.id,
      aadhaarVerified: true,
    },
  });

  // 7. Create 4 Job Postings each with required skills list
  const job1 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Full Stack Software Engineer',
      description: 'Join TechCorp to build high-scale React & Python cloud services. Looking for engineers with strong frontend capabilities and verified algorithmic foundations.',
      requiredSkills: [
        { skillId: skillMap['React'].id, skillName: 'React', minLevel: 2 },
        { skillId: skillMap['Python'].id, skillName: 'Python', minLevel: 1 },
      ],
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Backend Systems Engineer',
      description: 'Scale our cloud infrastructure engines using Python & Data Structures. Requires verified data structure optimization experience.',
      requiredSkills: [
        { skillId: skillMap['Python'].id, skillName: 'Python', minLevel: 2 },
        { skillId: skillMap['Data Structures'].id, skillName: 'Data Structures', minLevel: 1 },
      ],
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: company3.id,
      title: 'Data & Analytics Engineer',
      description: 'Design analytical data pipelines with SQL and Python backend transformations.',
      requiredSkills: [
        { skillId: skillMap['Python'].id, skillName: 'Python', minLevel: 1 },
        { skillId: skillMap['SQL'].id, skillName: 'SQL', minLevel: 1 },
      ],
    },
  });

  const job4 = await prisma.job.create({
    data: {
      companyId: company4.id,
      title: 'C++ Systems Programmer',
      description: 'Build low-latency kernel and system modules in modern C++.',
      requiredSkills: [
        { skillId: skillMap['C++'].id, skillName: 'C++', minLevel: 2 },
        { skillId: skillMap['Data Structures'].id, skillName: 'Data Structures', minLevel: 2 },
      ],
    },
  });

  // 8. Create 2 Challenges tied to jobs
  const challenge1 = await prisma.challenge.create({
    data: {
      jobId: job1.id,
      title: 'React Custom Hooks & State Optimization',
      description: 'Implement a zero-dependency dynamic table component in React with virtualized scrolling and debounced search filters.',
      difficultyLevel: 3,
      timeLimitMinutes: 45,
      requiredSkills: [
        { skillId: skillMap['React'].id, skillName: 'React', minLevel: 2 },
      ],
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      jobId: job2.id,
      title: 'Python High-Throughput Stream Processor',
      description: 'Write an asynchronous Python stream processing function with O(1) sliding window deduplication algorithm.',
      difficultyLevel: 4,
      timeLimitMinutes: 60,
      requiredSkills: [
        { skillId: skillMap['Python'].id, skillName: 'Python', minLevel: 2 },
      ],
    },
  });

  // 9. Create Submissions (1 reviewed, 1 pending)
  // Priya's submission for Challenge 1 (Reviewed & Verified)
  const submission1 = await prisma.submission.create({
    data: {
      challengeId: challenge1.id,
      userId: student2.id, // Priya
      content: `// React Solution by Priya Sharma
import React, { useState, useMemo } from 'react';

export function VirtualizedTable({ items, search }) {
  const filtered = useMemo(() => items.filter(i => i.name.includes(search)), [items, search]);
  return <div className="table-container">{filtered.map(i => <div key={i.id}>{i.name}</div>)}</div>;
}`,
      status: 'reviewed',
      verifiedByRecruiter: true,
      tabSwitches: 0,
    },
  });

  // Alex's submission for Challenge 2 (Pending Review)
  await prisma.submission.create({
    data: {
      challengeId: challenge2.id,
      userId: student1.id, // Alex
      content: `# Python Sliding Window Processor by Alex Chen
import collections

class StreamDeduplicator:
    def __init__(self, window_size=1000):
        self.window = collections.deque()
        self.seen = set()
    
    def process(self, event_id):
        if event_id in self.seen:
            return False
        self.seen.add(event_id)
        self.window.append(event_id)
        return True`,
      status: 'pending',
      verifiedByRecruiter: false,
      tabSwitches: 1,
    },
  });

  // 10. Seed Assessment Quizzes for skills
  const assessmentsData = [
    {
      skillId: skillMap['Python'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'What is the time complexity of looking up a key in a standard Python dictionary?',
          options: ['O(N)', 'O(log N)', 'O(1) average case', 'O(N^2)'],
          correctAnswerIndex: 2,
        },
        {
          id: 2,
          question: 'Which built-in Python module provides immutable named tuple structures and deque queues?',
          options: ['sys', 'collections', 'itertools', 'functools'],
          correctAnswerIndex: 1,
        },
        {
          id: 3,
          question: 'What will list(map(lambda x: x * 2, [1, 2, 3])) evaluate to?',
          options: ['[1, 2, 3, 1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'Error'],
          correctAnswerIndex: 1,
        },
      ],
    },
    {
      skillId: skillMap['React'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'Which React Hook is primarily designed to preserve values across renders without causing re-renders?',
          options: ['useState', 'useRef', 'useMemo', 'useCallback'],
          correctAnswerIndex: 1,
        },
        {
          id: 2,
          question: 'What does React batching do in React 18+ state updates?',
          options: [
            'Groups multiple state updates into a single re-render for better performance',
            'Executes network calls in parallel',
            'Compiles JSX to WebAssembly',
            'Prevents any re-renders',
          ],
          correctAnswerIndex: 0,
        },
        {
          id: 3,
          question: 'When does the cleanup function of useEffect run?',
          options: [
            'Only on initial page refresh',
            'Before the component unmounts or before the effect re-runs on dependency changes',
            'Directly inside the render loop',
            'Never',
          ],
          correctAnswerIndex: 1,
        },
      ],
    },
    {
      skillId: skillMap['SQL'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'Which SQL clause filters aggregation results generated by a GROUP BY query?',
          options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
          correctAnswerIndex: 1,
        },
        {
          id: 2,
          question: 'What type of JOIN returns all records when there is a match in either left or right table?',
          options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
          correctAnswerIndex: 2,
        },
        {
          id: 3,
          question: 'In database indexing, what structural node index is most commonly used for range queries?',
          options: ['B-Tree / B+Tree', 'Hash Table', 'Linear Array', 'Graph Node'],
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      skillId: skillMap['Data Structures'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'What is the worst-case space complexity of Depth First Search (DFS) on a tree of depth H?',
          options: ['O(1)', 'O(H)', 'O(N^2)', 'O(2^H)'],
          correctAnswerIndex: 1,
        },
        {
          id: 2,
          question: 'Which dynamic data structure operates on First-In, First-Out (FIFO) ordering?',
          options: ['Stack', 'Queue', 'Heap', 'Tree'],
          correctAnswerIndex: 1,
        },
        {
          id: 3,
          question: 'What is the worst-case time complexity of standard Quicksort without median pivot selection?',
          options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
          correctAnswerIndex: 2,
        },
      ],
    },
    {
      skillId: skillMap['C++'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'Which C++ smart pointer guarantees single unique ownership of a dynamically allocated object?',
          options: ['std::shared_ptr', 'std::unique_ptr', 'std::weak_ptr', 'std::auto_ptr'],
          correctAnswerIndex: 1,
        },
        {
          id: 2,
          question: 'What concept in C++ RAII stands for?',
          options: [
            'Resource Acquisition Is Initialization',
            'Runtime Application Interface Integration',
            'Recursive Array Index Inspection',
            'Reference Alignment In Inheritance',
          ],
          correctAnswerIndex: 0,
        },
        {
          id: 3,
          question: 'What is the key advantage of move semantics (`std::move`) introduced in C++11?',
          options: [
            'Transfers resource ownership without expensive deep copying',
            'Runs code in parallel CPU threads',
            'Garbage collects unused memory automatically',
            'Eliminates templates',
          ],
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      skillId: skillMap['Communication'].id,
      passScore: 66,
      questions: [
        {
          id: 1,
          question: 'In engineering team collaboration, what characterizes effective asynchronous communication?',
          options: [
            'Clear, self-contained documentation with explicit context and actionable next steps',
            'Sending short one-word messages on Slack every 5 minutes',
            'Calling unscheduled video meetings for every code review',
            'Never writing down decisions',
          ],
          correctAnswerIndex: 0,
        },
        {
          id: 2,
          question: 'When receiving critical technical feedback on a pull request, what is the best practice?',
          options: [
            'Acknowledge points constructively, ask clarifying questions on ambiguous items, and address concerns objectively',
            'Ignore the comments and merge anyway',
            'Reject all feedback immediately',
            'Delete the pull request',
          ],
          correctAnswerIndex: 0,
        },
        {
          id: 3,
          question: 'What is the core principle of concise status reporting (e.g., Standups)?',
          options: [
            'Highlight accomplishments, current blockers, and next objectives succinctly',
            'Read your entire code git log line by line',
            'Complain about non-technical topics',
            'Remain silent',
          ],
          correctAnswerIndex: 0,
        },
      ],
    },
  ];

  for (const item of assessmentsData) {
    await prisma.assessment.create({
      data: item,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
