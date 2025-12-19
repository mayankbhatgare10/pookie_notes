'use client';

import Image from 'next/image';

interface PixelatedAvatarProps {
  type: 'jethalal' | 'akshay' | 'paresh' | 'pankaj' | 'rinki' | 'daya' | 'manju' | 'sameer';
  size?: number;
  className?: string;
}

const avatarMap = {
  jethalal: '/avatars/jethalal.png',
  akshay: '/avatars/akshay.png',
  paresh: '/avatars/paresh.png',
  pankaj: '/avatars/pankaj.png',
  rinki: '/avatars/rinki.png',
  daya: '/avatars/daya.png',
  manju: '/avatars/manju.png',
  sameer: '/avatars/sameer.png',
};

export default function PixelatedAvatar({ type, size = 96, className = '' }: PixelatedAvatarProps) {
  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarMap[type]}
        alt={`${type} avatar`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
        unoptimized
      />
    </div>
  );
}
