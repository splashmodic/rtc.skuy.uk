<svelte:options immutable={true} />

<script lang="ts">
	export let chat: { name: string; time: string; message: string; continue: boolean };
</script>

<div class={`${chat.continue ? '-mt-1 mb-3' : 'my-3'}`}>
	{#if !chat.continue}
		<div class="flex">
			<p class="font-semibold text-black truncate">{chat.name}</p>
			<p class="ml-2 text-black text-opacity-50 whitespace-nowrap">{chat.time}</p>
		</div>
	{/if}
	<p class="whitespace-pre-wrap break-words">{chat.message}</p>
</div>
