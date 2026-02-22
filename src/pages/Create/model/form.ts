import type { UserSkill } from '@/entities/User/types';
import type { ApiUserSkill, UpdateProfilePayload } from '@/shared/api/auth';

export type CreateSkillType = 'teach' | 'learn';

export interface CreateSkillFormValues {
  title: string;
  description: string;
  type: CreateSkillType;
  categoryId: number | null;
  subcategoryId: number | null;
  imageFile: File | null;
  tags: string[];
}

export interface CreateSkillFormErrors {
  title?: string;
  description?: string;
  type?: string;
  categoryId?: string;
  subcategoryId?: string;
  imageFile?: string;
  tags?: string;
}

export const CREATE_SKILL_CONSTRAINTS = {
  titleMin: 3,
  titleMax: 50,
  descriptionMax: 500,
  maxTags: 5,
  maxImageSizeBytes: 2 * 1024 * 1024,
  allowedImageMimeTypes: new Set(['image/jpeg', 'image/png'])
} as const;

export const CREATE_SKILL_ERROR_MESSAGES = {
  descriptionRequired: 'Описание обязательно',
  typeRequired: 'Выберите тип навыка',
  categoryRequired: 'Выберите категорию',
  subcategoryRequired: 'Выберите подкатегорию',
  tagsEmpty: 'Теги не могут быть пустыми',
  tagsDuplicate: 'Теги не должны повторяться',
  imageRequired: 'Добавьте изображение навыка',
  imageTooLarge: 'Размер файла должен быть до 2 MB',
  imageInvalidType: 'Допустимы только JPEG и PNG',
  tagDraftRequired: 'Введите тег',
  tagDraftDuplicate: 'Такой тег уже добавлен',
  submitFallback: 'Не удалось создать навык. Попробуйте снова.'
} as const;

const isPositiveInteger = (value: number | null): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

export const isCreateSkillType = (value: string): value is CreateSkillType =>
  value === 'teach' || value === 'learn';

const normalizeWhitespace = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

const getTagKey = (value: string) => normalizeTag(value).toLocaleLowerCase();

export const validateCreateSkillForm = (
  values: CreateSkillFormValues
): CreateSkillFormErrors => {
  const errors: CreateSkillFormErrors = {};

  const normalizedTitle = values.title.trim();
  if (normalizedTitle.length < CREATE_SKILL_CONSTRAINTS.titleMin) {
    errors.title = `Минимум ${CREATE_SKILL_CONSTRAINTS.titleMin} символа`;
  } else if (normalizedTitle.length > CREATE_SKILL_CONSTRAINTS.titleMax) {
    errors.title = `Максимум ${CREATE_SKILL_CONSTRAINTS.titleMax} символов`;
  }

  const normalizedDescription = values.description.trim();
  if (normalizedDescription.length === 0) {
    errors.description = CREATE_SKILL_ERROR_MESSAGES.descriptionRequired;
  } else if (
    normalizedDescription.length > CREATE_SKILL_CONSTRAINTS.descriptionMax
  ) {
    errors.description = `Максимум ${CREATE_SKILL_CONSTRAINTS.descriptionMax} символов`;
  }

  if (!isCreateSkillType(values.type)) {
    errors.type = CREATE_SKILL_ERROR_MESSAGES.typeRequired;
  }

  if (!isPositiveInteger(values.categoryId)) {
    errors.categoryId = CREATE_SKILL_ERROR_MESSAGES.categoryRequired;
  }

  if (!isPositiveInteger(values.subcategoryId)) {
    errors.subcategoryId = CREATE_SKILL_ERROR_MESSAGES.subcategoryRequired;
  }

  const normalizedTags = values.tags.map(normalizeTag);
  if (normalizedTags.length > CREATE_SKILL_CONSTRAINTS.maxTags) {
    errors.tags = `Можно добавить не больше ${CREATE_SKILL_CONSTRAINTS.maxTags} тегов`;
  } else if (normalizedTags.some((tag) => tag.length === 0)) {
    errors.tags = CREATE_SKILL_ERROR_MESSAGES.tagsEmpty;
  } else {
    const uniqueTagKeys = new Set(normalizedTags.map(getTagKey));
    if (uniqueTagKeys.size !== normalizedTags.length) {
      errors.tags = CREATE_SKILL_ERROR_MESSAGES.tagsDuplicate;
    }
  }

  if (!values.imageFile) {
    errors.imageFile = CREATE_SKILL_ERROR_MESSAGES.imageRequired;
  } else if (
    values.imageFile.size > CREATE_SKILL_CONSTRAINTS.maxImageSizeBytes
  ) {
    errors.imageFile = CREATE_SKILL_ERROR_MESSAGES.imageTooLarge;
  } else if (
    !CREATE_SKILL_CONSTRAINTS.allowedImageMimeTypes.has(values.imageFile.type)
  ) {
    errors.imageFile = CREATE_SKILL_ERROR_MESSAGES.imageInvalidType;
  }

  return errors;
};

export const isCreateSkillFormValid = (errors: CreateSkillFormErrors) =>
  Object.keys(errors).length === 0;

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read file as data URL'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const normalizeTag = (value: string) =>
  normalizeWhitespace(value).replace(/^#+/, '');

export const validateTagDraft = (tagInput: string, tags: string[]) => {
  const normalizedTag = normalizeTag(tagInput);
  if (!normalizedTag) {
    return CREATE_SKILL_ERROR_MESSAGES.tagDraftRequired;
  }

  if (tags.length >= CREATE_SKILL_CONSTRAINTS.maxTags) {
    return `Можно добавить не больше ${CREATE_SKILL_CONSTRAINTS.maxTags} тегов`;
  }

  const normalizedTagKey = getTagKey(normalizedTag);
  const hasDuplicate = tags.some((tag) => getTagKey(tag) === normalizedTagKey);
  if (hasDuplicate) {
    return CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate;
  }

  return null;
};

export const composeDescriptionWithTags = (
  description: string,
  tags: string[]
) => {
  const normalizedDescription = description.trim();
  const uniqueTags: string[] = [];
  const uniqueTagKeys = new Set<string>();

  tags.forEach((tag) => {
    const normalizedTag = normalizeTag(tag);
    if (!normalizedTag) {
      return;
    }

    const key = normalizedTag.toLocaleLowerCase();
    if (uniqueTagKeys.has(key)) {
      return;
    }

    uniqueTagKeys.add(key);
    uniqueTags.push(normalizedTag);
  });

  if (uniqueTags.length === 0) {
    return normalizedDescription;
  }

  const tagsBlock = uniqueTags.map((tag) => `#${tag}`).join(' ');
  return `${normalizedDescription}\n\n${tagsBlock}`;
};

export const parseSelectNumberValue = (value: string | string[]) => {
  const rawValue = typeof value === 'string' ? value : '';
  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

export const mapUserSkillToApi = (skill: UserSkill): ApiUserSkill => ({
  id: skill.id,
  title: skill.title,
  categoryId: skill.categoryId,
  subcategoryId: skill.subcategoryId,
  description: skill.description,
  imageUrls: skill.imageUrls
});

interface BuildUpdatedSkillListsParams {
  teachableSkills: UserSkill[] | undefined;
  learningSkills: UserSkill[] | undefined;
  newSkill: ApiUserSkill;
  type: CreateSkillType;
}

type UpdateSkillListsPayload = Pick<
  UpdateProfilePayload,
  'teachableSkills' | 'learningSkills'
>;

export const buildUpdatedSkillLists = ({
  teachableSkills: currentTeachableSkills,
  learningSkills: currentLearningSkills,
  newSkill,
  type
}: BuildUpdatedSkillListsParams): UpdateSkillListsPayload => {
  const teachableSkills = (currentTeachableSkills ?? []).map(mapUserSkillToApi);
  const learningSkills = (currentLearningSkills ?? []).map(mapUserSkillToApi);

  if (type === 'teach') {
    teachableSkills.push(newSkill);
  } else {
    learningSkills.push(newSkill);
  }

  return {
    teachableSkills,
    learningSkills
  };
};
