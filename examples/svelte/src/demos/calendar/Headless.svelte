<script lang="ts">
  import { DoranDate, resolveLocale } from '@doranjs/core';
  import { createCalendarGrid } from '@doranjs/svelte';

  // Full control: skip <DoranCalendar> and drive your own markup with the
  // createCalendarGrid store. It reuses the shared month-grid logic — cursor is
  // the month in view, grid.weeks the days — so navigation matches the components.
  export let lang: 'fa' | 'en' = 'fa';
  const { cursor, grid, next, prev } = createCalendarGrid();
  let selected: DoranDate = DoranDate.now();

  $: weekdays = resolveLocale(lang).weekdaysMin;
  $: heading = $cursor.withLocale(lang).format('MMMM YYYY');
  const isSelected = (d: DoranDate) => d.isSame(selected, 'day');
</script>

<div>
  <div class="hl-head">
    <button type="button" on:click={prev}>‹</button>
    <strong>{heading}</strong>
    <button type="button" on:click={next}>›</button>
  </div>
  <div class="hl-grid" role="grid">
    {#each weekdays as w}<span class="hl-weekday">{w}</span>{/each}
    {#each $grid.weeks as week}
      {#each week as cell (cell.date.toISOString())}
        <button
          type="button"
          class="hl-day"
          class:hl-day--dim={!cell.inCurrentMonth}
          class:hl-day--sel={isSelected(cell.date)}
          on:click={() => (selected = cell.date)}
        >
          {cell.date.withLocale(lang).format('D')}
        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .hl-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .hl-head strong {
    flex: 1;
    text-align: center;
  }
  .hl-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .hl-weekday {
    text-align: center;
    font-size: 0.75rem;
    color: var(--doran-text-muted);
    padding: 0.25rem 0;
  }
  .hl-day {
    border: 0;
    background: transparent;
    padding: 0.4rem 0;
    border-radius: 8px;
    cursor: pointer;
    color: var(--doran-text);
    font: inherit;
  }
  .hl-day:hover {
    background: var(--doran-surface-muted);
  }
  .hl-day--dim {
    opacity: 0.35;
  }
  .hl-day--sel {
    background: var(--doran-primary);
    color: #fff;
  }
</style>
