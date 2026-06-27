import { afterEach, describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';

const UTC = { timeZone: 'UTC' };

// A minimal Temporal stub — enough to exercise toTemporal() without a polyfill.
function installTemporalStub() {
  (globalThis as { Temporal?: unknown }).Temporal = {
    Instant: {
      fromEpochMilliseconds(ms: number) {
        return {
          toZonedDateTimeISO(tz: string) {
            return { epochMilliseconds: ms, timeZoneId: tz, toString: () => `${ms}@${tz}` };
          },
        };
      },
    },
  };
}

describe('fromTemporal (duck-typed, no Temporal runtime needed)', () => {
  it('reads epochMilliseconds from an Instant-like value', () => {
    const ms = Date.UTC(2026, 4, 31, 10, 9, 5);
    const d = DoranDate.fromTemporal({ epochMilliseconds: ms }, UTC);
    expect(d.epochMs).toBe(ms);
  });

  it('adopts the time zone from a ZonedDateTime-like value', () => {
    const ms = Date.UTC(2026, 0, 1);
    const d = DoranDate.fromTemporal({ epochMilliseconds: ms, timeZoneId: 'Asia/Tehran' });
    expect(d.epochMs).toBe(ms);
    expect(d.timeZone).toBe('Asia/Tehran');
  });

  it('lets options.timeZone override the value zone', () => {
    const ms = Date.UTC(2026, 0, 1);
    const d = DoranDate.fromTemporal({ epochMilliseconds: ms, timeZoneId: 'Asia/Tehran' }, UTC);
    expect(d.timeZone).toBe('UTC');
  });

  it('interprets a PlainDateTime-like value as wall-clock in the zone', () => {
    const d = DoranDate.fromTemporal({ year: 2026, month: 5, day: 31, hour: 12 }, UTC);
    expect(d.toGregorianParts()).toMatchObject({ year: 2026, month: 5, day: 31, hour: 12 });
  });

  it('throws on an unrecognized shape', () => {
    expect(() => DoranDate.fromTemporal({})).toThrow(TypeError);
  });
});

describe('toTemporal', () => {
  afterEach(() => {
    delete (globalThis as { Temporal?: unknown }).Temporal;
  });

  it('throws when Temporal is unavailable', () => {
    expect(() => DoranDate.fromEpochMs(0, UTC).toTemporal()).toThrow(/Temporal is not available/);
  });

  it('produces a ZonedDateTime at the same instant and zone', () => {
    installTemporalStub();
    const d = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'Asia/Tehran' });
    const z = d.toTemporal();
    expect(z.epochMilliseconds).toBe(d.epochMs);
    expect(z.timeZoneId).toBe('Asia/Tehran');
  });

  it('round-trips through Temporal losslessly', () => {
    installTemporalStub();
    const d = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' });
    expect(DoranDate.fromTemporal(d.toTemporal()).epochMs).toBe(d.epochMs);
  });
});
