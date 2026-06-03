import { getLang, onLangChange, t } from '../i18n/lang';
import { getTheme, onThemeChange } from '../theme';
import { CODE_THEMES, getHighlighter } from './highlighter';
import { el } from './dom';

export interface CardOptions {
  /** Dictionary key for the demo title. */
  titleKey: string;
  /** Dictionary key for the one-line description. */
  descKey: string;
  /** Raw source of the demo, imported via `?raw`. */
  code: string;
  /** Span the full grid row — for wide demos like multi-month or the agenda. */
  wide?: boolean;
  /** Builds the live demo for the given WC `locale` attribute ('fa' | 'en'). */
  build: (locale: string) => HTMLElement;
}

/**
 * A single demo card: a live preview that re-mounts when the language changes,
 * plus a one-click "show code" panel with Shiki highlighting that follows the
 * theme. Mirrors the React `<DemoCard>`.
 */
export function createCard(opts: CardOptions): HTMLElement {
  const card = el('div', opts.wide ? 'demo demo--wide' : 'demo');

  const head = el('div', 'demo__head');
  const info = el('div');
  const title = el('h3', 'demo__title');
  const desc = el('p', 'demo__desc');
  info.append(title, desc);
  const toggle = el('button', 'demo__toggle');
  toggle.type = 'button';
  head.append(info, toggle);

  const preview = el('div', 'demo__preview');
  const panelHost = el('div');
  card.append(head, preview, panelHost);

  let open = false;

  function mount(): void {
    preview.replaceChildren(opts.build(getLang()));
  }

  function syncText(): void {
    title.textContent = t(opts.titleKey);
    desc.textContent = t(opts.descKey);
    toggle.textContent = open ? t('hideCode') : `‹ › ${t('showCode')}`;
  }

  function renderCode(): void {
    panelHost.replaceChildren(open ? createCodePanel(opts.code) : '');
  }

  toggle.addEventListener('click', () => {
    open = !open;
    renderCode();
    syncText();
  });

  mount();
  syncText();
  onLangChange(() => {
    syncText();
    mount();
  });
  onThemeChange(() => {
    if (open) renderCode();
  });

  return card;
}

/** The code panel: a bar (lang label + copy) and the Shiki-highlighted source. */
function createCodePanel(code: string): HTMLElement {
  const panel = el('div', 'code-panel');
  panel.dir = 'ltr';

  const bar = el('div', 'code-panel__bar');
  const lang = el('span', 'code-panel__lang');
  lang.textContent = 'ts';
  const copy = el('button', 'code-panel__copy');
  copy.type = 'button';
  copy.textContent = t('copy');
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code);
    copy.textContent = t('copied');
    setTimeout(() => (copy.textContent = t('copy')), 1500);
  });
  bar.append(lang, copy);

  // Raw-text fallback shown until Shiki resolves, so nothing flashes empty.
  const body = el('div', 'code-panel__shiki');
  const pre = el('pre', 'code-panel__pre');
  const codeEl = el('code');
  codeEl.textContent = code.trimEnd();
  pre.append(codeEl);
  body.append(pre);

  panel.append(bar, body);

  getHighlighter()
    .then((hl) => {
      body.innerHTML = hl.codeToHtml(code.trimEnd(), {
        lang: 'typescript',
        theme: getTheme() === 'dark' ? CODE_THEMES.dark : CODE_THEMES.light,
      });
    })
    .catch(() => {
      /* keep the fallback */
    });

  return panel;
}
