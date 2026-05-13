import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import type { UseSkillDetailsNavigationResult } from './types';

export const useSkillDetailsNavigation =
  (): UseSkillDetailsNavigationResult => {
    const navigate = useNavigate();

    const handleDetailsClick = useCallback(
      (targetAuthorId: string) => {
        navigate(ROUTES.SKILL_DETAILS.replace(':authorId', targetAuthorId));
      },
      [navigate]
    );

    return {
      handleDetailsClick
    };
  };
