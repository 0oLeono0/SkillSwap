export const APP_NAME = 'SkillSwap';

export const SkillCategories = {
  HEALTH: 'Здоровье и лайфстайл',
  HOME: 'Дом и уют',
  EDUCATION: 'Образование и развитие',
  LANGUAGES: 'Иностранные языки',
  ART: 'Творчество и искусство',
  BUSINESS: 'Бизнес и карьера',
} as const;

export type SkillCategory = typeof SkillCategories[keyof typeof SkillCategories];
