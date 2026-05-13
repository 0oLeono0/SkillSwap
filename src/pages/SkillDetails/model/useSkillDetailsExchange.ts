import { useCallback, useEffect, useState } from 'react';
import { createRequest } from '@/features/requests/model/actions';
import {
  SKILL_DETAILS_PROPOSE_BUTTON_LABELS,
  SKILL_DETAILS_PROPOSED_BUTTON_STYLE
} from './constants';
import type {
  UseSkillDetailsExchangeParams,
  UseSkillDetailsExchangeResult
} from './types';

export const useSkillDetailsExchange = ({
  authorId,
  currentAuthor,
  selectedSkill,
  selectedSkillId,
  isAuthenticated,
  hasUser,
  accessToken,
  onAuthRequired
}: UseSkillDetailsExchangeParams): UseSkillDetailsExchangeResult => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProposalSent, setIsProposalSent] = useState(false);

  useEffect(() => {
    setIsProposalSent(false);
    setIsSuccessModalOpen(false);
  }, [selectedSkillId, authorId]);

  const handleProposeExchange = useCallback(async () => {
    if (!selectedSkill || !currentAuthor) {
      return;
    }

    if (!isAuthenticated || !hasUser || !accessToken) {
      onAuthRequired();
      return;
    }

    try {
      await createRequest(accessToken, {
        toUserId: currentAuthor.id,
        userSkillId: selectedSkill.userSkillId
      });
      setIsProposalSent(true);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('[SkillDetails] Failed to create request', err);
    }
  }, [
    accessToken,
    currentAuthor,
    hasUser,
    isAuthenticated,
    onAuthRequired,
    selectedSkill
  ]);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const proposeButtonLabel = isProposalSent
    ? SKILL_DETAILS_PROPOSE_BUTTON_LABELS.sent
    : SKILL_DETAILS_PROPOSE_BUTTON_LABELS.default;
  const proposeButtonStyle = isProposalSent
    ? SKILL_DETAILS_PROPOSED_BUTTON_STYLE
    : undefined;

  return {
    isSuccessModalOpen,
    proposeButtonLabel,
    proposeButtonStyle,
    handleProposeExchange,
    handleCloseSuccessModal
  };
};
