<svelte:options immutable={true} />

<script lang="ts">
	export let chat: { name: string; time: string; message: string; continue: boolean };
</script>

<div class={`w-11/12 ${chat.continue ? '-mt-1 mb-3' : 'my-3'}`}>
	{#if !chat.continue}
		<div class="flex">
			<p class="mr-2 font-semibold text-black">{chat.name}</p>
			<p class="text-black text-opacity-50">{chat.time}</p>
		</div>
	{/if}
	<p class="whitespace-pre-wrap" class:ml-auto={chat.name === 'You'}>{chat.message}</p>
</div>
