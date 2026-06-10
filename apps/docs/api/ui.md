# @doranjs/ui

یک design systemِ مینیمال، accessible و قابل theme.

```ts
import '@doranjs/ui/styles.css';
import { ThemeProvider, useTheme, Button, cn, tokens } from '@doranjs/ui';
```

## Theming

```tsx
<ThemeProvider defaultMode="light" direction="rtl">
  <App />
</ThemeProvider>;

const { mode, toggleMode } = useTheme();
```

design tokenها CSS variableهای ساده‌اند (`--doran-primary`، `--doran-surface`، …) با themeهای
روشن و تیره، پس این سیستم با Tailwind سازگار است. آن‌ها را در JS از طریق export‌ِ `tokens` آینه کنید.

### گروه‌های token

| گروه  | نمونه‌ها                                                                                    |
| ----- | ------------------------------------------------------------------------------------------- |
| رنگ   | `--doran-primary`، `--doran-surface`، `--doran-border`، `--doran-holiday`، `--doran-accent` |
| گردی  | `--doran-radius-sm \| md \| lg \| full`                                                     |
| فاصله | `--doran-space-xs \| sm \| md \| lg`                                                        |
| فونت  | `--doran-font-sans`، `--doran-font-weight-medium \| semibold \| bold`                       |
| سایه  | `--doran-shadow-sm \| md \| lg`                                                             |

کامپوننت‌های تقویم variableهای ریزدانه‌ترِ هر بخش را اضافه می‌کنند (مثلاً `--doran-calendar-bg`،
`--doran-day-selected-bg`، `--doran-day-today-ring`، `--doran-calendar-arrow-color`،
`--doran-calendar-radius`، `--doran-calendar-shadow`) که همه به این tokenهای سراسری fallback
می‌کنند — هر کدام را روی یک instance واحد override کنید تا فقط همان بخش بازطراحی شود.

## کامپوننت‌ها

- `Button` — `variant`: `primary | ghost | outline`، به‌علاوهٔ یک حالت `icon`.
- `cn(...values)` — یک helperِ کوچکِ `classNames` (مقادیر falsy را مثل `clsx` حذف می‌کند).
- آیکن‌ها — `ChevronRightIcon`، `ChevronLeftIcon`، `ChevronUpIcon`، `ChevronDownIcon`،
  `CalendarIcon`، `ClockIcon` (SVGهای currentColor که با `font-size` اندازه می‌گیرند).
