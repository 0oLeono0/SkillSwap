import {
  act,
  renderHook,
  waitFor,
  type RenderHookResult
} from '@testing-library/react';
import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent
} from 'react';
import type { UpdateProfilePayload } from '@/shared/api/auth';
import type { AuthUser } from '@/app/providers/auth/context';
import type { SkillCategories } from '@/features/Filter/types';
import { useCreateSkillForm } from '../useCreateSkillForm';
import {
  CREATE_SKILL_TEST_GROUPS,
  CREATE_SKILL_TEST_VALUES,
  createBaseCreateSkillTestUser,
  createCreateSkillImageFile
} from './createSkillTestData';

export const mockCreateObjectURL = jest.fn(() => 'blob:preview');
export const mockRevokeObjectURL = jest.fn();

const skillGroups: SkillCategories[] = CREATE_SKILL_TEST_GROUPS;
const baseUser: AuthUser = createBaseCreateSkillTestUser();

export const createInputEvent = (value: string) =>
  ({
    target: { value }
  }) as ChangeEvent<HTMLInputElement>;

const createTextareaEvent = (value: string) =>
  ({
    target: { value }
  }) as ChangeEvent<HTMLTextAreaElement>;

const createFileChangeEvent = (file: File | null) =>
  ({
    target: {
      files: file ? [file] : []
    }
  }) as unknown as ChangeEvent<HTMLInputElement>;

export const createKeyboardEvent = (options: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}) =>
  ({
    key: options.key,
    ctrlKey: Boolean(options.ctrlKey),
    metaKey: Boolean(options.metaKey),
    preventDefault: jest.fn()
  }) as unknown as ReactKeyboardEvent<HTMLInputElement>;

export const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

type HookResult = ReturnType<typeof useCreateSkillForm>;
type HookRender = RenderHookResult<HookResult, unknown>;
export type CreateSkillHookRender = HookRender;
export type CreateSkillFocusField = Parameters<HookResult['focusField']>[0];

export const renderCreateSkillHook = ({
  user = baseUser,
  updateProfile = jest
    .fn<Promise<void>, [UpdateProfilePayload]>()
    .mockResolvedValue(undefined),
  onCreated = jest.fn(),
  groups = skillGroups
}: {
  user?: AuthUser | null;
  updateProfile?: jest.Mock<Promise<void>, [UpdateProfilePayload]>;
  onCreated?: jest.Mock;
  groups?: SkillCategories[];
} = {}) => {
  const hook = renderHook(() =>
    useCreateSkillForm({
      user,
      updateProfile,
      skillGroups: groups,
      onCreated
    })
  );

  return { hook, updateProfile, onCreated };
};

export const fillValidForm = async (hook: HookRender) => {
  act(() => {
    hook.result.current.handleTitleChange(
      createInputEvent(CREATE_SKILL_TEST_VALUES.title)
    );
    hook.result.current.handleDescriptionChange(
      createTextareaEvent(CREATE_SKILL_TEST_VALUES.description)
    );
    hook.result.current.handleTypeChange(
      {} as ChangeEvent<HTMLInputElement>,
      'learn'
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

  act(() => {
    hook.result.current.handleImageChange(
      createFileChangeEvent(createCreateSkillImageFile())
    );
    hook.result.current.handleTagInputChange(
      createInputEvent(CREATE_SKILL_TEST_VALUES.tag)
    );
  });

  act(() => {
    hook.result.current.handleTagAdd();
  });
};

export const createSubmitEvent = () =>
  ({
    preventDefault: jest.fn()
  }) as unknown as FormEvent<HTMLFormElement>;

export const submitCreateSkillForm = async (hook: HookRender) => {
  const submitEvent = createSubmitEvent();
  await act(async () => {
    await hook.result.current.handleSubmit(submitEvent);
  });
  return submitEvent;
};

export const submitFilledCreateSkillForm = async (hook: HookRender) => {
  await fillValidForm(hook);
  return submitCreateSkillForm(hook);
};

export const waitForSubmitError = async (hook: HookRender, message: string) => {
  await waitFor(() => {
    expect(hook.result.current.submitError).toBe(message);
  });
};

export const setupFormRequestSubmitMock = (hook: HookRender) => {
  const requestSubmit = jest.fn();
  act(() => {
    hook.result.current.refs.formRef.current = {
      requestSubmit
    } as unknown as HTMLFormElement;
  });
  return requestSubmit;
};

export const focusFieldAndExpect = (
  hook: HookRender,
  field: CreateSkillFocusField,
  element: HTMLElement
) => {
  act(() => {
    hook.result.current.focusField(field);
  });
  expect(document.activeElement).toBe(element);
};

export const createDescriptionKeyDownEvent = (options: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}) =>
  createKeyboardEvent(
    options
  ) as unknown as ReactKeyboardEvent<HTMLTextAreaElement>;

export const triggerDescriptionKeyDown = (
  hook: HookRender,
  event: ReactKeyboardEvent<HTMLTextAreaElement>
) => {
  act(() => {
    hook.result.current.handleDescriptionKeyDown(event);
  });
};

export const triggerTagInputKeyDown = (
  hook: HookRender,
  event: ReturnType<typeof createKeyboardEvent>
) => {
  act(() => {
    hook.result.current.handleTagInputKeyDown(event);
  });
};

const appendToBody = <T extends HTMLElement>(element: T) => {
  document.body.appendChild(element);
  return element;
};

export const createInputControl = (id: string) => {
  const input = document.createElement('input');
  input.id = id;
  return appendToBody(input);
};

export const createTextareaControl = (id: string) => {
  const textarea = document.createElement('textarea');
  textarea.id = id;
  return appendToBody(textarea);
};

const createContainerWithButton = () => {
  const container = document.createElement('div');
  const button = document.createElement('button');
  container.appendChild(button);
  appendToBody(container);
  return { container, button };
};

export const createContainerWithInput = () => {
  const container = document.createElement('div');
  const input = document.createElement('input');
  container.appendChild(input);
  appendToBody(container);
  return { container, input };
};

export const setupFocusFieldDomFixtures = (hook: HookRender) => {
  const titleInput = createInputControl(
    hook.result.current.controls.titleInputId
  );
  const descriptionTextarea = createTextareaControl(
    hook.result.current.controls.descriptionInputId
  );
  const imageInput = createInputControl(
    hook.result.current.controls.imageInputId
  );
  const tagInput = createInputControl(hook.result.current.controls.tagsInputId);
  const { container: typeContainer, button: typeButton } =
    createContainerWithButton();
  const { container: categoryContainer, input: categoryInput } =
    createContainerWithInput();
  const { container: subcategoryContainer, button: subcategoryButton } =
    createContainerWithButton();

  return {
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
  };
};
