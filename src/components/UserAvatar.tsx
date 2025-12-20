'use client';

import Image from 'next/image';
import PixelatedAvatar from './PixelatedAvatar';

interface UserAvatarProps {
    avatar?: string;
    size?: number;
    className?: string;
}

export default function UserAvatar({ avatar, size = 40, className = '' }: UserAvatarProps) {
    // Check if it's a data URL (uploaded image)
    const isDataURL = avatar?.startsWith('data:');

    // Check if it's a URL (http/https)
    const isURL = avatar?.startsWith('http');

    // Check if it's one of our pixelated avatar types
    const pixelatedTypes = ['jethalal', 'akshay', 'daya', 'paresh', 'pankaj', 'manju', 'sameer', 'rinki'];
    const isPixelatedAvatar = avatar && pixelatedTypes.includes(avatar);

    return (
        <div className={className} style={{ width: size, height: size }}>
            {isDataURL || isURL ? (
                // Uploaded image or external URL
                <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            ) : isPixelatedAvatar ? (
                // Pixelated avatar
                <PixelatedAvatar
                    type={avatar as 'jethalal' | 'akshay' | 'daya' | 'paresh' | 'pankaj' | 'manju' | 'sameer' | 'rinki'}
                    size={size}
                />
            ) : (
                // Default fallback
                <Image
                    src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                    alt="Profile"
                    width={size}
                    height={size}
                    className="object-cover"
                    unoptimized
                />
            )}
        </div>
    );
}
