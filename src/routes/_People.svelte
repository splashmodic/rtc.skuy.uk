<script lang="ts">
	import alert from '$lib/alert';
	import MaterialIcon from './_MaterialIcon.svelte';
	export let peopleState: boolean;
	export let peopleSearchValue: string;
</script>

<div class="relative z-10 h-full p-4 pl-0 pb-[5.125rem]">
	<div class="flex flex-col w-[22.5rem] h-full bg-white rounded-lg">
		<div class="flex items-center justify-between h-16 ml-6 mr-1">
			<p class="text-lg leading-6">People</p>
			<button
				class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
				on:click={() => (peopleState = false)}
				><MaterialIcon props={{ type: 'outlined', class: `p-3` }}>close</MaterialIcon></button
			>
		</div>
		<div class="flex justify-between mx-3 text-sm text-black text-opacity-80">
			<button class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30" on:click={alert}>
				<MaterialIcon props={{ type: 'outlined' }}>mic_off</MaterialIcon>
				<p class="mt-2.5">Mute all</p>
			</button>
			<button class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30" on:click={alert}>
				<MaterialIcon props={{ type: 'outlined' }}>person_add</MaterialIcon>
				<p class="mt-2.5">Add people</p>
			</button>
			<button class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30" on:click={alert}>
				<MaterialIcon props={{ type: 'outlined' }}>toggle_on</MaterialIcon>
				<p class="mt-2.5">Host controls</p>
			</button>
		</div>
		<div class="m-4 bg-[#f1f3f4] rounded-3xl flex items-center">
			<MaterialIcon
				props={{
					type: 'outlined',
					class: 'p-3 bg-transparent text-[rgba(60,64,67,0.38)]'
				}}>search</MaterialIcon
			>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				class="w-full mx-4 my-3.5 ml-0 bg-transparent text-sm placeholder-[#5f6368] resize-none outline-none"
				placeholder="Search for people"
				bind:value={peopleSearchValue}
			/>
		</div>
		<div class="flex-1 mx-5 mb-4 text-sm overflow-y-auto">
			<slot />
		</div>
	</div>
</div>
