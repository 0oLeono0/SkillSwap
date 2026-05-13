import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkillDetailsModals } from './SkillDetailsModals';

const meta: Meta<typeof SkillDetailsModals> = {
  title: 'Pages/SkillDetails/SkillDetailsModals',
  component: SkillDetailsModals,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;
type Story = StoryObj<typeof SkillDetailsModals>;

const handlers = {
  onCloseAuthModal: () => undefined,
  onCloseSuccessModal: () => undefined,
  onLoginRedirect: () => undefined,
  onRegisterRedirect: () => undefined
};

export const AuthPrompt: Story = {
  args: {
    ...handlers,
    isAuthModalOpen: true,
    isSuccessModalOpen: false
  }
};

export const ExchangeSuccess: Story = {
  args: {
    ...handlers,
    isAuthModalOpen: false,
    isSuccessModalOpen: true
  }
};
