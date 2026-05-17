'use client';

import Image from 'next/image';

export function SafeImage({ src, alt, ...props }: any) {
  const safeSrc =
    typeof src === 'string' && (src.includes('res.cloudinary.com') || src.includes('picsum.photos') || src.startsWith('/') || src.startsWith('blob:'))
      ? src
      : '/placeholder.png';

  return <Image src={safeSrc} alt={alt || ""} {...props} />;
}
