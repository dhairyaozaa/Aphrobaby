import type { ReactNode } from 'react';
import { Sprig } from './art';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
  id?: string;
}

export function SectionHeading({ eyebrow, title, lede, align = 'left', action, id }: SectionHeadingProps) {
  return (
    <header className={`section-head section-head--${align}`}>
      <div className="section-head__text">
        <p className="eyebrow">
          <Sprig className="eyebrow__sprig" />
          <span>{eyebrow}</span>
        </p>
        <h2 className="section-head__title" id={id}>
          {title}
        </h2>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {action ? <div className="section-head__action">{action}</div> : null}
    </header>
  );
}
