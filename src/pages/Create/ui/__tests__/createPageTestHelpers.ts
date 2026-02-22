import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ROUTES } from '@/shared/constants';
import {
  CREATE_SKILL_COPY,
  getCreateSkillRemoveTagLabel
} from '../../model/content';
import {
  CREATE_SKILL_CONSTRAINTS,
  CREATE_SKILL_ERROR_MESSAGES
} from '../../model/form';
import {
  CREATE_SKILL_TEST_VALUES,
  createCreateSkillImageFile
} from '../../model/__tests__/createSkillTestData';
import {
  mockNavigate,
  mockRefetchBaseData,
  mockUpdateProfile,
  mockUseFiltersBaseData
} from './createPageTestMocks';
import type {
  ShortcutModifier,
  ShortcutTarget,
  UserEventInstance
} from './createPageTestTypes';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCategoryInput = () =>
  screen.getByLabelText(CREATE_SKILL_COPY.categoryLabel);

const getSubcategoryInput = () =>
  screen.getByLabelText(CREATE_SKILL_COPY.subcategoryLabel);

const getBaseDataRetryButton = () =>
  screen.getByRole('button', { name: CREATE_SKILL_COPY.baseDataRetry });

const getSubmitButton = () =>
  screen.getByRole('button', { name: CREATE_SKILL_COPY.submitButton });

const getTitleInput = () => screen.getByLabelText(CREATE_SKILL_COPY.titleLabel);

const getDescriptionInput = () =>
  screen.getByLabelText(CREATE_SKILL_COPY.descriptionLabel);

const getTagInput = () =>
  screen.getByLabelText(new RegExp(CREATE_SKILL_COPY.tagsLabel, 'i'));

const getAddTagButton = () =>
  screen.getByRole('button', { name: CREATE_SKILL_COPY.tagsAddButton });

const getImageInput = () => screen.getByLabelText(CREATE_SKILL_COPY.imageLabel);

const getShortcutTargetInput = (target: ShortcutTarget) =>
  target === 'description' ? getDescriptionInput() : getTagInput();

const getTagsCounterText = (count: number) =>
  `${count}/${CREATE_SKILL_CONSTRAINTS.maxTags}`;

const getErrorSummaryFieldButton = (label: string) =>
  screen.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(label)}:`, 'i')
  });

const getRemoveTagButton = (tag: string) =>
  screen.getByRole('button', {
    name: getCreateSkillRemoveTagLabel(tag)
  });

const getCreateFormByTitleInput = () => {
  const form = getTitleInput().closest('form');
  expect(form).not.toBeNull();
  return form as HTMLFormElement;
};

const setBaseDataErrorState = () => {
  mockUseFiltersBaseData.mockReturnValue({
    skillGroups: [],
    isLoading: false,
    error: 'failed to load',
    refetch: mockRefetchBaseData
  });
};

const fillRequiredFieldsExceptImage = async (user: UserEventInstance) => {
  await user.type(getTitleInput(), CREATE_SKILL_TEST_VALUES.title);
  await user.selectOptions(
    getCategoryInput(),
    CREATE_SKILL_TEST_VALUES.categoryIdString
  );
  await user.selectOptions(
    getSubcategoryInput(),
    CREATE_SKILL_TEST_VALUES.subcategoryIdString
  );
  await user.type(getDescriptionInput(), CREATE_SKILL_TEST_VALUES.description);
};

const fillRequiredFields = async (user: UserEventInstance) => {
  await fillRequiredFieldsExceptImage(user);
  const imageInput = getImageInput();
  const file = createCreateSkillImageFile();
  await user.upload(imageInput, file);
};

const addTag = async (user: UserEventInstance, tag: string) => {
  await user.type(getTagInput(), tag);
  await user.click(getAddTagButton());
};

const addTags = async (user: UserEventInstance, tags: string[]) => {
  for (const tag of tags) {
    await addTag(user, tag);
  }
};

const triggerDuplicateTagDraftError = async (user: UserEventInstance) => {
  await addTag(user, CREATE_SKILL_TEST_VALUES.tag);
  await addTag(user, CREATE_SKILL_TEST_VALUES.duplicateTag);
};

const submitByEnterShortcut = (
  input: HTMLElement,
  modifier: ShortcutModifier = 'ctrl'
) => {
  fireEvent.keyDown(input, {
    key: 'Enter',
    ctrlKey: modifier === 'ctrl',
    metaKey: modifier === 'meta'
  });
};

const waitForSubmitFallbackError = async () => {
  await waitFor(() =>
    expect(
      screen.getByText(CREATE_SKILL_ERROR_MESSAGES.submitFallback)
    ).toBeInTheDocument()
  );
};

const waitForApiSubmitError = async (message: string) => {
  await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument());
};

const expectNoFallbackSubmitError = () => {
  expect(
    screen.queryByText(CREATE_SKILL_ERROR_MESSAGES.submitFallback)
  ).not.toBeInTheDocument();
};

const waitForSuccessfulSubmit = async () => {
  await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
  expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CATALOG);
};

export const createPageQueries = {
  getAddTagButton,
  getBaseDataRetryButton,
  getCreateFormByTitleInput,
  getDescriptionInput,
  getErrorSummaryFieldButton,
  getImageInput,
  getRemoveTagButton,
  getShortcutTargetInput,
  getSubmitButton,
  getTagInput,
  getTagsCounterText,
  getTitleInput
};

export const createPageActions = {
  addTag,
  addTags,
  fillRequiredFields,
  fillRequiredFieldsExceptImage,
  setBaseDataErrorState,
  submitByEnterShortcut,
  triggerDuplicateTagDraftError
};

export const createPageAssertions = {
  expectNoFallbackSubmitError,
  waitForApiSubmitError,
  waitForSubmitFallbackError,
  waitForSuccessfulSubmit
};
