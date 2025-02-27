import { FC } from 'react';
import { FaCheck } from 'react-icons/fa';
import { ImageView, Rating, Tag } from '@components';

interface ImageCardProps {
  src: string;
  title: string;
  tags: string[];
  version: string;
  rating: number;
}

const ImageCard: FC<ImageCardProps> = ({ src, title, tags = [], version, rating }) => {
  return (
    <div className="relative group cursor-pointer">
      <ImageView src={src} />
      <div className="absolute inset-0 bg-black/50 text-white rounded-lg space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
        <h3 className="font-medium">{title}</h3>
        <p className="flex items-center space-x-2">
          {tags.map((tag, index) => (
            <Tag key={index} value={tag} className="bg-white/20 border-none" />
          ))}
        </p>
        <p className="flex items-center space-x-2">
          <FaCheck className="text-green-500" />
          <Tag value={version} />
        </p>
        <Rating value={rating} notHover size={4} />
      </div>
    </div>
  );
};

export default ImageCard;