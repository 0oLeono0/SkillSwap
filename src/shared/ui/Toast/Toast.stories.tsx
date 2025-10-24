import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast, type ToastProps } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  argTypes: {
    message: { control: 'text' },
    isShow: { control: 'boolean' },
    isHide: { control: 'boolean' },
    onAction: { action: 'onAction' },
    onClose: { action: 'onClose' },
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    message: 'Олег предлагает вам обмен',
    isShow: true,
    isHide: false,
    onAction: () => alert('Кнопка «Показать» нажата'),
    onClose: () => console.log('Toast закрыт'),
  },
  render: (args: ToastProps) => {
    const [isShow, setIsShow] = useState(args.isShow);
    const [isHide, setIsHide] = useState(args.isHide);

    useEffect(() => {
      setIsShow(args.isShow);
      setIsHide(args.isHide);
    }, [args.isShow, args.isHide]);

    const handleClose = () => {
      args.onClose();
      setIsHide(true);
      setTimeout(() => setIsShow(false), 300);
    };

    return (
      <>
        {isShow && (
          <Toast
            {...args}
            isShow={isShow}
            isHide={isHide}
            onClose={handleClose}
          />
        )}
        {!isShow && (
          <button
            type="button"
            onClick={() => {
              setIsShow(true);
              setIsHide(false);
            }}
            style={{
              marginTop: 10,
              padding: '6px 12px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Показать Toast заново
          </button>
        )}
      </>
    );
  },
};
