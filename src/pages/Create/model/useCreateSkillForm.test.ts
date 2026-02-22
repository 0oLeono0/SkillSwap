import { act, waitFor } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import type { UpdateProfilePayload } from '@/shared/api/auth';
import { ApiError } from '@/shared/api/auth';
import { CREATE_SKILL_CONSTRAINTS, CREATE_SKILL_ERROR_MESSAGES } from './form';
import { CREATE_SKILL_FIELD_LABELS } from './content';
import { CREATE_SKILL_TEST_VALUES } from './__tests__/createSkillTestData';
import {
  createContainerWithInput,
  createDeferred,
  createDescriptionKeyDownEvent,
  createInputControl,
  createInputEvent,
  createKeyboardEvent,
  createSubmitEvent,
  fillValidForm,
  focusFieldAndExpect,
  mockCreateObjectURL,
  mockRevokeObjectURL,
  renderCreateSkillHook,
  setupFocusFieldDomFixtures,
  setupFormRequestSubmitMock,
  submitCreateSkillForm,
  submitFilledCreateSkillForm,
  triggerDescriptionKeyDown,
  triggerTagInputKeyDown,
  waitForSubmitError
} from './__tests__/useCreateSkillForm.helpers';
import {
  createConsoleErrorSpy,
  setupUrlObjectMocks
} from './__tests__/testEnvironment';

describe('useCreateSkillForm', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    setupUrlObjectMocks({
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = createConsoleErrorSpy();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    consoleErrorSpy.mockRestore();
  });

  it('selects first subcategory when category is chosen', async () => {
    const { hook } = renderCreateSkillHook();

    act(() => {
      hook.result.current.handleCategoryChange(
        CREATE_SKILL_TEST_VALUES.categoryIdString
      );
    });

    await waitFor(() => {
      expect(hook.result.current.subcategoryId).toBe(
        CREATE_SKILL_TEST_VALUES.subcategoryId
      );
    });
    expect(hook.result.current.subcategoryOptions).toHaveLength(2);
  });

  it('focuses fields by control ids and by container refs', () => {
    const { hook } = renderCreateSkillHook();
    const {
      titleInput,
      descriptionTextarea,
      imageInput,
      tagInput,
      typeContainer,
      typeButton,
      categoryContainer,
      categoryInput,
      subcategoryContainer,
      subcategoryButton
    } = setupFocusFieldDomFixtures(hook);

    act(() => {
      hook.result.current.refs.typeFieldRef.current = typeContainer;
      hook.result.current.refs.categoryFieldRef.current = categoryContainer;
      hook.result.current.refs.subcategoryFieldRef.current =
        subcategoryContainer;
    });

    focusFieldAndExpect(hook, 'title', titleInput);
    focusFieldAndExpect(hook, 'description', descriptionTextarea);
    focusFieldAndExpect(hook, 'imageFile', imageInput);
    focusFieldAndExpect(hook, 'tags', tagInput);
    focusFieldAndExpect(hook, 'type', typeButton);
    focusFieldAndExpect(hook, 'categoryId', categoryInput);
    focusFieldAndExpect(hook, 'subcategoryId', subcategoryButton);
  });

  it('focuses title field on invalid submit', async () => {
    const { hook, updateProfile } = renderCreateSkillHook();
    const titleInput = createInputControl(
      hook.result.current.controls.titleInputId
    );

    const submitEvent = await submitCreateSkillForm(hook);

    expect(submitEvent.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(titleInput);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('requests submit on Ctrl+Enter from description and tag handlers', () => {
    const { hook } = renderCreateSkillHook();
    const requestSubmit = setupFormRequestSubmitMock(hook);

    const descriptionShortcutEvent = createDescriptionKeyDownEvent({
      key: 'Enter',
      ctrlKey: true
    });
    triggerDescriptionKeyDown(hook, descriptionShortcutEvent);

    expect(descriptionShortcutEvent.preventDefault).toHaveBeenCalled();
    expect(requestSubmit).toHaveBeenCalledTimes(1);

    const tagShortcutEvent = createKeyboardEvent({
      key: 'Enter',
      ctrlKey: true
    });

    triggerTagInputKeyDown(hook, tagShortcutEvent);

    expect(tagShortcutEvent.preventDefault).toHaveBeenCalled();
    expect(requestSubmit).toHaveBeenCalledTimes(2);
  });

  it('does not request submit from description when shortcut is not used', () => {
    const { hook } = renderCreateSkillHook();
    const requestSubmit = setupFormRequestSubmitMock(hook);

    const regularEnterEvent = createDescriptionKeyDownEvent({
      key: 'Enter'
    });
    triggerDescriptionKeyDown(hook, regularEnterEvent);

    expect(regularEnterEvent.preventDefault).not.toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it('does not request submit from shortcut while submit is in progress', async () => {
    const deferred = createDeferred<void>();
    const { hook } = renderCreateSkillHook({
      updateProfile: jest
        .fn<Promise<void>, [UpdateProfilePayload]>()
        .mockReturnValue(deferred.promise)
    });

    await fillValidForm(hook);

    const requestSubmit = setupFormRequestSubmitMock(hook);

    let submitPromise: Promise<void> | null = null;
    const submitEvent = createSubmitEvent();
    act(() => {
      submitPromise = hook.result.current.handleSubmit(submitEvent);
    });

    await waitFor(() => {
      expect(hook.result.current.isSubmitting).toBe(true);
    });

    const shortcutEvent = createDescriptionKeyDownEvent({
      key: 'Enter',
      ctrlKey: true
    });
    triggerDescriptionKeyDown(hook, shortcutEvent);

    expect(shortcutEvent.preventDefault).toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();

    act(() => {
      deferred.resolve();
    });

    await act(async () => {
      await submitPromise!;
    });
  });

  it('normalizes tags and blocks duplicates', () => {
    const { hook } = renderCreateSkillHook();

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(`   #${CREATE_SKILL_TEST_VALUES.tag}   `)
      );
    });

    act(() => {
      hook.result.current.handleTagAdd();
    });

    expect(hook.result.current.tags).toEqual([CREATE_SKILL_TEST_VALUES.tag]);
    expect(hook.result.current.tagInput).toBe('');

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.duplicateTag)
      );
    });

    act(() => {
      hook.result.current.handleTagAdd();
    });

    expect(hook.result.current.tags).toEqual([CREATE_SKILL_TEST_VALUES.tag]);
    expect(hook.result.current.tagsError).toBe(
      CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate
    );
  });

  it('submits valid payload and calls onCreated', async () => {
    const { hook, updateProfile, onCreated } = renderCreateSkillHook();

    const submitEvent = await submitFilledCreateSkillForm(hook);

    expect(submitEvent.preventDefault).toHaveBeenCalled();
    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(onCreated).toHaveBeenCalledTimes(1);

    const payload = updateProfile.mock.calls[0]?.[0];
    expect(payload?.teachableSkills).toHaveLength(1);
    expect(payload?.learningSkills).toHaveLength(1);
    expect(payload?.learningSkills?.[0]).toMatchObject({
      title: CREATE_SKILL_TEST_VALUES.title,
      categoryId: CREATE_SKILL_TEST_VALUES.categoryId,
      subcategoryId: CREATE_SKILL_TEST_VALUES.subcategoryId,
      description: `${CREATE_SKILL_TEST_VALUES.description}\n\n#${CREATE_SKILL_TEST_VALUES.tag}`
    });
    expect(payload?.learningSkills?.[0]?.imageUrls?.[0]).toContain(
      'data:image/png;base64,'
    );
  });

  it('shows api error message after failed submit and clears it on edit', async () => {
    const { hook, onCreated } = renderCreateSkillHook({
      updateProfile: jest
        .fn<Promise<void>, [UpdateProfilePayload]>()
        .mockRejectedValue(
          new ApiError(500, CREATE_SKILL_TEST_VALUES.apiTemporaryError)
        )
    });

    await submitFilledCreateSkillForm(hook);
    await waitForSubmitError(hook, CREATE_SKILL_TEST_VALUES.apiTemporaryError);
    expect(hook.result.current.isSubmitting).toBe(false);
    expect(onCreated).not.toHaveBeenCalled();

    act(() => {
      hook.result.current.handleTitleChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.updatedTitle)
      );
    });

    expect(hook.result.current.submitError).toBeNull();
  });

  it('shows fallback error message for non-api submit error', async () => {
    const { hook } = renderCreateSkillHook({
      updateProfile: jest
        .fn<Promise<void>, [UpdateProfilePayload]>()
        .mockRejectedValue(
          new Error(CREATE_SKILL_TEST_VALUES.genericSubmitError)
        )
    });

    await submitFilledCreateSkillForm(hook);
    await waitForSubmitError(hook, CREATE_SKILL_ERROR_MESSAGES.submitFallback);
  });

  it('clears submit error when category changes after failed submit', async () => {
    const { hook } = renderCreateSkillHook({
      updateProfile: jest
        .fn<Promise<void>, [UpdateProfilePayload]>()
        .mockRejectedValue(
          new Error(CREATE_SKILL_TEST_VALUES.genericSubmitError)
        )
    });

    await submitFilledCreateSkillForm(hook);
    await waitForSubmitError(hook, CREATE_SKILL_ERROR_MESSAGES.submitFallback);

    act(() => {
      hook.result.current.handleCategoryChange(
        CREATE_SKILL_TEST_VALUES.categoryIdString
      );
    });

    expect(hook.result.current.submitError).toBeNull();
  });

  it('focuses category field when title is valid but category is missing', async () => {
    const { hook, updateProfile } = renderCreateSkillHook();
    createInputControl(hook.result.current.controls.titleInputId);
    const { container: categoryContainer, input: categoryInput } =
      createContainerWithInput();

    act(() => {
      hook.result.current.refs.categoryFieldRef.current = categoryContainer;
      hook.result.current.handleTitleChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.title)
      );
    });

    await submitCreateSkillForm(hook);

    expect(document.activeElement).toBe(categoryInput);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('does not submit when user is absent', async () => {
    const { hook, updateProfile, onCreated } = renderCreateSkillHook({
      user: null
    });

    await submitCreateSkillForm(hook);

    expect(updateProfile).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('ignores invalid skill type value', () => {
    const { hook } = renderCreateSkillHook();

    act(() => {
      hook.result.current.handleTypeChange(
        {} as ChangeEvent<HTMLInputElement>,
        'invalid-type'
      );
    });

    expect(hook.result.current.type).toBe('teach');
  });

  it('adds tag by comma key in tag input handler', () => {
    const { hook } = renderCreateSkillHook();

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.tag)
      );
    });

    const commaEvent = createKeyboardEvent({ key: ',' });

    triggerTagInputKeyDown(hook, commaEvent);

    expect(commaEvent.preventDefault).toHaveBeenCalled();
    expect(hook.result.current.tags).toEqual([CREATE_SKILL_TEST_VALUES.tag]);
    expect(hook.result.current.tagInput).toBe('');
  });

  it('updates tag add disabled state based on draft and tags limit', () => {
    const { hook } = renderCreateSkillHook();
    const tags = [...CREATE_SKILL_TEST_VALUES.maxTags];

    expect(hook.result.current.isTagAddDisabled).toBe(true);
    expect(hook.result.current.isTagsLimitReached).toBe(false);

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.tag)
      );
    });
    expect(hook.result.current.isTagAddDisabled).toBe(false);

    tags.forEach((tag) => {
      act(() => {
        hook.result.current.handleTagInputChange(createInputEvent(tag));
      });
      act(() => {
        hook.result.current.handleTagAdd();
      });
    });

    expect(hook.result.current.isTagsLimitReached).toBe(true);
    expect(hook.result.current.isTagAddDisabled).toBe(true);
  });

  it('builds visibleFieldErrors with stable field order after empty submit', async () => {
    const { hook } = renderCreateSkillHook();
    await submitCreateSkillForm(hook);

    expect(
      hook.result.current.visibleFieldErrors.map(({ field }) => field)
    ).toEqual([
      'title',
      'categoryId',
      'subcategoryId',
      'description',
      'imageFile'
    ]);

    expect(hook.result.current.visibleFieldErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'title',
          label: CREATE_SKILL_FIELD_LABELS.title,
          message: `Минимум ${CREATE_SKILL_CONSTRAINTS.titleMin} символа`
        }),
        expect.objectContaining({
          field: 'categoryId',
          label: CREATE_SKILL_FIELD_LABELS.categoryId,
          message: CREATE_SKILL_ERROR_MESSAGES.categoryRequired
        }),
        expect.objectContaining({
          field: 'subcategoryId',
          label: CREATE_SKILL_FIELD_LABELS.subcategoryId,
          message: CREATE_SKILL_ERROR_MESSAGES.subcategoryRequired
        }),
        expect.objectContaining({
          field: 'description',
          label: CREATE_SKILL_FIELD_LABELS.description,
          message: CREATE_SKILL_ERROR_MESSAGES.descriptionRequired
        }),
        expect.objectContaining({
          field: 'imageFile',
          label: CREATE_SKILL_FIELD_LABELS.imageFile,
          message: CREATE_SKILL_ERROR_MESSAGES.imageRequired
        })
      ])
    );
  });

  it('updates visibleFieldErrors after partial form fixes', async () => {
    const { hook } = renderCreateSkillHook();
    await submitCreateSkillForm(hook);

    act(() => {
      hook.result.current.handleTitleChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.title)
      );
      hook.result.current.handleCategoryChange(
        CREATE_SKILL_TEST_VALUES.categoryIdString
      );
    });

    await waitFor(() => {
      expect(hook.result.current.subcategoryId).toBe(
        CREATE_SKILL_TEST_VALUES.subcategoryId
      );
    });

    expect(
      hook.result.current.visibleFieldErrors.map(({ field }) => field)
    ).toEqual(['description', 'imageFile']);
  });

  it('shows tag draft error in visibleFieldErrors when tags are touched', () => {
    const { hook } = renderCreateSkillHook();

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.tag)
      );
    });
    act(() => {
      hook.result.current.handleTagAdd();
    });

    act(() => {
      hook.result.current.handleTagInputChange(
        createInputEvent(CREATE_SKILL_TEST_VALUES.duplicateTag)
      );
    });
    act(() => {
      hook.result.current.handleTagAdd();
    });

    expect(hook.result.current.tagsError).toBe(
      CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate
    );
    expect(hook.result.current.visibleFieldErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'tags',
          label: CREATE_SKILL_FIELD_LABELS.tags,
          message: CREATE_SKILL_ERROR_MESSAGES.tagDraftDuplicate
        })
      ])
    );
  });

  it('revokes object urls when image changes and on unmount', async () => {
    const { hook } = renderCreateSkillHook();
    mockCreateObjectURL
      .mockReturnValueOnce(CREATE_SKILL_TEST_VALUES.firstBlobUrl)
      .mockReturnValueOnce(CREATE_SKILL_TEST_VALUES.secondBlobUrl);

    const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
    const secondFile = new File(['second'], 'second.png', {
      type: 'image/png'
    });

    act(() => {
      hook.result.current.handleImageChange({
        target: { files: [firstFile] }
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(hook.result.current.imagePreviewUrl).toBe(
        CREATE_SKILL_TEST_VALUES.firstBlobUrl
      );
    });

    act(() => {
      hook.result.current.handleImageChange({
        target: { files: [secondFile] }
      } as unknown as ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(hook.result.current.imagePreviewUrl).toBe(
        CREATE_SKILL_TEST_VALUES.secondBlobUrl
      );
    });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith(
      CREATE_SKILL_TEST_VALUES.firstBlobUrl
    );

    act(() => {
      hook.unmount();
    });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith(
      CREATE_SKILL_TEST_VALUES.secondBlobUrl
    );
  });
});
