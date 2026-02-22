import type userEvent from '@testing-library/user-event';

export type UserEventInstance = ReturnType<typeof userEvent.setup>;
export type ShortcutModifier = 'ctrl' | 'meta';
export type ShortcutTarget = 'description' | 'tags';
