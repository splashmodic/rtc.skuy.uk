<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button class="flex items-center justify-center w-12 h-12 rounded hover:bg-[rgba(255,255,255,.15)]" on:click={() => dispatch('click')}>
	<slot />
</button>
