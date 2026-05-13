import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

export const useSkillDetailsNavigation = () => {
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
