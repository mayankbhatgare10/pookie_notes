'use client';

import Image from 'next/image';

// Import avatars from assets
import jethalalAvatar from '@/assets/avatars/jethalal.png';
import akshayAvatar from '@/assets/avatars/akshay.png';
import pareshAvatar from '@/assets/avatars/paresh.png';
import pankajAvatar from '@/assets/avatars/pankaj.png';
import rinkiAvatar from '@/assets/avatars/rinki.png';
import dayaAvatar from '@/assets/avatars/daya.png';
import manjuAvatar from '@/assets/avatars/manju.png';
import sameerAvatar from '@/assets/avatars/sameer.png';

interface PixelatedAvatarProps {
  type: 'jethalal' | 'akshay' | 'paresh' | 'pankaj' | 'rinki' | 'daya' | 'manju' | 'sameer';
  size?: number;
  className?: string;
}

const avatarMap = {
  jethalal: jethalalAvatar,
  akshay: akshayAvatar,
  paresh: pareshAvatar,
  pankaj: pankajAvatar,
  rinki: rinkiAvatar,
  daya: dayaAvatar,
  manju: manjuAvatar,
  sameer: sameerAvatar,
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
