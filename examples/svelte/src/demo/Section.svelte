<script lang="ts">
  // Groups all demos for one component under a titled, anchorable section.
  export let id: string;
  export let title: string;
  export let intro: string | undefined = undefined;
</script>

<section {id} class="section">
  <header class="section__head">
    <h2 class="section__title">{title}</h2>
    {#if intro}<p class="section__intro">{intro}</p>{/if}
  </header>
  <div class="section__grid">
    <slot />
  </div>
</section>
