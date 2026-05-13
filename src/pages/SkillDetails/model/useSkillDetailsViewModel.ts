import { useMemo } from 'react';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';
import type {
  UseSkillDetailsViewModelParams,
  UseSkillDetailsViewModelResult
} from './types';

const LATEST_REVIEWS_LIMIT = 3;

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SKILL_DESCRIPTION_FALLBACK =
  'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

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

    return GALLERY_IMAGES;
  }, [authorInfo, selectedSkill]);

  const latestRatings = useMemo(
    () => authorRatings.slice(0, LATEST_REVIEWS_LIMIT),
    [authorRatings]
  );

  const skillDescription = selectedSkill?.description.trim()
    ? selectedSkill.description
    : SKILL_DESCRIPTION_FALLBACK;
  const authorBio = authorInfo?.bio?.trim() || skillDescription;
  const authorStatus = authorInfo?.status ?? 'inactive';

  return {
    galleryImages,
    latestRatings,
    skillDescription,
    authorBio,
    authorStatus
  };
};
