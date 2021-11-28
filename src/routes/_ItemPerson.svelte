<svelte:options immutable={true} />

<script lang="ts">
	import alert from '$lib/alert';
	import MaterialIcon from './_MaterialIcon.svelte';
	export let name: string;
	export let audioState: boolean;
	export let setAudio: Function;
</script>

<div class="flex items-center my-3.5">
	<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#512da8]">
		<p class="text-lg text-white">{name[0].toUpperCase()}</p>
	</div>
	<div class="w-[11.25rem] flex ml-2.5">
		<p class="truncate" title={name}>{name}</p>
		<p class="ml-1">(You)</p>
	</div>
	<div class="ml-auto flex">
		<button
			class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
			on:click={() => setAudio(!audioState)}
		>
			{#if audioState}
				<MaterialIcon props={{ type: 'outlined', class: 'p-2 text-blue-500' }}>mic</MaterialIcon>
			{:else}
				<MaterialIcon
					props={{
						type: 'outlined',
						class: 'p-2 text-black text-opacity-60'
					}}>mic_off</MaterialIcon
				>
			{/if}
		</button>
		<button class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30" on:click={alert}>
			<MaterialIcon props={{ type: 'outlined', class: 'p-2' }}>more_vert</MaterialIcon>
		</button>
	</div>
</div>
