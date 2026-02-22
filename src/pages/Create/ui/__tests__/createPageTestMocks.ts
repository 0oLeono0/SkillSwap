import {
  CREATE_SKILL_TEST_GROUPS,
  createBaseCreateSkillTestUser
} from '../../model/__tests__/createSkillTestData';
import type { AuthContextType } from '@/app/providers/auth/context';
import type { SkillCategories } from '@/features/Filter/types';
import type { UpdateProfilePayload } from '@/shared/api/auth';

type MockNavigate = (to: string | number, options?: unknown) => void;
type MockUpdateProfile = (payload: UpdateProfilePayload) => Promise<void>;
type MockUseAuth = () => Pick<AuthContextType, 'updateProfile' | 'user'>;
type MockRefetchBaseData = () => Promise<void>;
type MockUseFiltersBaseData = () => {
  error: string | null;
  isLoading: boolean;
  refetch: MockRefetchBaseData;
  skillGroups: SkillCategories[];
};

export const mockNavigate: jest.MockedFunction<MockNavigate> = jest.fn();
export const mockUpdateProfile: jest.MockedFunction<MockUpdateProfile> =
  jest.fn();
export const mockUseAuth: jest.MockedFunction<MockUseAuth> = jest.fn();
export const mockRefetchBaseData: jest.MockedFunction<MockRefetchBaseData> =
  jest.fn();
export const mockUseFiltersBaseData: jest.MockedFunction<MockUseFiltersBaseData> =
  jest.fn();

export const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const setupCreatePageDefaultMocks = () => {
  mockUpdateProfile.mockResolvedValue(undefined);
  mockRefetchBaseData.mockResolvedValue(undefined);
  mockUseFiltersBaseData.mockReturnValue({
    skillGroups: CREATE_SKILL_TEST_GROUPS,
    isLoading: false,
    error: null,
    refetch: mockRefetchBaseData
  });
  mockUseAuth.mockReturnValue({
    user: createBaseCreateSkillTestUser(),
    updateProfile: mockUpdateProfile
  });
};

export const setupCreatePageGuestMocks = () => {
  mockUseAuth.mockReturnValue({
    user: null,
    updateProfile: mockUpdateProfile
  });
};
