import type { CSSProperties } from 'react';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';
import type { UserStatus } from '@/shared/types/userStatus';

export const SKILL_DETAILS_AUTHOR_PAGE = 1;
export const SKILL_DETAILS_AUTHOR_PAGE_SIZE = 1;
export const SKILL_DETAILS_RELATED_AUTHORS_PAGE = 1;
export const SKILL_DETAILS_RELATED_AUTHORS_LIMIT = 4;
export const SKILL_DETAILS_LATEST_REVIEWS_LIMIT = 3;

export const SKILL_DETAILS_GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

export const SKILL_DETAILS_AUTHOR_STATUS_FALLBACK: UserStatus = 'inactive';

export const SKILL_DETAILS_AUTHOR_LOAD_ERROR =
  'Не удалось загрузить информацию о навыке';

export const SKILL_DETAILS_MATERIALS_LOAD_ERROR =
  'Не удалось загрузить материалы';

export const SKILL_DETAILS_DESCRIPTION_FALLBACK =
  'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

export const SKILL_DETAILS_FAVORITE_BUTTON_LABELS = {
  active: 'Убрать из избранного',
  inactive: 'Добавить в избранное'
};

export const SKILL_DETAILS_PROPOSE_BUTTON_LABELS = {
  sent: 'Обмен предложен',
  default: 'Предложить обмен'
};

export const SKILL_DETAILS_PROPOSED_BUTTON_STYLE: CSSProperties = {
  backgroundColor: '#fff',
  color: '#000',
  borderColor: 'var(--button-color-accent)'
};
