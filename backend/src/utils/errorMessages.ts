export const BAD_REQUEST_MESSAGES = {
  invalidPayload: 'Invalid payload',
  invalidQueryParams: 'Invalid query params',
  invalidExchangeId: 'Invalid exchange id',
  invalidMessagePayload: 'Invalid message payload',
  invalidRatingPayload: 'Invalid rating payload',
  userIdRequired: 'User id is required',
  cannotDeleteOwnAccount: 'You cannot delete your own account',
  cannotChangeOwnRole: 'You cannot change your own role',
  requestIdRequired: 'Request id is required',
  userSkillIdRequired: 'User skill id is required',
  materialIdRequired: 'Material id is required',
  questionIdRequired: 'Question id is required',
  optionIdRequired: 'Answer option id is required',
  refreshTokenCookieMissing: 'Refresh token cookie missing'
} as const;
export const NOT_FOUND_MESSAGES = {
  skillCategoryNotFound: 'Skill category not found',
  cityNotFound: 'City not found',
  adminUserNotFound: 'User not found',
  userNotFound: 'Пользователь не найден',
  exchangeNotFound: 'Обмен не найден',
  requestNotFound: 'Заявка не найдена',
  userSkillNotFound: 'Навык пользователя не найден',
  materialNotFound: 'Материал не найден',
  questionNotFound: 'Вопрос не найден',
  answerOptionNotFound: 'Вариант ответа не найден'
} as const;
