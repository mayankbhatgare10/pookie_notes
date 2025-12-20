'use client';

import Image from 'next/image';

interface PixelatedAvatarProps {
  type: 'jethalal' | 'akshay' | 'paresh' | 'pankaj' | 'rinki' | 'daya' | 'manju' | 'sameer';
  size?: number;
  className?: string;
}

const avatarMap = {
  jethalal: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMk6lcvA5DQsovOQWFnVXDJCKUY0qyr4Twfg3Lj',
  akshay: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkXbKQUKyrvdbCJVLp3ko4jSUNziI2WOPhfQZu',
  paresh: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkUQ0UeyWw29eb6oTiG08cDalx1YEUuzKdjVRL',
  pankaj: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkGka3ZY8Z7IcCew6jWUGf3rsahQnYMBEXyPlV',
  rinki: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMk4od5rYkjfEORPJqZTCINkBpHzcYVMrsQa2oi',
  daya: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkQRnnzCczsF14nHmwfvk0t52guSxMDObNpyZW',
  manju: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkpQNeuQLSDjrxk5fIEinhvHqN1Pdc9VLG4Ww0',
  sameer: 'https://z3759y9was.ufs.sh/f/SFmIfV4reUMkkj2wWBRGQSTlZ27FWrA1ePdJU4NkV53zMnHR',
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
