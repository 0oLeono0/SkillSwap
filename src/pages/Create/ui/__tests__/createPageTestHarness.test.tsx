import { screen } from '@testing-library/react';
import { createPageHarness } from './createPageTestHarness';
import {
  createPageActions,
  createPageAssertions,
  createPageQueries
} from './createPageTestHelpers';

jest.mock('./createPageTestHelpers', () => ({
  createPageActions: {
    fillRequiredFields: jest.fn().mockResolvedValue(undefined),
    setBaseDataErrorState: jest.fn(),
    submitByEnterShortcut: jest.fn()
  },
  createPageAssertions: {
    waitForSuccessfulSubmit: jest.fn().mockResolvedValue(undefined)
  },
  createPageQueries: {
    getShortcutTargetInput: jest.fn()
  }
}));

describe('createPageHarness', () => {
  const mockedActions = createPageActions as jest.Mocked<
    typeof createPageActions
  >;
  const mockedAssertions = createPageAssertions as jest.Mocked<
    typeof createPageAssertions
  >;
  const mockedQueries = createPageQueries as jest.Mocked<
    typeof createPageQueries
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page and returns user instance', () => {
    const harness = createPageHarness(<div data-testid='harness-page' />);
    const { user } = harness.renderPage();

    expect(user).toBeDefined();
    expect(screen.getByTestId('harness-page')).toBeInTheDocument();
  });

  it('fills required fields on renderFilledPage', async () => {
    const harness = createPageHarness(<div />);
    const renderResult = await harness.renderFilledPage();

    expect(renderResult.user).toBeDefined();
    expect(mockedActions.fillRequiredFields).toHaveBeenCalledWith(
      renderResult.user
    );
  });

  it('sets base data error before rendering page', () => {
    const harness = createPageHarness(<div data-testid='base-data-error' />);
    harness.renderPageWithBaseDataError();

    expect(mockedActions.setBaseDataErrorState).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('base-data-error')).toBeInTheDocument();
  });

  it('runs shortcut submit flow through helpers', async () => {
    const focus = jest.fn();
    const input = { focus } as unknown as HTMLElement;
    mockedQueries.getShortcutTargetInput.mockReturnValue(input);

    const harness = createPageHarness(<div />);
    await harness.submitWithKeyboardShortcutAndExpectSuccess(
      'description',
      'ctrl'
    );

    expect(mockedQueries.getShortcutTargetInput).toHaveBeenCalledWith(
      'description'
    );
    expect(focus).toHaveBeenCalledTimes(1);
    expect(mockedActions.submitByEnterShortcut).toHaveBeenCalledWith(
      input,
      'ctrl'
    );
    expect(mockedAssertions.waitForSuccessfulSubmit).toHaveBeenCalledTimes(1);
  });
});
