import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi';
import { classNames } from '@utils';

type RatingProps = {
  size?: number;
  maxStars?: number;
  value?: number;
  onChange?: (rating: number) => void;
  notHover?: boolean;
};

export const Rating: React.FC<RatingProps> = ({ size = 6, maxStars = 5, value = 0, onChange, notHover = false }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex space-x-0.5">
      {Array.from({ length: maxStars }, (_, index) => {
        const ratingValue = index + 1;
        return (
          <HiStar
            key={ratingValue}
            className={classNames(
              `w-${size} h-${size} cursor-pointer transition`,
              ratingValue <= (hover ?? value) ? 'text-yellow-400' : 'text-gray-300'
            )}
            onClick={() => !notHover && onChange?.(ratingValue)}
            onMouseEnter={() => !notHover && setHover(ratingValue)}
            onMouseLeave={() => !notHover && setHover(null)}
          />
        );
      })}
    </div>
  );
};
