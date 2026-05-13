import clsx from 'clsx';

type FavoriteButtonClassNameParams = {
  isFavorite: boolean;
  actionButtonClassName: string;
  activeClassName: string;
};

export const getFavoriteButtonClassName = ({
  isFavorite,
  actionButtonClassName,
  activeClassName
}: FavoriteButtonClassNameParams) =>
  clsx(actionButtonClassName, {
    [activeClassName]: isFavorite
  });
