import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import {
  createPageActions,
  createPageAssertions,
  createPageQueries
} from './createPageTestHelpers';
import type {
  ShortcutModifier,
  ShortcutTarget,
  UserEventInstance
} from './createPageTestTypes';

type CreatePageHarness = {
  renderFilledPage: () => Promise<{ user: UserEventInstance }>;
  renderPage: () => { user: UserEventInstance };
  renderPageWithBaseDataError: () => { user: UserEventInstance };
  submitWithKeyboardShortcutAndExpectSuccess: (
    target: ShortcutTarget,
    modifier: ShortcutModifier
  ) => Promise<void>;
};

export const createPageHarness = (page: ReactElement): CreatePageHarness => {
  const renderPage = () => {
    const user = userEvent.setup();
    render(page);
    return { user };
  };

  const renderFilledPage = async () => {
    const renderResult = renderPage();
    await createPageActions.fillRequiredFields(renderResult.user);
    return renderResult;
  };

  const renderPageWithBaseDataError = () => {
    createPageActions.setBaseDataErrorState();
    return renderPage();
  };

  const submitWithKeyboardShortcutAndExpectSuccess = async (
    target: ShortcutTarget,
    modifier: ShortcutModifier
  ) => {
    await renderFilledPage();
    const input = createPageQueries.getShortcutTargetInput(target);
    input.focus();
    createPageActions.submitByEnterShortcut(input, modifier);
    await createPageAssertions.waitForSuccessfulSubmit();
  };

  return {
    renderFilledPage,
    renderPage,
    renderPageWithBaseDataError,
    submitWithKeyboardShortcutAndExpectSuccess
  };
};
