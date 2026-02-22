import type { AuthUser } from '@/app/providers/auth/context';
import type { SkillCategories } from '@/features/Filter/types';

export const CREATE_SKILL_TEST_VALUES = {
  categoryId: 1,
  categoryIdString: '1',
  subcategoryId: 11,
  subcategoryIdString: '11',
  secondSubcategoryId: 12,
  secondSubcategoryIdString: '12',
  title: 'New skill',
  updatedTitle: 'New skill!',
  description: 'Skill description',
  tag: 'React',
  duplicateTag: 'react',
  tagWithDelimiter: 'React,',
  maxTags: ['one', 'two', 'three', 'four', 'five'],
  existingSkillTitle: 'Existing Skill',
  existingSkillDescription: 'Already exists',
  apiSkillExistsError: 'Skill with this name already exists',
  apiTemporaryError: 'Temporary backend error',
  genericSubmitError: 'boom',
  retryError: 'retry failed',
  firstBlobUrl: 'blob:first',
  secondBlobUrl: 'blob:second'
} as const;

export const CREATE_SKILL_TEST_GROUPS: SkillCategories[] = [
  {
    id: CREATE_SKILL_TEST_VALUES.categoryId,
    name: 'IT',
    skills: [
      { id: CREATE_SKILL_TEST_VALUES.subcategoryId, name: 'React' },
      { id: CREATE_SKILL_TEST_VALUES.secondSubcategoryId, name: 'TypeScript' }
    ]
  }
];

export const createBaseCreateSkillTestUser = (): AuthUser => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'User',
  role: 'user',
  avatarUrl: null,
  cityId: null,
  birthDate: null,
  gender: null,
  bio: null,
  teachableSkills: [
    {
      id: 'skill-existing',
      title: CREATE_SKILL_TEST_VALUES.existingSkillTitle,
      categoryId: CREATE_SKILL_TEST_VALUES.categoryId,
      subcategoryId: CREATE_SKILL_TEST_VALUES.subcategoryId,
      description: CREATE_SKILL_TEST_VALUES.existingSkillDescription,
      imageUrls: []
    }
  ],
  learningSkills: []
});

export const createCreateSkillImageFile = () =>
  new File(['image'], 'skill.png', { type: 'image/png' });

export const createCustomCreateSkillImageFile = (
  name = 'skill.png',
  content = 'image'
) => new File([content], name, { type: 'image/png' });

export const createCreateSkillImageValidationFile = ({
  name,
  type,
  size = 1
}: {
  name: string;
  size?: number;
  type: string;
}) => new File([new Uint8Array(size)], name, { type });
