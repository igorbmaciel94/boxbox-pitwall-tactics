import { useState } from 'react';

interface GameImageProps {
  src: string;
  fallbackGradient: string;
  alt: string;
  className?: string;
}

/**
 * Image component with graceful fallback to a CSS gradient.
 * If the image fails to load (404), it shows the gradient instead.
 */
export function GameImage({ src, fallbackGradient, alt, className = '' }: GameImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        style={{ background: fallbackGradient }}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
