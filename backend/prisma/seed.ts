import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { db } from '../src/data/mockData.js';
import { validateMockData } from '../src/data/validateMockData.js';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

const avatarUrl = (imageId: number) =>
  `https://i.pravatar.cc/240?img=${imageId}`;

const skillImageUrls = (seed: string) =>
  JSON.stringify([`https://picsum.photos/seed/${seed}/900/600`]);

const textAttachment = (id: string, name: string, content: string) =>
  JSON.stringify([
    {
      id,
      name,
      type: 'text/plain',
      size: content.length,
      url: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
    }
  ]);

const getMaterialAttachments = (material: object) =>
  'attachments' in material && typeof material.attachments === 'string'
    ? material.attachments
    : '[]';

const getQuestionType = (question: object) =>
  'type' in question && typeof question.type === 'string'
    ? question.type
    : 'single';

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

const testUsers = [
  {
    id: 'test-user-illustration',
    email: 'test.illustration@example.com',
    name: 'Мария Соколова',
    role: 'user',
    status: 'active',
    cityId: 1,
    birthDate: new Date('1994-03-18T00:00:00.000Z'),
    gender: 'female',
    bio: 'Иллюстратор и арт-директор. Помогает новичкам собрать визуальный стиль, работать с референсами и доводить эскизы до портфолио.',
    avatarUrl: avatarUrl(47)
  },
  {
    id: 'test-user-teamlead',
    email: 'test.teamlead@example.com',
    name: 'Артём Волков',
    role: 'user',
    status: 'active',
    cityId: 2,
    birthDate: new Date('1989-11-02T00:00:00.000Z'),
    gender: 'male',
    bio: 'Тимлид с опытом запуска небольших команд. Разбирает планирование, делегирование и спокойную коммуникацию без микроменеджмента.',
    avatarUrl: avatarUrl(12)
  },
  {
    id: 'test-user-photo',
    email: 'test.photo@example.com',
    name: 'Елена Кузнецова',
    role: 'user',
    status: 'active',
    cityId: 5,
    birthDate: new Date('1991-07-27T00:00:00.000Z'),
    gender: 'female',
    bio: 'Фотограф предметной и портретной съёмки. Учит видеть свет, выбирать ракурс и быстро улучшать снимки даже на телефон.',
    avatarUrl: avatarUrl(32)
  },
  {
    id: 'test-user-marketing',
    email: 'test.marketing@example.com',
    name: 'Николай Морозов',
    role: 'user',
    status: 'active',
    cityId: 3,
    birthDate: new Date('1987-12-09T00:00:00.000Z'),
    gender: 'male',
    bio: 'Маркетолог для малого бизнеса. Помогает сформулировать оффер, выбрать каналы продвижения и не слить бюджет на случайные гипотезы.',
    avatarUrl: avatarUrl(56)
  },
  {
    id: 'test-user-yoga',
    email: 'test.yoga@example.com',
    name: 'Светлана Белова',
    role: 'user',
    status: 'inactive',
    cityId: 8,
    birthDate: new Date('1990-04-21T00:00:00.000Z'),
    gender: 'female',
    bio: 'Инструктор по мягкой йоге и дыхательным практикам. Подбирает короткие комплексы для спины, сна и восстановления после рабочего дня.',
    avatarUrl: avatarUrl(25)
  },
  {
    id: 'test-user-english',
    email: 'test.english@example.com',
    name: 'Дмитрий Ковалёв',
    role: 'user',
    status: 'active',
    cityId: 4,
    birthDate: new Date('1996-01-30T00:00:00.000Z'),
    gender: 'male',
    bio: 'Преподаватель английского для разговорной практики. Фокусируется на живых диалогах, произношении и уверенности на созвонах.',
    avatarUrl: avatarUrl(68)
  },
  {
    id: 'test-user-finance',
    email: 'test.finance@example.com',
    name: 'Ольга Новикова',
    role: 'user',
    status: 'active',
    cityId: 6,
    birthDate: new Date('1988-08-15T00:00:00.000Z'),
    gender: 'female',
    bio: 'Финансовый консультант. Объясняет домашний бюджет, подушку безопасности и простые правила контроля расходов без сложных таблиц.',
    avatarUrl: avatarUrl(44)
  },
  {
    id: 'test-user-video',
    email: 'test.video@example.com',
    name: 'Павел Лебедев',
    role: 'user',
    status: 'active',
    cityId: 7,
    birthDate: new Date('1993-10-06T00:00:00.000Z'),
    gender: 'male',
    bio: 'Видеомонтажёр коротких роликов. Учит собирать динамичный монтаж, чистить звук и готовить видео для соцсетей.',
    avatarUrl: avatarUrl(14)
  },
  {
    id: 'test-user-coaching',
    email: 'test.coaching@example.com',
    name: 'Ксения Ильина',
    role: 'user',
    status: 'inactive',
    cityId: 9,
    birthDate: new Date('1995-06-12T00:00:00.000Z'),
    gender: 'female',
    bio: 'Коуч по личным целям и привычкам. Помогает формулировать реалистичные шаги, отслеживать прогресс и не бросать начатое.',
    avatarUrl: avatarUrl(19)
  },
  {
    id: 'test-user-cooking',
    email: 'test.cooking@example.com',
    name: 'Сергей Фёдоров',
    role: 'user',
    status: 'active',
    cityId: 10,
    birthDate: new Date('1985-02-25T00:00:00.000Z'),
    gender: 'male',
    bio: 'Домашний повар и организатор семейного меню. Учит готовить простые ужины, делать заготовки и не тратить лишнее.',
    avatarUrl: avatarUrl(61)
  },
  {
    id: 'test-user-business-language',
    email: 'test.business.language@example.com',
    name: 'Виктория Лебедева',
    role: 'user',
    status: 'active',
    cityId: 1,
    birthDate: new Date('1990-02-11T00:00:00.000Z'),
    gender: 'female',
    bio:
      'Преподаватель делового английского и методист корпоративного обучения. Помогает специалистам увереннее проводить встречи, ' +
      'писать рабочие письма и готовить презентации для роста в профессии.',
    avatarUrl: avatarUrl(49)
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

const testUserSkills = [
  {
    id: 'test-skill-illustration-teach',
    userId: 'test-user-illustration',
    type: 'teach',
    title: 'Иллюстрация для портфолио',
    description:
      'Помогу выбрать тему серии, собрать референсы, сделать понятные эскизы и подготовить работу для Behance или соцсетей.',
    categoryId: 2,
    subcategoryId: 21,
    imageUrls: skillImageUrls('skillswap-illustration')
  },
  {
    id: 'test-skill-teamlead-teach',
    userId: 'test-user-teamlead',
    type: 'teach',
    title: 'Управление командой без хаоса',
    description:
      'Разберём роли, регулярные встречи, постановку задач и простую систему обратной связи для маленькой команды.',
    categoryId: 1,
    subcategoryId: 11,
    imageUrls: skillImageUrls('skillswap-teamlead')
  },
  {
    id: 'test-skill-photo-teach',
    userId: 'test-user-photo',
    type: 'teach',
    title: 'Портретная фотография на телефон',
    description:
      'Научу находить хороший свет, подбирать фон, работать с позой и быстро обрабатывать снимки без сложной техники.',
    categoryId: 2,
    subcategoryId: 22,
    imageUrls: skillImageUrls('skillswap-photo')
  },
  {
    id: 'test-skill-marketing-teach',
    userId: 'test-user-marketing',
    type: 'teach',
    title: 'Маркетинг для маленького проекта',
    description:
      'Помогу сформулировать ценность продукта, описать аудиторию и выбрать первые рекламные гипотезы без лишнего бюджета.',
    categoryId: 1,
    subcategoryId: 12,
    imageUrls: skillImageUrls('skillswap-marketing')
  },
  {
    id: 'test-skill-yoga-teach',
    userId: 'test-user-yoga',
    type: 'teach',
    title: 'Йога для спины и спокойного сна',
    description:
      'Покажу мягкие комплексы на 15-20 минут, которые можно выполнять дома после работы или перед сном.',
    categoryId: 6,
    subcategoryId: 61,
    imageUrls: skillImageUrls('skillswap-yoga')
  },
  {
    id: 'test-skill-english-teach',
    userId: 'test-user-english',
    type: 'teach',
    title: 'Разговорный английский для созвонов',
    description:
      'Потренируем small talk, объяснение задач, уточняющие вопросы и уверенное участие в рабочих встречах.',
    categoryId: 3,
    subcategoryId: 31,
    imageUrls: skillImageUrls('skillswap-english')
  },
  {
    id: 'test-skill-finance-teach',
    userId: 'test-user-finance',
    type: 'teach',
    title: 'Домашние финансы без стресса',
    description:
      'Разберём доходы, обязательные расходы, накопления и простую систему контроля бюджета на месяц.',
    categoryId: 5,
    subcategoryId: 52,
    imageUrls: skillImageUrls('skillswap-finance')
  },
  {
    id: 'test-skill-video-teach',
    userId: 'test-user-video',
    type: 'teach',
    title: 'Монтаж коротких видео',
    description:
      'Научу выстраивать структуру ролика, резать лишнее, работать с музыкой и готовить видео для публикации.',
    categoryId: 2,
    subcategoryId: 23,
    imageUrls: skillImageUrls('skillswap-video')
  },
  {
    id: 'test-skill-coaching-teach',
    userId: 'test-user-coaching',
    type: 'teach',
    title: 'Постановка личных целей',
    description:
      'Помогу превратить размытое желание в понятный план: цель, ограничения, ближайший шаг и регулярная проверка прогресса.',
    categoryId: 4,
    subcategoryId: 46,
    imageUrls: skillImageUrls('skillswap-coaching')
  },
  {
    id: 'test-skill-cooking-teach',
    userId: 'test-user-cooking',
    type: 'teach',
    title: 'Домашние ужины на неделю',
    description:
      'Покажу, как составить меню, закупить продукты и сделать заготовки, чтобы готовить быстрее и спокойнее.',
    categoryId: 5,
    subcategoryId: 53,
    imageUrls: skillImageUrls('skillswap-cooking')
  },
  {
    id: 'test-skill-business-language-teach',
    userId: 'test-user-business-language',
    type: 'teach',
    title: 'Деловой английский для повышения квалификации',
    description:
      'Помогу подтянуть английский для рабочих встреч, презентаций, переписки и собеседований. Фокус на профессиональной лексике, ' +
      'структуре аргументов и уверенной коммуникации без зубрёжки.',
    categoryId: 3,
    subcategoryId: 31,
    imageUrls: skillImageUrls('skillswap-business-language')
  },
  {
    id: 'test-skill-business-language-teach-2',
    userId: 'test-user-business-language',
    type: 'teach',
    title: 'Письма и презентации на английском',
    description:
      'Разбираем деловые письма, follow-up после встреч, короткие презентации и ответы на вопросы. После занятия остаётся набор шаблонов ' +
      'и персональный список фраз для вашей роли.',
    categoryId: 3,
    subcategoryId: 31,
    imageUrls: skillImageUrls('skillswap-business-presentations')
  },
  {
    id: 'test-skill-business-language-learn-data',
    userId: 'test-user-business-language',
    type: 'learn',
    title: 'Аналитика данных для обучения сотрудников',
    description:
      'Хочу лучше работать с метриками обучения: считать прогресс групп, читать отчёты и строить простые дашборды по результатам курсов.',
    categoryId: 1,
    subcategoryId: 17,
    imageUrls: skillImageUrls('skillswap-learning-analytics')
  },
  {
    id: 'test-skill-business-language-learn-design',
    userId: 'test-user-business-language',
    type: 'learn',
    title: 'Дизайн учебных материалов',
    description:
      'Ищу практику по визуальной структуре методичек, чек-листов и рабочих тетрадей, чтобы делать корпоративные материалы понятнее.',
    categoryId: 2,
    subcategoryId: 21,
    imageUrls: skillImageUrls('skillswap-learning-design')
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

const businessLanguageMaterials = [
  {
    id: 'test-material-language-theory',
    userSkillId: 'test-skill-business-language-teach',
    type: 'theory',
    title: 'Структура делового письма',
    description:
      'Короткая теория перед практикой: как писать понятные письма коллегам и клиентам.',
    content:
      'Деловое письмо строится вокруг одной цели: что должен понять или сделать адресат. Начните с контекста, затем сформулируйте просьбу ' +
      'или решение, добавьте дедлайн и завершите письмом с понятным следующим шагом. Избегайте длинных вступлений и переводите сложные мысли ' +
      'в короткие фразы.',
    attachments: textAttachment(
      'test-attachment-language-email-template',
      'Шаблон делового письма.txt',
      'Тема: коротко о цели письма\n1. Контекст: почему пишем.\n2. Основная просьба или решение.\n3. Дедлайн и следующий шаг.\n4. Вежливое завершение.'
    ),
    position: 0
  },
  {
    id: 'test-material-language-practice',
    userSkillId: 'test-skill-business-language-teach',
    type: 'practice',
    title: 'Практика: подготовьте follow-up после встречи',
    description: 'Задание для закрепления деловой лексики и структуры письма.',
    content:
      'Представьте, что вы провели встречу по запуску внутреннего курса. Напишите follow-up на английском: поблагодарите участников, ' +
      'зафиксируйте три решения, назначьте ответственных и попросите подтвердить сроки. Объём: 120-160 слов.',
    attachments: textAttachment(
      'test-attachment-language-follow-up-checklist',
      'Чек-лист follow-up письма.txt',
      'Проверьте письмо:\n- есть цель письма;\n- решения перечислены списком;\n- у каждой задачи есть ответственный;\n- указан срок;\n- тон вежливый и профессиональный.'
    ),
    position: 1
  },
  {
    id: 'test-material-language-testing',
    userSkillId: 'test-skill-business-language-teach',
    type: 'testing',
    title: 'Тест: деловая коммуникация на английском',
    description:
      'Проверка понимания структуры письма, follow-up и фраз для рабочих встреч.',
    content: 'Ответьте на вопросы после изучения теории и выполнения практики.',
    attachments: '[]',
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

const businessLanguageQuestions = [
  {
    id: 'test-question-language-single',
    materialId: 'test-material-language-testing',
    type: 'single',
    text: 'Что лучше всего поставить в начало делового письма?',
    position: 0
  },
  {
    id: 'test-question-language-multiple',
    materialId: 'test-material-language-testing',
    type: 'multiple',
    text: 'Какие элементы стоит включить в follow-up после рабочей встречи?',
    position: 1
  },
  {
    id: 'test-question-language-text',
    materialId: 'test-material-language-testing',
    type: 'text',
    text: 'Напишите короткую фразу, которой можно вежливо попросить коллегу подтвердить срок.',
    position: 2
  },
  {
    id: 'test-question-language-gap',
    materialId: 'test-material-language-testing',
    type: 'gap',
    text: 'Вставьте пропущенное слово: Please confirm the deadline by ____.',
    position: 3
  },
  {
    id: 'test-question-language-image',
    materialId: 'test-material-language-testing',
    type: 'image',
    text: 'Загрузите фото или скриншот черновика вашего follow-up письма.',
    position: 4
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

const businessLanguageAnswerOptions = [
  {
    id: 'test-option-language-single-a',
    questionId: 'test-question-language-single',
    text: 'Короткий контекст и цель письма.',
    isCorrect: true,
    position: 0
  },
  {
    id: 'test-option-language-single-b',
    questionId: 'test-question-language-single',
    text: 'Подробную биографию автора письма.',
    isCorrect: false,
    position: 1
  },
  {
    id: 'test-option-language-single-c',
    questionId: 'test-question-language-single',
    text: 'Список всех прошлых обсуждений без вывода.',
    isCorrect: false,
    position: 2
  },
  {
    id: 'test-option-language-multiple-a',
    questionId: 'test-question-language-multiple',
    text: 'Принятые решения.',
    isCorrect: true,
    position: 0
  },
  {
    id: 'test-option-language-multiple-b',
    questionId: 'test-question-language-multiple',
    text: 'Ответственных и сроки.',
    isCorrect: true,
    position: 1
  },
  {
    id: 'test-option-language-multiple-c',
    questionId: 'test-question-language-multiple',
    text: 'Следующий шаг или просьбу подтвердить договорённости.',
    isCorrect: true,
    position: 2
  },
  {
    id: 'test-option-language-multiple-d',
    questionId: 'test-question-language-multiple',
    text: 'Случайные детали, не связанные с темой встречи.',
    isCorrect: false,
    position: 3
  },
  {
    id: 'test-option-language-text-a',
    questionId: 'test-question-language-text',
    text: 'Could you please confirm the deadline?',
    isCorrect: true,
    position: 0
  },
  {
    id: 'test-option-language-text-b',
    questionId: 'test-question-language-text',
    text: 'Please confirm the deadline.',
    isCorrect: true,
    position: 1
  },
  {
    id: 'test-option-language-gap-a',
    questionId: 'test-question-language-gap',
    text: 'Friday',
    isCorrect: true,
    position: 0
  }
];

const businessLanguageReviewRequests = [
  {
    id: 'test-request-language-review-1',
    userSkillId: 'test-skill-business-language-teach',
    skillTitle: 'Деловой английский для повышения квалификации',
    skillType: 'teach',
    skillSubcategoryId: 31,
    skillCategoryId: 3,
    status: 'accepted',
    fromUserId: 'demo-student',
    toUserId: 'test-user-business-language',
    createdAt: new Date('2026-03-10T09:00:00.000Z'),
    updatedAt: new Date('2026-03-10T09:30:00.000Z')
  },
  {
    id: 'test-request-language-review-2',
    userSkillId: 'test-skill-business-language-teach',
    skillTitle: 'Деловой английский для повышения квалификации',
    skillType: 'teach',
    skillSubcategoryId: 31,
    skillCategoryId: 3,
    status: 'accepted',
    fromUserId: 'test-user-teamlead',
    toUserId: 'test-user-business-language',
    createdAt: new Date('2026-04-02T15:00:00.000Z'),
    updatedAt: new Date('2026-04-02T15:20:00.000Z')
  },
  {
    id: 'test-request-language-review-3',
    userSkillId: 'test-skill-business-language-teach-2',
    skillTitle: 'Письма и презентации на английском',
    skillType: 'teach',
    skillSubcategoryId: 31,
    skillCategoryId: 3,
    status: 'accepted',
    fromUserId: 'test-user-marketing',
    toUserId: 'test-user-business-language',
    createdAt: new Date('2026-04-18T11:00:00.000Z'),
    updatedAt: new Date('2026-04-18T11:40:00.000Z')
  }
];

const businessLanguageReviewExchanges = [
  {
    id: 'test-exchange-language-review-1',
    requestId: 'test-request-language-review-1',
    initiatorId: 'demo-student',
    recipientId: 'test-user-business-language',
    status: 'completed',
    confirmedAt: new Date('2026-03-10T09:30:00.000Z'),
    completedAt: new Date('2026-03-12T18:00:00.000Z')
  },
  {
    id: 'test-exchange-language-review-2',
    requestId: 'test-request-language-review-2',
    initiatorId: 'test-user-teamlead',
    recipientId: 'test-user-business-language',
    status: 'completed',
    confirmedAt: new Date('2026-04-02T15:20:00.000Z'),
    completedAt: new Date('2026-04-04T17:30:00.000Z')
  },
  {
    id: 'test-exchange-language-review-3',
    requestId: 'test-request-language-review-3',
    initiatorId: 'test-user-marketing',
    recipientId: 'test-user-business-language',
    status: 'completed',
    confirmedAt: new Date('2026-04-18T11:40:00.000Z'),
    completedAt: new Date('2026-04-20T16:10:00.000Z')
  }
];

const businessLanguageExchangeMessages = [
  {
    id: 'test-message-language-1-a',
    exchangeId: 'test-exchange-language-review-1',
    senderId: 'demo-student',
    content:
      'Хочу подготовиться к встрече с иностранной командой и звучать увереннее.',
    createdAt: new Date('2026-03-10T10:00:00.000Z')
  },
  {
    id: 'test-message-language-1-b',
    exchangeId: 'test-exchange-language-review-1',
    senderId: 'test-user-business-language',
    content:
      'Начнём с структуры короткого выступления и набора фраз для уточняющих вопросов.',
    createdAt: new Date('2026-03-10T10:08:00.000Z')
  },
  {
    id: 'test-message-language-2-a',
    exchangeId: 'test-exchange-language-review-2',
    senderId: 'test-user-teamlead',
    content: 'Нужно прокачать follow-up письма после синков с заказчиком.',
    createdAt: new Date('2026-04-02T16:00:00.000Z')
  },
  {
    id: 'test-message-language-2-b',
    exchangeId: 'test-exchange-language-review-2',
    senderId: 'test-user-business-language',
    content:
      'Разберём ваши реальные письма, уберём лишнее и соберём шаблон для команды.',
    createdAt: new Date('2026-04-02T16:12:00.000Z')
  },
  {
    id: 'test-message-language-3-a',
    exchangeId: 'test-exchange-language-review-3',
    senderId: 'test-user-marketing',
    content: 'Хочу лучше презентовать маркетинговые гипотезы на английском.',
    createdAt: new Date('2026-04-18T12:00:00.000Z')
  },
  {
    id: 'test-message-language-3-b',
    exchangeId: 'test-exchange-language-review-3',
    senderId: 'test-user-business-language',
    content:
      'Сделаем структуру на 5 слайдов и потренируем ответы на возражения.',
    createdAt: new Date('2026-04-18T12:14:00.000Z')
  }
];

const businessLanguageRatings = [
  {
    id: 'test-rating-language-review-1',
    exchangeId: 'test-exchange-language-review-1',
    raterId: 'demo-student',
    ratedUserId: 'test-user-business-language',
    score: 5,
    comment:
      'Виктория очень понятно разобрала структуру выступления. После занятия я смог спокойно провести короткую презентацию на английском.',
    createdAt: new Date('2026-03-12T18:15:00.000Z'),
    updatedAt: new Date('2026-03-12T18:15:00.000Z')
  },
  {
    id: 'test-rating-language-review-2',
    exchangeId: 'test-exchange-language-review-2',
    raterId: 'test-user-teamlead',
    ratedUserId: 'test-user-business-language',
    score: 5,
    comment:
      'Получил рабочий шаблон follow-up писем и список фраз для команды. Очень прикладной формат без лишней теории.',
    createdAt: new Date('2026-04-04T17:50:00.000Z'),
    updatedAt: new Date('2026-04-04T17:50:00.000Z')
  },
  {
    id: 'test-rating-language-review-3',
    exchangeId: 'test-exchange-language-review-3',
    raterId: 'test-user-marketing',
    ratedUserId: 'test-user-business-language',
    score: 4,
    comment:
      'Хорошо прокачали презентацию и ответы на вопросы. Особенно помогли формулировки для защиты гипотез.',
    createdAt: new Date('2026-04-20T16:25:00.000Z'),
    updatedAt: new Date('2026-04-20T16:25:00.000Z')
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

  for (const user of [...demoUsers, ...testUsers]) {
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
  for (const skill of [...demoUserSkills, ...testUserSkills]) {
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
  for (const material of [...demoMaterials, ...businessLanguageMaterials]) {
    const attachments = getMaterialAttachments(material);

    await prisma.userSkillMaterial.upsert({
      where: { id: material.id },
      update: {
        userSkillId: material.userSkillId,
        type: material.type,
        title: material.title,
        description: material.description,
        content: material.content,
        attachments,
        position: material.position
      },
      create: {
        ...material,
        attachments
      }
    });
  }
};

const seedDemoQuestions = async () => {
  for (const question of [...demoQuestions, ...businessLanguageQuestions]) {
    const type = getQuestionType(question);

    await prisma.materialQuestion.upsert({
      where: { id: question.id },
      update: {
        materialId: question.materialId,
        type,
        text: question.text,
        position: question.position
      },
      create: {
        ...question,
        type
      }
    });
  }
};

const seedDemoAnswerOptions = async () => {
  for (const option of [
    ...demoAnswerOptions,
    ...businessLanguageAnswerOptions
  ]) {
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

const seedBusinessLanguageReviewRequests = async () => {
  for (const request of businessLanguageReviewRequests) {
    await prisma.request.upsert({
      where: { id: request.id },
      update: {
        userSkillId: request.userSkillId,
        skillTitle: request.skillTitle,
        skillType: request.skillType,
        skillSubcategoryId: request.skillSubcategoryId,
        skillCategoryId: request.skillCategoryId,
        status: request.status,
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        createdAt: request.createdAt
      },
      create: request
    });
  }
};

const seedBusinessLanguageReviewExchanges = async () => {
  for (const exchange of businessLanguageReviewExchanges) {
    await prisma.exchange.upsert({
      where: { id: exchange.id },
      update: {
        requestId: exchange.requestId,
        initiatorId: exchange.initiatorId,
        recipientId: exchange.recipientId,
        status: exchange.status,
        confirmedAt: exchange.confirmedAt,
        completedAt: exchange.completedAt
      },
      create: exchange
    });
  }
};

const seedBusinessLanguageExchangeMessages = async () => {
  for (const message of businessLanguageExchangeMessages) {
    await prisma.exchangeMessage.upsert({
      where: { id: message.id },
      update: {
        exchangeId: message.exchangeId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt
      },
      create: message
    });
  }
};

const seedBusinessLanguageRatings = async () => {
  for (const rating of businessLanguageRatings) {
    await prisma.exchangeRating.upsert({
      where: { id: rating.id },
      update: {
        exchangeId: rating.exchangeId,
        raterId: rating.raterId,
        ratedUserId: rating.ratedUserId,
        score: rating.score,
        comment: rating.comment,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt
      },
      create: rating
    });
  }
};

const seedDemoData = async () => {
  await seedDemoUsers();
  await seedDemoUserSkills();
  await seedDemoMaterials();
  await seedDemoQuestions();
  await seedDemoAnswerOptions();
  await seedBusinessLanguageReviewRequests();
  await seedBusinessLanguageReviewExchanges();
  await seedBusinessLanguageExchangeMessages();
  await seedBusinessLanguageRatings();
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
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
