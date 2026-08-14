import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import FlightFares from '../demos/widgets/FlightFares';
import FlightFaresSrc from '../demos/widgets/FlightFares?raw';
import EventDots from '../demos/widgets/EventDots';
import EventDotsSrc from '../demos/widgets/EventDots?raw';
import HotelAvailability from '../demos/widgets/HotelAvailability';
import HotelAvailabilitySrc from '../demos/widgets/HotelAvailability?raw';
import LegendAside from '../demos/widgets/LegendAside';
import LegendAsideSrc from '../demos/widgets/LegendAside?raw';

export function WidgetsSection() {
  const { t, locale } = useLang();
  return (
    <Section id="widgets" title="Day widgets & slots" intro={t('wgIntro')}>
      <DemoCard title={t('wgFaresTitle')} description={t('wgFaresDesc')} code={FlightFaresSrc}>
        <FlightFares locale={locale} />
      </DemoCard>
      <DemoCard title={t('wgEventsTitle')} description={t('wgEventsDesc')} code={EventDotsSrc}>
        <EventDots locale={locale} />
      </DemoCard>
      <DemoCard
        title={t('wgHotelTitle')}
        description={t('wgHotelDesc')}
        code={HotelAvailabilitySrc}
      >
        <HotelAvailability locale={locale} />
      </DemoCard>
      <DemoCard title={t('wgSlotsTitle')} description={t('wgSlotsDesc')} code={LegendAsideSrc}>
        <LegendAside locale={locale} />
      </DemoCard>
    </Section>
  );
}
