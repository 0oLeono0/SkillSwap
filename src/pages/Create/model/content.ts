import type { CreateSkillFormErrors } from './form';

type TouchedField = keyof CreateSkillFormErrors;

export const CREATE_SKILL_COPY = {
  pageTitle: 'Создать навык',
  guestSubtitle: 'Авторизуйтесь, чтобы опубликовать новый навык.',
  guestLoginButton: 'Войти',
  formSubtitle:
    'Заполните карточку навыка. После сохранения она сразу станет доступна в каталоге.',
  cancelButton: 'Отмена',
  submitButton: 'Создать навык',
  submittingButton: 'Сохраняем...',
  baseDataLoadError: 'Не удалось загрузить категории и подкатегории.',
  baseDataRetry: 'Повторить загрузку',
  baseDataRetryLoading: 'Обновляем...',
  titleLabel: 'Название навыка',
  titlePlaceholder: 'Например: Игра на гитаре',
  typeLabel: 'Тип навыка',
  typeTeachLabel: 'Учу',
  typeLearnLabel: 'Учусь',
  categoryLabel: 'Категория',
  categoryPlaceholder: 'Выберите категорию',
  categoryLoadingPlaceholder: 'Загрузка категорий...',
  subcategoryLabel: 'Подкатегория',
  subcategoryPlaceholder: 'Выберите подкатегорию',
  descriptionLabel: 'Описание',
  descriptionHint: 'Ctrl/⌘ + Enter — отправить',
  descriptionPlaceholder:
    'Коротко опишите, чему вы хотите научить или научиться',
  imageLabel: 'Изображение (JPEG/PNG, до 2 MB)',
  imagePreviewAlt: 'Превью навыка',
  tagsLabel: 'Теги',
  tagsExamplePlaceholder: 'Например: онлайн',
  tagsLimitPlaceholder: 'Достигнут лимит тегов',
  tagsAddButton: 'Добавить тег',
  errorSummaryTitle: 'Проверьте поля формы:'
} as const;

export const CREATE_SKILL_FIELD_LABELS: Record<TouchedField, string> = {
  title: CREATE_SKILL_COPY.titleLabel,
  description: CREATE_SKILL_COPY.descriptionLabel,
  type: CREATE_SKILL_COPY.typeLabel,
  categoryId: CREATE_SKILL_COPY.categoryLabel,
  subcategoryId: CREATE_SKILL_COPY.subcategoryLabel,
  imageFile: 'Изображение',
  tags: CREATE_SKILL_COPY.tagsLabel
};

export const getCreateSkillTagsLabel = (maxTags: number) =>
  `${CREATE_SKILL_COPY.tagsLabel} (до ${maxTags})`;

export const getCreateSkillRemoveTagLabel = (tag: string) =>
  `Удалить тег ${tag}`;
