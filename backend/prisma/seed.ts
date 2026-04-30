import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { db } from '../src/data/mockData.js';
import { validateMockData } from '../src/data/validateMockData.js';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

const demoUsers = [
  {
    id: 'demo-mentor',
    email: 'demo.mentor@example.com',
    name: 'Анна Орлова',
    role: 'user',
    status: 'active',
    cityId: 1,
    birthDate: new Date('1992-05-14T00:00:00.000Z'),
    gender: 'female',
    bio:
      'Проектный менеджер, помогает выстраивать планирование, командные ритуалы ' +
      'и понятную обратную связь без лишней бюрократии.',
    avatarUrl: ''
  },
  {
    id: 'demo-student',
    email: 'demo.student@example.com',
    name: 'Илья Смирнов',
    role: 'user',
    status: 'active',
    cityId: 2,
    birthDate: new Date('1997-09-20T00:00:00.000Z'),
    gender: 'male',
    bio:
      'Изучает управление проектами и готов помогать с разговорным английским ' +
      'на дружеских практических созвонах.',
    avatarUrl: ''
  }
];

const demoUserSkills = [
  {
    id: 'demo-skill-project-management',
    userId: 'demo-mentor',
    type: 'teach',
    title: 'Управление проектами для небольших команд',
    description:
      'Научу разбивать работу на понятные этапы, проводить недельное планирование ' +
      'и держать команду в одном контексте без тяжелых процессов.',
    categoryId: 1,
    subcategoryId: 17,
    imageUrls: '[]'
  },
  {
    id: 'demo-skill-english-conversation',
    userId: 'demo-student',
    type: 'teach',
    title: 'Разговорная практика английского',
    description:
      'Дружеские разговорные занятия для уверенности, повседневной лексики ' +
      'и более чистого произношения.',
    categoryId: 3,
    subcategoryId: 31,
    imageUrls: '[]'
  },
  {
    id: 'demo-skill-learn-project-management',
    userId: 'demo-student',
    type: 'learn',
    title: 'Основы управления проектами',
    description:
      'Хочу научиться планировать задачи, оценивать сроки и организовывать ' +
      'небольшой проект от идеи до результата.',
    categoryId: 1,
    subcategoryId: 17,
    imageUrls: '[]'
  }
];

const demoMaterials = [
  {
    id: 'demo-material-pm-theory',
    userSkillId: 'demo-skill-project-management',
    type: 'theory',
    title: 'Основы планирования',
    description:
      'Ключевые понятия, которые стоит прочитать перед первой встречей.',
    content:
      'Начните с цели, определите ближайший полезный результат, выпишите риски, ' +
      'назначьте ответственных и даты. План должен быть видимым для команды ' +
      'и обновляться после каждой рабочей встречи.',
    position: 0
  },
  {
    id: 'demo-material-pm-practice',
    userSkillId: 'demo-skill-project-management',
    type: 'practice',
    title: 'Соберите план проекта на одну неделю',
    description:
      'Короткое упражнение для применения базового подхода к планированию.',
    content:
      'Выберите небольшой проект, сформулируйте три результата на неделю, ' +
      'разбейте их на задачи и назначьте одного ответственного на каждую задачу. ' +
      'Принесите план на следующую встречу.',
    position: 1
  },
  {
    id: 'demo-material-pm-testing',
    userSkillId: 'demo-skill-project-management',
    type: 'testing',
    title: 'Проверка по планированию',
    description: 'Быстрая самопроверка после изучения теории.',
    content: null,
    position: 2
  }
];

const demoQuestions = [
  {
    id: 'demo-question-pm-1',
    materialId: 'demo-material-pm-testing',
    text: 'С чего безопаснее всего начать перед распределением задач?',
    position: 0
  },
  {
    id: 'demo-question-pm-2',
    materialId: 'demo-material-pm-testing',
    text: 'Зачем каждой задаче нужен один ответственный?',
    position: 1
  }
];

const demoAnswerOptions = [
  {
    id: 'demo-option-pm-1-a',
    questionId: 'demo-question-pm-1',
    text: 'Определить цель и ближайший полезный результат.',
    isCorrect: true,
    position: 0
  },
  {
    id: 'demo-option-pm-1-b',
    questionId: 'demo-question-pm-1',
    text: 'Сразу позвать всех работать без общего плана.',
    isCorrect: false,
    position: 1
  },
  {
    id: 'demo-option-pm-2-a',
    questionId: 'demo-question-pm-2',
    text: 'Так понятна ответственность и меньше риск дублировать работу.',
    isCorrect: true,
    position: 0
  },
  {
    id: 'demo-option-pm-2-b',
    questionId: 'demo-question-pm-2',
    text: 'Так больше не нужно обсуждать приоритеты.',
    isCorrect: false,
    position: 1
  }
];

const seedCities = async () => {
  for (const city of db.cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: { name: city.name },
      create: {
        id: city.id,
        name: city.name
      }
    });
  }
};

const seedSkillGroups = async () => {
  for (const group of db.skills) {
    await prisma.skillGroup.upsert({
      where: { id: group.id },
      update: { name: group.name },
      create: {
        id: group.id,
        name: group.name
      }
    });
  }
};

const seedSkills = async () => {
  for (const group of db.skills) {
    const subskills = group.subskills ?? [];
    for (const skill of subskills) {
      await prisma.skill.upsert({
        where: { id: skill.id },
        update: {
          name: skill.name,
          groupId: group.id
        },
        create: {
          id: skill.id,
          name: skill.name,
          groupId: group.id
        }
      });
    }
  }
};

const seedDemoUsers = async () => {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        cityId: user.cityId,
        birthDate: user.birthDate,
        gender: user.gender,
        bio: user.bio
      },
      create: {
        ...user,
        passwordHash
      }
    });
  }
};

const seedDemoUserSkills = async () => {
  for (const skill of demoUserSkills) {
    await prisma.userSkill.upsert({
      where: { id: skill.id },
      update: {
        userId: skill.userId,
        type: skill.type,
        title: skill.title,
        description: skill.description,
        categoryId: skill.categoryId,
        subcategoryId: skill.subcategoryId,
        imageUrls: skill.imageUrls
      },
      create: skill
    });
  }
};

const seedDemoMaterials = async () => {
  for (const material of demoMaterials) {
    await prisma.userSkillMaterial.upsert({
      where: { id: material.id },
      update: {
        userSkillId: material.userSkillId,
        type: material.type,
        title: material.title,
        description: material.description,
        content: material.content,
        position: material.position
      },
      create: material
    });
  }
};

const seedDemoQuestions = async () => {
  for (const question of demoQuestions) {
    await prisma.materialQuestion.upsert({
      where: { id: question.id },
      update: {
        materialId: question.materialId,
        text: question.text,
        position: question.position
      },
      create: question
    });
  }
};

const seedDemoAnswerOptions = async () => {
  for (const option of demoAnswerOptions) {
    await prisma.materialAnswerOption.upsert({
      where: { id: option.id },
      update: {
        questionId: option.questionId,
        text: option.text,
        isCorrect: option.isCorrect,
        position: option.position
      },
      create: option
    });
  }
};

const seedDemoData = async () => {
  await seedDemoUsers();
  await seedDemoUserSkills();
  await seedDemoMaterials();
  await seedDemoQuestions();
  await seedDemoAnswerOptions();
};

async function main() {
  validateMockData(db);
  await seedCities();
  await seedSkillGroups();
  await seedSkills();
  await seedDemoData();
}

main()
  .catch((error) => {
    console.error('[seed] Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
