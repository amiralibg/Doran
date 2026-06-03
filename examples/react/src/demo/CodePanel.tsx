import { useEffect, useState } from 'react';
import { useTheme } from '@doranjs/ui';
import { useLang } from '../i18n/LangProvider';
import { CODE_THEMES, getHighlighter } from './highlighter';

export interface CodePanelProps {
  /** Raw source text of the demo, imported via `?raw`. */
  code: string;
  /** Language grammar to highlight with. Defaults to `tsx`. */
  lang?: string;
}

/**
 * Renders a demo's source with Shiki syntax highlighting and a copy button. The
 * highlight theme follows the app's light/dark mode, and the code is always LTR
 * regardless of page direction. Pass the result of a `?raw` import so what's
 * shown is exactly what runs.
 */
export function CodePanel({ code, lang = 'tsx' }: CodePanelProps) {
  const { mode } = useTheme();
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((hl) => {
        const out = hl.codeToHtml(code.trimEnd(), {
          lang,
          theme: mode === 'dark' ? CODE_THEMES.dark : CODE_THEMES.light,
        });
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml('');
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, mode]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-panel" dir="ltr">
      <div className="code-panel__bar">
        <span className="code-panel__lang">{lang}</span>
        <button type="button" className="code-panel__copy" onClick={copy}>
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      {html ? (
        <div className="code-panel__shiki" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        // Before Shiki resolves, show the raw source so nothing flashes empty.
        <pre className="code-panel__pre">
          <code>{code.trimEnd()}</code>
        </pre>
      )}
    </div>
  );
}
