import { createBadRequest } from './httpErrors.js';
import { BAD_REQUEST_MESSAGES } from './errorMessages.js';

type SafeParseSuccess<TData> = {
  success: true;
  data: TData;
};

type SafeParseFailure = {
  success: false;
  error: {
    flatten: () => unknown;
  };
};

type SafeParseResult<TData> = SafeParseSuccess<TData> | SafeParseFailure;

type SafeParseSchema<TData> = {
  safeParse: (value: unknown) => SafeParseResult<TData>;
};

export const parseOrBadRequest = <TData>(
  schema: SafeParseSchema<TData>,
  value: unknown,
  message: string = BAD_REQUEST_MESSAGES.invalidPayload
): TData => {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw createBadRequest(message, result.error.flatten());
  }

  return result.data;
};
