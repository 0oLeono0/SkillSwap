import { useState } from 'react';
import { Toast } from '@/shared/ui/Toast/Toast';
import { createRequest } from '@/features/requests/model/actions';
import { Button } from '@/shared/ui/button/Button';

interface SkillExchangeButtonProps {
  accessToken: string;
  toUserId: string;
  userSkillId: string;
  onSuccess?: () => void;
}

export const SkillExchangeButton = ({
  accessToken,
  toUserId,
  userSkillId,
  onSuccess
}: SkillExchangeButtonProps) => {
  const [isShow, setIsShow] = useState(false);
  const [isHide, setIsHide] = useState(false);

  const handleClick = async () => {
    try {
      await createRequest(accessToken, { toUserId, userSkillId });
      setIsShow(true);
      setIsHide(false);
      onSuccess?.();
    } catch (error) {
      console.error('[SkillExchangeButton] Failed to create request', error);
    }
  };

  const handleClose = () => {
    setIsHide(true);
    setTimeout(() => setIsShow(false), 300);
  };

  return (
    <>
      <Button variant='primary' onClick={handleClick}>
        Предложить обмен
      </Button>

      {isShow && (
        <Toast
          message='Заявка отправлена!'
          isShow={isShow}
          isHide={isHide}
          onClose={handleClose}
        />
      )}
    </>
  );
};
