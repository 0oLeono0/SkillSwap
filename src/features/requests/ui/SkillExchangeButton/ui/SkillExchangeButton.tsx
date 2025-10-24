import { useState } from 'react';
import { Toast } from '@/shared/ui/Toast/Toast';
import { createRequest } from '@/features/requests/model/actions';
import { Button } from '@/shared/ui/button/Button';

interface SkillExchangeButtonProps {
  fromUserId: number;
  toUserId: number;
  skillId: string;
}

export const SkillExchangeButton = ({
  fromUserId,
  toUserId,
  skillId,
}: SkillExchangeButtonProps) => {
  const [isShow, setIsShow] = useState(false);
  const [isHide, setIsHide] = useState(false);

  const handleClick = () => {
    createRequest(fromUserId, toUserId, skillId);
    setIsShow(true);
    setIsHide(false);
  };

  const handleClose = () => {
    setIsHide(true);
    setTimeout(() => setIsShow(false), 300);
  };

  return (
    <>
      <Button variant="primary" onClick={handleClick}>
        Предложить обмен
      </Button>

      {isShow && (
        <Toast
          message="Вы предложили обмен!"
          isShow={isShow}
          isHide={isHide}
          onClose={handleClose}
        />
      )}
    </>
  );
};
