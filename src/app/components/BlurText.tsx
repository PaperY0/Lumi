import { useEffect, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'chars';
  direction?: 'bottom' | 'top';
  className?: string;
  style?: React.CSSProperties;
  startDelay?: number;
}

/* BlurText — React Bits style, words blur-in from bottom */
export function BlurText({
  text,
  delay = 100,
  animateBy = 'words',
  direction = 'bottom',
  className = '',
  style = {},
  startDelay = 0,
}: BlurTextProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), startDelay + 60);
    return () => clearTimeout(t);
  }, [startDelay]);

  const units = animateBy === 'words' ? text.split(' ') : text.split('');
  const translateY = direction === 'bottom' ? '14px' : '-14px';

  return (
    <span className={className} style={{ display: 'inline', ...style }} aria-label={text}>
      {units.map((unit, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            display: 'inline-block',
            marginRight: animateBy === 'words' ? '0.28em' : '0.02em',
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : 'blur(10px)',
            transform: visible ? 'translateY(0)' : `translateY(${translateY})`,
            transition: [
              `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${startDelay + i * delay}ms`,
              `filter 0.65s cubic-bezier(0.22,1,0.36,1) ${startDelay + i * delay}ms`,
              `transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${startDelay + i * delay}ms`,
            ].join(', '),
          }}
        >
          {unit}
        </span>
      ))}
    </span>
  );
}
