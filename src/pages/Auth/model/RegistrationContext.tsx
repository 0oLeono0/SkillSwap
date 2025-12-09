/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  type FC,
  type ReactNode,
} from 'react';
import type { Gender } from '@/entities/User/types';

interface RegistrationCredentials {
  email: string;
  password: string;
}

export interface RegistrationStepTwoData {
  name: string;
  birthDate: string;
  gender: Gender | '';
  cityId: number | null;
  categoryId: number | null;
  subskillId: number | null;
  avatarUrl: string;
}

interface RegistrationState {
  credentials: RegistrationCredentials | null;
  stepTwo: RegistrationStepTwoData | null;
}

type RegistrationAction =
  | { type: 'setCredentials'; payload: RegistrationCredentials }
  | { type: 'setStepTwo'; payload: RegistrationStepTwoData | null }
  | { type: 'clear' };

const STEP_TWO_STORAGE_KEY = 'registration:step2';

const readStepTwoFromStorage = (): RegistrationStepTwoData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STEP_TWO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationStepTwoData;
  } catch {
    return null;
  }
};

const writeStepTwoToStorage = (value: RegistrationStepTwoData | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!value) {
      window.sessionStorage.removeItem(STEP_TWO_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STEP_TWO_STORAGE_KEY, JSON.stringify(value));
    }
  } catch {
    /* ignore storage errors */
  }
};

const initialState: RegistrationState = {
  credentials: null,
  stepTwo: readStepTwoFromStorage(),
};

const reducer = (state: RegistrationState, action: RegistrationAction): RegistrationState => {
  switch (action.type) {
    case 'setCredentials':
      return { ...state, credentials: action.payload };
    case 'setStepTwo':
      return { ...state, stepTwo: action.payload };
    case 'clear':
      return { credentials: null, stepTwo: null };
    default:
      return state;
  }
};

interface RegistrationContextValue extends RegistrationState {
  setCredentials: (credentials: RegistrationCredentials) => void;
  setStepTwo: (data: RegistrationStepTwoData | null) => void;
  clear: () => void;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export const RegistrationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    writeStepTwoToStorage(state.stepTwo);
  }, [state.stepTwo]);

  const value = useMemo<RegistrationContextValue>(
    () => ({
      ...state,
      setCredentials: (credentials) => dispatch({ type: 'setCredentials', payload: credentials }),
      setStepTwo: (data) => dispatch({ type: 'setStepTwo', payload: data }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [state],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
};

export const useRegistrationDraft = (): RegistrationContextValue => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error('useRegistrationDraft must be used within RegistrationProvider');
  }
  return ctx;
};
