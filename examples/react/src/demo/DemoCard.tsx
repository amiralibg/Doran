import { type ReactNode, useId, useState } from 'react';
import { useLang } from '../i18n/LangProvider';
import { CodePanel } from './CodePanel';

export interface DemoCardProps {
  /** Short title for this single variation. */
  title: ReactNode;
  /** One-line explanation of what the variation demonstrates. */
  description?: ReactNode;
  /** Raw source of the demo, imported via `?raw`, shown when "code" is toggled. */
  code: string;
  /** Span the full grid row — for wide demos like multi-month or the agenda. */
  wide?: boolean;
  /** The live demo. */
  children: ReactNode;
}

/**
 * A single demo: a live component on top, and a one-click "show code" panel that
 * reveals the exact source that produced it. The building block that turns the
 * examples app into a browsable visual doc.
 */
export function DemoCard({ title, description, code, wide, children }: DemoCardProps) {
  const { t } = useLang();
  const [showCode, setShowCode] = useState(false);
  const panelId = useId();

  return (
    <div className={wide ? 'demo demo--wide' : 'demo'}>
      <div className="demo__head">
        <div>
          <h3 className="demo__title">{title}</h3>
          {description ? <p className="demo__desc">{description}</p> : null}
        </div>
        <button
          type="button"
          className="demo__toggle"
          aria-expanded={showCode}
          aria-controls={panelId}
          onClick={() => setShowCode((v) => !v)}
        >
          {showCode ? t('hideCode') : <>‹ › {t('showCode')}</>}
        </button>
      </div>

      <div className="demo__preview">{children}</div>

      {showCode ? (
        <div id={panelId}>
          <CodePanel code={code} />
        </div>
      ) : null}
    </div>
  );
}
