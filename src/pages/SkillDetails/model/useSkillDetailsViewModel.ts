import { useMemo } from 'react';
import {
  SKILL_DETAILS_AUTHOR_STATUS_FALLBACK,
  SKILL_DETAILS_DESCRIPTION_FALLBACK,
  SKILL_DETAILS_GALLERY_IMAGES,
  SKILL_DETAILS_LATEST_REVIEWS_LIMIT
} from './constants';
import type {
  UseSkillDetailsViewModelParams,
  UseSkillDetailsViewModelResult
} from './types';

export const useSkillDetailsViewModel = ({
  authorInfo,
  selectedSkill,
  authorRatings
}: UseSkillDetailsViewModelParams): UseSkillDetailsViewModelResult => {
  const galleryImages = useMemo(() => {
    if (selectedSkill?.imageUrls && selectedSkill.imageUrls.length > 0) {
      return selectedSkill.imageUrls;
    }

    if (selectedSkill?.imageUrl) {
      return [selectedSkill.imageUrl];
    }

    if (authorInfo?.avatarUrl) {
      return [authorInfo.avatarUrl];
    }

    return SKILL_DETAILS_GALLERY_IMAGES;
  }, [authorInfo, selectedSkill]);

  const latestRatings = useMemo(
    () => authorRatings.slice(0, SKILL_DETAILS_LATEST_REVIEWS_LIMIT),
    [authorRatings]
  );

  const skillDescription = selectedSkill?.description.trim()
    ? selectedSkill.description
    : SKILL_DETAILS_DESCRIPTION_FALLBACK;
  const authorBio = authorInfo?.bio?.trim() || skillDescription;
  const authorStatus =
    authorInfo?.status ?? SKILL_DETAILS_AUTHOR_STATUS_FALLBACK;

  return {
    galleryImages,
    latestRatings,
    skillDescription,
    authorBio,
    authorStatus
  };
};
