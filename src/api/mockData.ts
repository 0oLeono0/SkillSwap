import type { ApiMockData } from './types';

export const db: ApiMockData = {
  users: [
    {
      id: 1,
      email: 'user1@example.com',
      password: 'password1',
      avatarUrl:
        'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww',
      name: 'Иван',
      city: 'Москва',
      birthDate: '1990-05-15',
      gender: 'Мужской',
      bio: 'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
      teachableSkills: [31],
      learningSkills: [16, 61, 67]
    },
    {
      id: 2,
      email: 'user2@example.com',
      password: 'password2',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Алёна',
      city: 'Санкт-Петербург',
      birthDate: '1996-08-22',
      gender: 'Женский',
      bio: 'Графический дизайнер и фанат акварели. Мечтаю научиться управлять своим временем и найти баланс.',
      teachableSkills: [21],
      learningSkills: [16, 67]
    },
    {
      id: 3,
      email: 'user3@example.com',
      password: 'password3',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Максим',
      city: 'Новосибирск',
      birthDate: '1983-03-10',
      gender: 'Мужской',
      bio: 'ПМ в IT. Готов научить вас управлять проектами, а сам хочу подтянуть английский для работы с зарубежными клиентами.',
      teachableSkills: [17],
      learningSkills: [31, 37]
    },
    {
      id: 4,
      email: 'user4@example.com',
      password: 'password4',
      avatarUrl:
        'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Анна',
      city: 'Казань',
      birthDate: '1992-11-05',
      gender: 'Женский',
      bio: 'Шеф-повар. Научу вас готовить невероятные блюда из простых продуктов. Хочу разобраться в домашних финансах.',
      teachableSkills: [53],
      learningSkills: [52, 51]
    },
    {
      id: 5,
      email: 'user5@example.com',
      password: 'password5',
      avatarUrl:
        'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Дмитрий',
      city: 'Екатеринбург',
      birthDate: '1995-07-18',
      gender: 'Мужской',
      bio: 'Инструктор по йоге. Помогу найти гармонию. Мечтаю выучить японский для путешествий.',
      teachableSkills: [61],
      learningSkills: [36]
    },
    {
      id: 6,
      email: 'user6@example.com',
      password: 'password6',
      avatarUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Светлана',
      city: 'Нижний Новгород',
      birthDate: '1979-01-30',
      gender: 'Женский',
      bio: 'Лайф-коуч. Помогаю ставить и достигать цели. Хочу освоить арт-терапию для новых методик в работе.',
      teachableSkills: [46],
      learningSkills: [27, 21]
    },
    {
      id: 7,
      email: 'user7@example.com',
      password: 'password7',
      avatarUrl:
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Игорь',
      city: 'Калининград',
      birthDate: '1986-09-12',
      gender: 'Мужской',
      bio: 'Предприниматель. Поделюсь опытом запуска стартапов. Ищу ментора по ментальному здоровью для борьбы со стрессом.',
      teachableSkills: [18],
      learningSkills: [63, 66]
    },
    {
      id: 8,
      email: 'user8@example.com',
      password: 'password8',
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Ольга',
      city: 'Ростов-на-Дону',
      birthDate: '1998-04-25',
      gender: 'Женский',
      bio: 'Музыкант и преподаватель вокала. Научу вас основам музыки. Хочу научиться создавать уют в доме с помощью растений.',
      teachableSkills: [24],
      learningSkills: [54, 28]
    },
    {
      id: 9,
      email: 'user9@example.com',
      password: 'password9',
      avatarUrl:
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Сергей',
      city: 'Челябинск',
      birthDate: '1974-12-08',
      gender: 'Мужской',
      bio: 'На все руки мастер. Могу починить всё в вашем доме. Хочу освоить современные методы продаж для своего маленького бизнеса.',
      teachableSkills: [55],
      learningSkills: [13, 12]
    },
    {
      id: 10,
      email: 'user10@example.com',
      password: 'password10',
      avatarUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Марина',
      city: 'Уфа',
      birthDate: '1993-06-14',
      gender: 'Женский',
      bio: 'Преподаватель испанского. Заряжаюсь энергией от общения. В поисках вдохновения для креативного письма.',
      teachableSkills: [33],
      learningSkills: [26, 23]
    },
    {
      id: 11,
      email: 'user11@example.com',
      password: 'password11',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Алексей',
      city: 'Красноярск',
      birthDate: '1989-02-19',
      gender: 'Мужской',
      bio: 'Сейлз-менеджер. Помогу вам прокачать навыки переговоров. Сам учу французский для переезда.',
      teachableSkills: [13],
      learningSkills: [32, 35]
    },
    {
      id: 12,
      email: 'user12@example.com',
      password: 'password12',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Татьяна',
      city: 'Воронеж',
      birthDate: '1984-10-03',
      gender: 'Женский',
      bio: 'Фотограф-портретист. Улавливаю лучшие черты людей. Хочу научиться видеомонтажу для создания динамичных историй.',
      teachableSkills: [22],
      learningSkills: [23, 24]
    },
    {
      id: 13,
      email: 'user13@example.com',
      password: 'password13',
      avatarUrl:
        'https://images.unsplash.com/photo-1506919258185-6078bba55d2a?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Павел',
      city: 'Самара',
      birthDate: '2004-07-27',
      gender: 'Мужской',
      bio: 'Студент. Отлично владею техниками быстрого обучения. Могу научить скорочтению. Сам мечтаю подтянуть китайский.',
      teachableSkills: [44],
      learningSkills: [35, 36]
    },
    {
      id: 14,
      email: 'user14@example.com',
      password: 'password14',
      avatarUrl:
        'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Екатерина',
      city: 'Пермь',
      birthDate: '1997-03-16',
      gender: 'Женский',
      bio: 'Дизайнер интерьеров. Создаю красивые и функциональные пространства. Хочу освоить DIY, чтобы делать мебель своими руками.',
      teachableSkills: [28],
      learningSkills: [55]
    },
    {
      id: 15,
      email: 'user15@example.com',
      password: 'password15',
      avatarUrl:
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Виктор',
      city: 'Волгоград',
      birthDate: '1982-11-21',
      gender: 'Мужской',
      bio: 'Переводчик-германист. Свободно говорю по-немецки. Ищу тренера для физической активности, чтобы компенсировать сидячую работу.',
      teachableSkills: [34],
      learningSkills: [65, 62]
    },
    {
      id: 16,
      email: 'user16@example.com',
      password: 'password16',
      avatarUrl:
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Лариса',
      city: 'Москва',
      birthDate: '1969-08-09',
      gender: 'Женский',
      bio: 'Учитель с большим стажем. Помогу вам научиться эффективно преподавать. Осваиваю осознанность и медитацию.',
      teachableSkills: [45],
      learningSkills: [64, 61]
    },
    {
      id: 17,
      email: 'user17@example.com',
      password: 'password17',
      avatarUrl:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Роман',
      city: 'Санкт-Петербург',
      birthDate: '1991-12-14',
      gender: 'Мужской',
      bio: 'Маркетолог. Знаю, как продвигать личный бренд. Хочу научиться актерскому мастерству для уверенных выступлений на сцене.',
      teachableSkills: [14],
      learningSkills: [25, 26]
    },
    {
      id: 18,
      email: 'user18@example.com',
      password: 'password18',
      avatarUrl:
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Анастасия',
      city: 'Новосибирск',
      birthDate: '1994-05-02',
      gender: 'Женский',
      bio: 'Профессиональный организатор пространства. Наведу порядок в вашем доме и голове. Учусь готовить здоровую и вкусную еду.',
      teachableSkills: [51],
      learningSkills: [62, 53]
    },
    {
      id: 19,
      email: 'user19@example.com',
      password: 'password19',
      avatarUrl:
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Артур',
      city: 'Екатеринбург',
      birthDate: '1999-09-30',
      gender: 'Мужской',
      bio: 'Актер театра. Провожу тренинги по сценической речи и движению. Хочу разобраться в когнитивных техниках для лучшего запоминания текстов.',
      teachableSkills: [25],
      learningSkills: [43, 44]
    },
    {
      id: 20,
      email: 'user20@example.com',
      password: 'password20',
      avatarUrl:
        'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?ixlib=rb-4.1.0&auto=format&fit=crop&w=500&q=60',
      name: 'Ирина',
      city: 'Казань',
      birthDate: '1987-04-17',
      gender: 'Женский',
      bio: 'HR-специалист. Помогу с составлением резюме и подготовкой к собеседованию. Ищу пути для достижения идеального work-life balance.',
      teachableSkills: [15],
      learningSkills: [67, 63]
    }
  ],
  skills: [
    {
      id: 1,
      name: 'Бизнес и карьера',
      subskills: [
        {
          id: 11,
          name: 'Управление командой'
        },
        {
          id: 12,
          name: 'Маркетинг и реклама'
        },
        {
          id: 13,
          name: 'Продажи и переговоры'
        },
        {
          id: 14,
          name: 'Личный бренд'
        },
        {
          id: 15,
          name: 'Резюме и собеседование'
        },
        {
          id: 16,
          name: 'Тайм-менеджмент'
        },
        {
          id: 17,
          name: 'Проектное управление'
        },
        {
          id: 18,
          name: 'Предпринимательство'
        }
      ]
    },
    {
      id: 2,
      name: 'Творчество и искусство',
      subskills: [
        {
          id: 21,
          name: 'Рисование и иллюстрация'
        },
        {
          id: 22,
          name: 'Фотография'
        },
        {
          id: 23,
          name: 'Видеомонтаж'
        },
        {
          id: 24,
          name: 'Музыка и звук'
        },
        {
          id: 25,
          name: 'Актёрское мастерство'
        },
        {
          id: 26,
          name: 'Креативное письмо'
        },
        {
          id: 27,
          name: 'Арт-терапия'
        },
        {
          id: 28,
          name: 'Декор и DIY'
        }
      ]
    },
    {
      id: 3,
      name: 'Иностранные языки',
      subskills: [
        {
          id: 31,
          name: 'Английский'
        },
        {
          id: 32,
          name: 'Французский'
        },
        {
          id: 33,
          name: 'Испанский'
        },
        {
          id: 34,
          name: 'Немецкий'
        },
        {
          id: 35,
          name: 'Китайский'
        },
        {
          id: 36,
          name: 'Японский'
        },
        {
          id: 37,
          name: 'Подготовка к экзаменам (IELTS, TOEFL)'
        }
      ]
    },
    {
      id: 4,
      name: 'Образование и развитие',
      subskills: [
        {
          id: 41,
          name: 'Личностное развитие'
        },
        {
          id: 42,
          name: 'Навыки обучения'
        },
        {
          id: 43,
          name: 'Когнитивные техники'
        },
        {
          id: 44,
          name: 'Скорочтение'
        },
        {
          id: 45,
          name: 'Навыки преподавания'
        },
        {
          id: 46,
          name: 'Коучинг'
        }
      ]
    },
    {
      id: 5,
      name: 'Дом и уют',
      subskills: [
        {
          id: 51,
          name: 'Уборка и организация'
        },
        {
          id: 52,
          name: 'Домашние финансы'
        },
        {
          id: 53,
          name: 'Приготовление еды'
        },
        {
          id: 54,
          name: 'Домашние растения'
        },
        {
          id: 55,
          name: 'Ремонт'
        },
        {
          id: 56,
          name: 'Хранение вещей'
        }
      ]
    },
    {
      id: 6,
      name: 'Здоровье и лайфстайл',
      subskills: [
        {
          id: 61,
          name: 'Йога и медитация'
        },
        {
          id: 62,
          name: 'Питание и ЗОЖ'
        },
        {
          id: 63,
          name: 'Ментальное здоровье'
        },
        {
          id: 64,
          name: 'Осознанность'
        },
        {
          id: 65,
          name: 'Физические тренировки'
        },
        {
          id: 66,
          name: 'Сон и восстановление'
        },
        {
          id: 67,
          name: 'Баланс жизни и работы'
        }
      ]
    }
  ],
  cities: [
    {
      id: 1,
      name: 'Москва'
    },
    {
      id: 2,
      name: 'Санкт-Петербург'
    },
    {
      id: 3,
      name: 'Новосибирск'
    },
    {
      id: 4,
      name: 'Екатеринбург'
    },
    {
      id: 5,
      name: 'Казань'
    },
    {
      id: 6,
      name: 'Нижний Новгород'
    },
    {
      id: 7,
      name: 'Челябинск'
    },
    {
      id: 8,
      name: 'Самара'
    },
    {
      id: 9,
      name: 'Калининград'
    },
    {
      id: 10,
      name: 'Ростов-на-Дону'
    },
    {
      id: 11,
      name: 'Уфа'
    },
    {
      id: 12,
      name: 'Красноярск'
    },
    {
      id: 13,
      name: 'Воронеж'
    },
    {
      id: 14,
      name: 'Пермь'
    },
    {
      id: 15,
      name: 'Волгоград'
    }
  ]
};
