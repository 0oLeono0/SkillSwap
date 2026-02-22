import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';
import {
  ApiError,
  type UpdateProfilePayload,
  type ApiUserSkill
} from '@/shared/api/auth';
import type { SkillCategories } from '@/features/Filter/types';
import type { AuthUser } from '@/app/providers/auth/context';
import {
  CREATE_SKILL_CONSTRAINTS,
  CREATE_SKILL_ERROR_MESSAGES,
  buildUpdatedSkillLists,
  composeDescriptionWithTags,
  fileToDataUrl,
  isCreateSkillFormValid,
  isCreateSkillType,
  normalizeTag,
  parseSelectNumberValue,
  validateTagDraft,
  validateCreateSkillForm,
  type CreateSkillFormErrors,
  type CreateSkillType
} from './form';
import { CREATE_SKILL_FIELD_LABELS } from './content';

export type TouchedField = keyof CreateSkillFormErrors;

export interface VisibleFieldError {
  field: TouchedField;
  label: string;
  message: string;
}

interface UseCreateSkillFormParams {
  user: AuthUser | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  skillGroups: SkillCategories[];
  onCreated: () => void;
}

const touchedFieldNames: TouchedField[] = [
  'title',
  'description',
  'type',
  'categoryId',
  'subcategoryId',
  'imageFile',
  'tags'
];

export const createSkillA11yIds = {
  titleErrorId: 'create-skill-title-error',
  typeErrorId: 'create-skill-type-error',
  categoryErrorId: 'create-skill-category-error',
  subcategoryErrorId: 'create-skill-subcategory-error',
  descriptionErrorId: 'create-skill-description-error',
  descriptionCounterId: 'create-skill-description-counter',
  descriptionHintId: 'create-skill-description-hint',
  imageErrorId: 'create-skill-image-error',
  tagsErrorId: 'create-skill-tags-error',
  tagsCounterId: 'create-skill-tags-counter',
  submitErrorId: 'create-skill-submit-error',
  formErrorsSummaryId: 'create-skill-errors-summary'
} as const;
export type CreateSkillA11yIds = typeof createSkillA11yIds;

export const createSkillControlIds = {
  titleInputId: 'create-skill-title',
  descriptionInputId: 'create-skill-description',
  imageInputId: 'create-skill-image',
  tagsInputId: 'create-skill-tag'
} as const;
export type CreateSkillControlIds = typeof createSkillControlIds;

const getDescribedBy = (...ids: Array<string | undefined | null | false>) => {
  const value = ids.filter(Boolean).join(' ');
  return value || undefined;
};

const focusFirstFocusable = (container: HTMLElement | null) => {
  if (!container) {
    return false;
  }

  const focusableElement = container.querySelector<HTMLElement>(
    "input, textarea, select, button, [tabindex]:not([tabindex='-1'])"
  );

  if (!focusableElement) {
    return false;
  }

  focusableElement.focus();
  return true;
};

const isSubmitShortcut = (
  event: Pick<KeyboardEvent<HTMLElement>, 'key' | 'ctrlKey' | 'metaKey'>
) => event.key === 'Enter' && (event.ctrlKey || event.metaKey);

export const useCreateSkillForm = ({
  user,
  updateProfile,
  skillGroups,
  onCreated
}: UseCreateSkillFormParams) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CreateSkillType>('teach');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagInputError, setTagInputError] = useState<string | null>(null);
  const [touched, setTouched] = useState<
    Partial<Record<TouchedField, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const typeFieldRef = useRef<HTMLDivElement | null>(null);
  const categoryFieldRef = useRef<HTMLDivElement | null>(null);
  const subcategoryFieldRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const isSubmittingRef = useRef(false);
  const refs = useMemo(
    () => ({
      typeFieldRef,
      categoryFieldRef,
      subcategoryFieldRef,
      formRef
    }),
    []
  );

  const subcategoryOptions = useMemo(() => {
    if (typeof categoryId !== 'number') {
      return [];
    }

    return skillGroups.find((group) => group.id === categoryId)?.skills ?? [];
  }, [categoryId, skillGroups]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('');
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    if (
      subcategoryId &&
      subcategoryOptions.some((item) => item.id === subcategoryId)
    ) {
      return;
    }

    setSubcategoryId(subcategoryOptions[0]?.id ?? null);
  }, [subcategoryId, subcategoryOptions]);

  const formValues = useMemo(
    () => ({
      title,
      description,
      type,
      categoryId,
      subcategoryId,
      imageFile,
      tags
    }),
    [title, description, type, categoryId, subcategoryId, imageFile, tags]
  );

  const errors = useMemo(
    () => validateCreateSkillForm(formValues),
    [formValues]
  );
  const isFormValid = isCreateSkillFormValid(errors);

  const clearSubmitError = useCallback(() => {
    setSubmitError((prev) => (prev ? null : prev));
  }, []);

  const markTouched = useCallback((field: TouchedField) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }));
  }, []);

  const showError = useCallback(
    (field: TouchedField) => {
      if (!touched[field]) {
        return undefined;
      }
      return errors[field];
    },
    [errors, touched]
  );

  const titleError = showError('title');
  const typeError = showError('type');
  const categoryError = showError('categoryId');
  const subcategoryError = showError('subcategoryId');
  const descriptionError = showError('description');
  const imageError = showError('imageFile');
  const tagsError = showError('tags') ?? tagInputError;
  const isTagsLimitReached = tags.length >= CREATE_SKILL_CONSTRAINTS.maxTags;

  const titleDescribedBy = getDescribedBy(
    titleError && createSkillA11yIds.titleErrorId
  );
  const typeDescribedBy = getDescribedBy(
    typeError && createSkillA11yIds.typeErrorId
  );
  const categoryDescribedBy = getDescribedBy(
    categoryError && createSkillA11yIds.categoryErrorId
  );
  const subcategoryDescribedBy = getDescribedBy(
    subcategoryError && createSkillA11yIds.subcategoryErrorId
  );
  const descriptionDescribedBy = getDescribedBy(
    createSkillA11yIds.descriptionHintId,
    createSkillA11yIds.descriptionCounterId,
    descriptionError && createSkillA11yIds.descriptionErrorId
  );
  const imageDescribedBy = getDescribedBy(
    imageError && createSkillA11yIds.imageErrorId
  );
  const tagsDescribedBy = getDescribedBy(
    createSkillA11yIds.tagsCounterId,
    tagsError && createSkillA11yIds.tagsErrorId
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
      clearSubmitError();
    },
    [clearSubmitError]
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(event.target.value);
      clearSubmitError();
    },
    [clearSubmitError]
  );

  const submitFromKeyboard = useCallback(() => {
    if (isSubmittingRef.current) {
      return;
    }
    formRef.current?.requestSubmit();
  }, []);

  const handleTypeChange = useCallback(
    (_: ChangeEvent<HTMLInputElement>, value: string) => {
      if (!isCreateSkillType(value)) {
        return;
      }
      setType(value);
      markTouched('type');
      clearSubmitError();
    },
    [clearSubmitError, markTouched]
  );

  const handleTagInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTagInput(event.target.value);
      setTagInputError((prev) => (prev ? null : prev));
      clearSubmitError();
    },
    [clearSubmitError]
  );

  const markAllFieldsTouched = useCallback(() => {
    setTouched(
      touchedFieldNames.reduce<Partial<Record<TouchedField, boolean>>>(
        (acc, fieldName) => {
          acc[fieldName] = true;
          return acc;
        },
        {}
      )
    );
  }, []);

  const focusField = useCallback((field: TouchedField) => {
    if (field === 'title') {
      document.getElementById(createSkillControlIds.titleInputId)?.focus();
      return;
    }

    if (field === 'type') {
      focusFirstFocusable(typeFieldRef.current);
      return;
    }

    if (field === 'categoryId') {
      focusFirstFocusable(categoryFieldRef.current);
      return;
    }

    if (field === 'subcategoryId') {
      focusFirstFocusable(subcategoryFieldRef.current);
      return;
    }

    if (field === 'description') {
      document
        .getElementById(createSkillControlIds.descriptionInputId)
        ?.focus();
      return;
    }

    if (field === 'imageFile') {
      document.getElementById(createSkillControlIds.imageInputId)?.focus();
      return;
    }

    if (field === 'tags') {
      document.getElementById(createSkillControlIds.tagsInputId)?.focus();
    }
  }, []);

  const visibleFieldErrors = useMemo<VisibleFieldError[]>(
    () =>
      (
        [
          ['title', titleError],
          ['type', typeError],
          ['categoryId', categoryError],
          ['subcategoryId', subcategoryError],
          ['description', descriptionError],
          ['imageFile', imageError],
          ['tags', tagsError]
        ] as const
      )
        .filter(([, message]) => Boolean(message))
        .map(([field, message]) => ({
          field,
          message: message as string,
          label: CREATE_SKILL_FIELD_LABELS[field]
        })),
    [
      titleError,
      typeError,
      categoryError,
      subcategoryError,
      descriptionError,
      imageError,
      tagsError
    ]
  );

  const focusFirstInvalidField = useCallback(
    (nextErrors: CreateSkillFormErrors) => {
      if (nextErrors.title) {
        focusField('title');
        return;
      }

      if (nextErrors.type) {
        focusField('type');
        return;
      }

      if (nextErrors.categoryId) {
        focusField('categoryId');
        return;
      }

      if (nextErrors.subcategoryId) {
        focusField('subcategoryId');
        return;
      }

      if (nextErrors.description) {
        focusField('description');
        return;
      }

      if (nextErrors.imageFile) {
        focusField('imageFile');
        return;
      }

      if (nextErrors.tags) {
        focusField('tags');
      }
    },
    [focusField]
  );

  const handleTagAdd = useCallback(() => {
    clearSubmitError();
    const draftError = validateTagDraft(tagInput, tags);
    markTouched('tags');

    if (draftError) {
      setTagInputError(draftError);
      return;
    }

    setTags((prev) => [...prev, normalizeTag(tagInput)]);
    setTagInput('');
    setTagInputError(null);
  }, [clearSubmitError, markTouched, tagInput, tags]);

  const handleTagInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isSubmitShortcut(event)) {
        event.preventDefault();
        submitFromKeyboard();
        return;
      }

      if (event.key !== 'Enter' && event.key !== ',') {
        return;
      }

      event.preventDefault();
      handleTagAdd();
    },
    [handleTagAdd, submitFromKeyboard]
  );

  const handleDescriptionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isSubmitShortcut(event)) {
        return;
      }

      event.preventDefault();
      submitFromKeyboard();
    },
    [submitFromKeyboard]
  );

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
      setTagInputError(null);
      markTouched('tags');
      clearSubmitError();
    },
    [clearSubmitError, markTouched]
  );

  const handleCategoryChange = useCallback(
    (nextValue: string | string[]) => {
      setCategoryId(parseSelectNumberValue(nextValue));
      markTouched('categoryId');
      markTouched('subcategoryId');
      clearSubmitError();
    },
    [clearSubmitError, markTouched]
  );

  const handleSubcategoryChange = useCallback(
    (nextValue: string | string[]) => {
      setSubcategoryId(parseSelectNumberValue(nextValue));
      markTouched('subcategoryId');
      clearSubmitError();
    },
    [clearSubmitError, markTouched]
  );

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setImageFile(file);
      markTouched('imageFile');
      clearSubmitError();
    },
    [clearSubmitError, markTouched]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    markAllFieldsTouched();
    setSubmitError(null);

    if (!user) {
      return;
    }

    if (!isFormValid || !imageFile) {
      focusFirstInvalidField(errors);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const imageDataUrl = await fileToDataUrl(imageFile);
      const normalizedDescription = composeDescriptionWithTags(
        description,
        tags
      );

      const newSkill: ApiUserSkill = {
        title: title.trim(),
        categoryId,
        subcategoryId,
        description: normalizedDescription,
        imageUrls: [imageDataUrl]
      };

      await updateProfile(
        buildUpdatedSkillLists({
          teachableSkills: user.teachableSkills,
          learningSkills: user.learningSkills,
          newSkill,
          type
        })
      );

      onCreated();
    } catch (error) {
      console.error('[CreateSkill] Failed to create skill', error);
      if (error instanceof ApiError && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError(CREATE_SKILL_ERROR_MESSAGES.submitFallback);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const isTagAddDisabled =
    isSubmitting || normalizeTag(tagInput).length === 0 || isTagsLimitReached;

  return {
    ids: createSkillA11yIds,
    controls: createSkillControlIds,
    refs,
    title,
    description,
    type,
    categoryId,
    subcategoryId,
    imagePreviewUrl,
    tags,
    tagInput,
    subcategoryOptions,
    visibleFieldErrors,
    isFormValid,
    isSubmitting,
    submitError,
    isTagAddDisabled,
    isTagsLimitReached,
    titleError,
    typeError,
    categoryError,
    subcategoryError,
    descriptionError,
    imageError,
    tagsError,
    titleDescribedBy,
    typeDescribedBy,
    categoryDescribedBy,
    subcategoryDescribedBy,
    descriptionDescribedBy,
    imageDescribedBy,
    tagsDescribedBy,
    markTouched,
    focusField,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleImageChange,
    handleTagInputChange,
    handleTagInputKeyDown,
    handleTagAdd,
    handleTagRemove,
    handleDescriptionKeyDown,
    handleSubmit
  };
};
