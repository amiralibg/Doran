import { DoranDate } from '@doranjs/core';
import { parse } from '@doranjs/nlp';
import { getHolidays } from '@doranjs/holidays';

// A scratch file for quick experiments. Run with: pnpm --filter @doranjs/playground start
const today = DoranDate.now();
console.log('Today:', today.format('dddd D MMMM YYYY'));
console.log('In 10 days:', today.addDays(10).format('YYYY/MM/DD'));
console.log('NLP «فردا»:', parse('فردا')?.date.format('YYYY/MM/DD'));
console.log(
  'Official holidays this year:',
  getHolidays(today.year).filter((h) => h.official).length,
);
