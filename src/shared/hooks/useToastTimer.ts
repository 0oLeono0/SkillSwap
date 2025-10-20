import { useEffect } from "react";

export const useToastTimer = (
  isShow: boolean,
  isHide: boolean,
  hovered: boolean,
  onClose: () => void,
  timeout = 5000
) => {
  useEffect(() => {
    if (isShow && !isHide && !hovered) {
      const timer = setTimeout(onClose, timeout);
      return () => clearTimeout(timer);
    }
  }, [isShow, isHide, hovered, onClose, timeout]);
};