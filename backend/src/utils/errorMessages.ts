export const BAD_REQUEST_MESSAGES = {
  invalidPayload: 'Invalid payload',
  invalidQueryParams: 'Invalid query params',
  invalidExchangeId: 'Invalid exchange id',
  invalidMessagePayload: 'Invalid message payload',
  userIdRequired: 'User id is required',
  cannotDeleteOwnAccount: 'You cannot delete your own account',
  cannotChangeOwnRole: 'You cannot change your own role',
  requestIdRequired: 'Request id is required',
  refreshTokenCookieMissing: 'Refresh token cookie missing'
} as const;
export const NOT_FOUND_MESSAGES = {
  skillCategoryNotFound: 'Skill category not found',
  cityNotFound: 'City not found',
  adminUserNotFound: 'User not found',
  userNotFound: 'Пользователь не найден',
  exchangeNotFound: 'Обмен не найден',
  requestNotFound: 'Заявка не найдена'
} as const;
