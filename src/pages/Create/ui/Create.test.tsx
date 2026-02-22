import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/shared/api/auth';
import { ROUTES } from '@/shared/constants';
import {
  CREATE_SKILL_CONSTRAINTS,
  CREATE_SKILL_ERROR_MESSAGES
} from '../model/form';
import { CREATE_SKILL_COPY } from '../model/content';
import {
  CREATE_SKILL_TEST_VALUES,
  createCreateSkillImageValidationFile
} from '../model/__tests__/createSkillTestData';
import {
  createDeferred,
  createPageHarness,
  createPageActions,
  createPageAssertions,
  createPageQueries,
  mockNavigate,
  mockRefetchBaseData,
  mockUpdateProfile,
  mockUseAuth,
  mockUseFiltersBaseData,
  setupCreatePageGuestMocks,
  setupCreatePageDefaultMocks
} from './__tests__';
import { mockSelect } from './__tests__/uiMocks';
import {
  createConsoleErrorSpy,
  setupUrlObjectMocks
} from '../model/__tests__/testEnvironment';
import { createSkillA11yIds } from '../model/useCreateSkillForm';
import Create from './Create';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

jest.mock('@/app/providers/auth', () => ({
  useAuth: () => mockUseAuth()
}));

jest.mock('@/features/Filter/model/useFiltersBaseData', () => ({
  useFiltersBaseData: () => mockUseFiltersBaseData()
}));

jest.mock('@/shared/ui/Select', () => {
  return {
    Select: (...args: Parameters<typeof mockSelect>) => mockSelect(...args)
  };
});

describe('Create page', () => {
  const queries = createPageQueries;
  const actions = createPageActions;
  const assertions = createPageAssertions;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    setupUrlObjectMocks({
      createObjectURL: jest.fn(() => 'blob:preview'),
      revokeObjectURL: jest.fn()
    });
  });

  beforeEach(() => {
    consoleErrorSpy = createConsoleErrorSpy();
    jest.clearAllMocks();
    setupCreatePageDefaultMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const {
    renderFilledPage,
    renderPage,
    renderPageWithBaseDataError,
    submitWithKeyboardShortcutAndExpectSuccess
  } = createPageHarness(<Create />);

  describe('guest', () => {
    it('redirects guest to login from empty state button', async () => {
      setupCreatePageGuestMocks();
      const { user } = renderPage();

      await user.click(
        screen.getByRole('button', { name: CREATE_SKILL_COPY.guestLoginButton })
      );
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  describe('validation', () => {
    it('navigates back when cancel button is clicked', async () => {
      const { user } = renderPage();

      await user.click(
        screen.getByRole('button', { name: CREATE_SKILL_COPY.cancelButton })
      );

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('shows base data error and retries loading', async () => {
      const { user } = renderPageWithBaseDataError();

      expect(
        screen.getByText(CREATE_SKILL_COPY.baseDataLoadError)
      ).toBeInTheDocument();

      await user.click(queries.getBaseDataRetryButton());
      expect(mockRefetchBaseData).toHaveBeenCalledTimes(1);
    });

    it('logs retry error when base data refetch fails', async () => {
      const retryError = new Error(CREATE_SKILL_TEST_VALUES.retryError);
      mockRefetchBaseData.mockRejectedValueOnce(retryError);
      const { user } = renderPageWithBaseDataError();

      await user.click(queries.getBaseDataRetryButton());

      await waitFor(() =>
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[CreateSkill] Failed to refetch filters base data',
          retryError
        )
      );
    });

    it('focuses first invalid field when submit is forced on empty form', () => {
      renderPage();

      const titleInput = queries.getTitleInput();
      const descriptionInput = queries.getDescriptionInput();
      fireEvent.submit(queries.getCreateFormByTitleInput());

      expect(document.activeElement).toBe(titleInput);
      expect(screen.getByRole('alert')).toHaveAttribute(
        'id',
        createSkillA11yIds.formErrorsSummaryId
      );
      expect(
        screen.getByText(CREATE_SKILL_COPY.errorSummaryTitle)
      ).toBeInTheDocument();
      expect(titleInput).toHaveAttribute(
        'aria-describedby',
        createSkillA11yIds.titleErrorId
      );
      expect(descriptionInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(createSkillA11yIds.descriptionCounterId)
      );
      expect(descriptionInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(createSkillA11yIds.descriptionErrorId)
      );

      fireEvent.click(
        queries.getErrorSummaryFieldButton(CREATE_SKILL_COPY.descriptionLabel)
      );
      expect(document.activeElement).toBe(descriptionInput);
    });

    it('shows explicit error when duplicate tag is added', async () => {
      const { user } = renderPage();

      await actions.triggerDuplicateTagDraftError(user);

      expect(
        screen.getByText(CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate)
      ).toBeInTheDocument();
    });

    it('shows image type error and prevents submit', async () => {
      const { user } = renderPage();

      await actions.fillRequiredFieldsExceptImage(user);

      const imageInput = queries.getImageInput();
      const invalidImage = createCreateSkillImageValidationFile({
        name: 'skill.webp',
        type: 'image/webp'
      });
      fireEvent.change(imageInput, {
        target: { files: [invalidImage] }
      });

      expect(
        screen.getByText(CREATE_SKILL_ERROR_MESSAGES.imageInvalidType)
      ).toBeInTheDocument();
      expect(queries.getSubmitButton()).toBeDisabled();

      fireEvent.submit(queries.getCreateFormByTitleInput());

      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('shows image size error for too large file', async () => {
      const { user } = renderPage();

      await actions.fillRequiredFieldsExceptImage(user);

      const imageInput = queries.getImageInput();
      const tooLargeImage = createCreateSkillImageValidationFile({
        name: 'big.png',
        type: 'image/png',
        size: CREATE_SKILL_CONSTRAINTS.maxImageSizeBytes + 1
      });
      fireEvent.change(imageInput, {
        target: { files: [tooLargeImage] }
      });

      expect(
        screen.getByText(CREATE_SKILL_ERROR_MESSAGES.imageTooLarge)
      ).toBeInTheDocument();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('adds tag when comma key is pressed', async () => {
      const { user } = renderPage();

      const tagInput = queries.getTagInput();
      await user.type(tagInput, CREATE_SKILL_TEST_VALUES.tagWithDelimiter);

      expect(
        queries.getRemoveTagButton(CREATE_SKILL_TEST_VALUES.tag)
      ).toBeInTheDocument();
    });

    it('locks tag input on max tags and unlocks after remove', async () => {
      const { user } = renderPage();

      const tagInput = queries.getTagInput();
      const tags = [...CREATE_SKILL_TEST_VALUES.maxTags];

      await actions.addTags(user, tags);

      expect(tagInput).toBeDisabled();
      expect(queries.getAddTagButton()).toBeDisabled();
      expect(
        screen.getByText(
          queries.getTagsCounterText(CREATE_SKILL_CONSTRAINTS.maxTags)
        )
      ).toBeInTheDocument();
      expect(tagInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(createSkillA11yIds.tagsCounterId)
      );

      await user.click(
        queries.getRemoveTagButton(CREATE_SKILL_TEST_VALUES.maxTags[0])
      );

      expect(tagInput).toBeEnabled();
      expect(
        screen.getByText(
          queries.getTagsCounterText(CREATE_SKILL_CONSTRAINTS.maxTags - 1)
        )
      ).toBeInTheDocument();
    });

    it('updates tags aria-describedby when tag draft error appears and clears', async () => {
      const { user } = renderPage();

      const tagInput = queries.getTagInput();

      expect(tagInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(createSkillA11yIds.tagsCounterId)
      );
      expect(tagInput.getAttribute('aria-describedby')).not.toContain(
        createSkillA11yIds.tagsErrorId
      );

      await actions.triggerDuplicateTagDraftError(user);

      expect(
        screen.getByText(CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate)
      ).toBeInTheDocument();
      expect(tagInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(createSkillA11yIds.tagsErrorId)
      );

      await user.type(tagInput, '!');

      expect(tagInput.getAttribute('aria-describedby')).not.toContain(
        createSkillA11yIds.tagsErrorId
      );
    });
  });

  describe('submit', () => {
    it('clears submit error after user edits form', async () => {
      mockUpdateProfile.mockRejectedValueOnce(
        new Error(CREATE_SKILL_TEST_VALUES.genericSubmitError)
      );
      const { user } = await renderFilledPage();

      await user.click(queries.getSubmitButton());
      await assertions.waitForSubmitFallbackError();

      await user.type(queries.getTitleInput(), '!');

      assertions.expectNoFallbackSubmitError();
    });

    it('shows api submit error message from backend', async () => {
      mockUpdateProfile.mockRejectedValueOnce(
        new ApiError(422, CREATE_SKILL_TEST_VALUES.apiSkillExistsError)
      );
      const { user } = await renderFilledPage();

      await user.click(queries.getSubmitButton());

      await assertions.waitForApiSubmitError(
        CREATE_SKILL_TEST_VALUES.apiSkillExistsError
      );
      assertions.expectNoFallbackSubmitError();
    });

    it('shows fallback submit error when image reading fails', async () => {
      const { user } = await renderFilledPage();

      const readAsDataUrlSpy = jest
        .spyOn(FileReader.prototype, 'readAsDataURL')
        .mockImplementation(function mockedReadAsDataURL(this: FileReader) {
          Object.defineProperty(this, 'error', {
            configurable: true,
            value: new DOMException('read failed', 'NotReadableError')
          });
          this.onerror?.(
            new ProgressEvent('error') as unknown as ProgressEvent<FileReader>
          );
        });

      try {
        await user.click(queries.getSubmitButton());
        await assertions.waitForSubmitFallbackError();
        expect(mockUpdateProfile).not.toHaveBeenCalled();
      } finally {
        readAsDataUrlSpy.mockRestore();
      }
    });

    it.each([
      {
        title: 'submits valid form with Ctrl+Enter from description',
        target: 'description' as const,
        modifier: 'ctrl' as const
      },
      {
        title: 'submits valid form with Meta+Enter from description',
        target: 'description' as const,
        modifier: 'meta' as const
      },
      {
        title: 'submits valid form with Ctrl+Enter from tag input',
        target: 'tags' as const,
        modifier: 'ctrl' as const
      }
    ])('$title', async ({ target, modifier }) => {
      await submitWithKeyboardShortcutAndExpectSuccess(target, modifier);
    });

    it('does not submit twice while request is in progress', async () => {
      const deferred = createDeferred<void>();
      mockUpdateProfile.mockReturnValueOnce(deferred.promise);
      await renderFilledPage();

      const descriptionInput = queries.getDescriptionInput();
      descriptionInput.focus();

      actions.submitByEnterShortcut(descriptionInput, 'ctrl');
      actions.submitByEnterShortcut(descriptionInput, 'ctrl');

      await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));

      deferred.resolve();

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CATALOG)
      );
    });

    it('submits valid form and navigates to catalog', async () => {
      const { user } = await renderFilledPage();

      const submitButton = queries.getSubmitButton();
      await waitFor(() => expect(submitButton).toBeEnabled());

      await user.click(submitButton);

      await assertions.waitForSuccessfulSubmit();

      const payload = mockUpdateProfile.mock.calls[0][0];
      const teachableSkills = payload.teachableSkills ?? [];
      const learningSkills = payload.learningSkills ?? [];

      expect(teachableSkills).toHaveLength(2);
      expect(learningSkills).toHaveLength(0);

      const createdSkill = teachableSkills[1];
      expect(createdSkill).toBeDefined();
      if (!createdSkill) {
        throw new Error('Expected created skill in teachableSkills');
      }

      expect(createdSkill).toMatchObject({
        title: CREATE_SKILL_TEST_VALUES.title,
        categoryId: CREATE_SKILL_TEST_VALUES.categoryId,
        subcategoryId: CREATE_SKILL_TEST_VALUES.subcategoryId,
        description: CREATE_SKILL_TEST_VALUES.description
      });
      expect(createdSkill.imageUrls).toEqual(
        expect.arrayContaining([expect.any(String)])
      );
    });
  });
});
