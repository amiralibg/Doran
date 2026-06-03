import { Button } from '@doranjs/ui';

// The design-system's base <Button> across its variants.
export default function ButtonDemo() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button variant="primary">اصلی</Button>
      <Button variant="outline">طرح‌دار</Button>
      <Button variant="ghost">ساده</Button>
    </div>
  );
}
