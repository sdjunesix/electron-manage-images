import { FC, useEffect } from 'react';
import { classNames } from '@utils';

type ImageViewProps = {
  src: string;
  alt?: string;
  className?: string;
};

export const ImageView: FC<ImageViewProps> = ({ src, alt = 'Image', className = '' }) => {

  useEffect(() => {
    fetch('/images/image-empty.png')
      .then(res => console.log(res.status))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className={classNames('rounded-lg border border-line overflow-hidden', className)}>
      <img
      src={src}
      alt={alt}
      className='w-full h-full object-contain'
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/images/image-empty.png';
      }}
    />
    </div>
  );
};
