<script context="module" lang="ts">
	import { getItem } from '$lib/storage';
	export async function load({ fetch }) {
		let dark: boolean;
		switch (getItem('dark')) {
			case 'true':
				dark = true;
				break;
			default:
				dark = false;
				break;
		}
		async function generatorMeetCode() {
			return (await (await fetch('/api/randomword')).json()).wordlist;
		}
		return {
			props: {
				dark,
				generatedMeetCode: await generatorMeetCode(),
				generatorMeetCode
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { setItem } from '$lib/storage';
	import MaterialIconOutlined from './_MaterialIconOutlined.svelte';

	export let dark: boolean;
	export let generatedMeetCode: string;
	export let generatorMeetCode: Function;
	const reservedChar = `?/&:'"%#`;
	let meetCode = '';
	let meetCodePlaceholder = generatedMeetCode;
	let invalidMeetCode = false;
	let show = false;
	let meetCodePlaceholderInterval: NodeJS.Timer;
	let meetCodePlaceholderTypeInterval: NodeJS.Timer;

	async function generateMeetCode() {
		meetCodePlaceholderInterval = setInterval(async () => {
			if (!meetCode) {
				generatedMeetCode = await generatorMeetCode();
				meetCodePlaceholder = '';
				let i = 0;
				meetCodePlaceholderTypeInterval = setInterval(() => {
					meetCodePlaceholder += generatedMeetCode.charAt(i);
					++i;
					if (i === generatedMeetCode.length) {
						clearInterval(meetCodePlaceholderTypeInterval);
					}
				}, 100);
			}
		}, 10000);
	}

	onMount(() => {
		if (dark !== undefined) {
			show = true;
		}
	});

	function toggleDarkMode() {
		setItem('dark', `${!dark}`);
		dark = !dark;
	}

	function meetCodeSubmitHandler(event: Event) {
		event.preventDefault();
		goto(meetCode ? meetCode : generatedMeetCode);
	}

	let meetCodePlaceholderIntervalValue: NodeJS.Timer;
	$: if (!meetCode) {
		clearInterval(meetCodePlaceholderInterval);
		generateMeetCode();
	} else {
		if (meetCodePlaceholderInterval !== meetCodePlaceholderIntervalValue) {
			clearInterval(meetCodePlaceholderInterval);
			meetCodePlaceholderIntervalValue = meetCodePlaceholderInterval;
		}
	}

	$: if (meetCode) {
		const regex = new RegExp(`^[^${reservedChar}]+$`);
		if (!regex.test(meetCode)) {
			invalidMeetCode = true;
			meetCode = meetCode.slice(0, -1);
		} else if (invalidMeetCode) {
			invalidMeetCode = false;
		}
	}

	let invalidMeetCodeTimeout: NodeJS.Timeout;
	$: if (invalidMeetCode) {
		invalidMeetCodeTimeout = setTimeout(() => {
			invalidMeetCode = false;
			clearTimeout(invalidMeetCodeTimeout);
		}, 5000);
	} else {
		clearTimeout(invalidMeetCodeTimeout);
	}
</script>

<svelte:head>
	<title>rtc.skuy.uk - Extremely simple WebRTC application</title>
</svelte:head>

<svelte:window
	on:focus={() => {
		meetCodePlaceholder = generatedMeetCode;
		generateMeetCode();
	}}
	on:blur={() => {
		clearInterval(meetCodePlaceholderInterval);
		clearInterval(meetCodePlaceholderTypeInterval);
	}}
/>

{#if show}
	<div class:dark>
		<div
			class="flex flex-col items-center justify-center min-h-screen transition-color duration-300 dark:bg-black dark:text-white"
		>
			<header class="w-full py-2 px-3">
				<div class="flex sm:w-11/12 space-x-4 items-center justify-end h-full">
					<button
						class="border-2 hover:border-blue-500 rounded-lg p-1 material-icons-outlined"
						style="font-size: 2rem; outline-color: rgb(59, 130, 246);"
						title={`Dark mode: ${dark ? 'enabled' : 'disabled'}`}
						on:click={toggleDarkMode}
					>
						{#if dark}
							dark_mode
						{:else}
							light_mode
						{/if}
					</button>
				</div>
			</header>
			<main class="flex flex-col items-center justify-center flex-1 px-2 py-4 text-center">
				<div>
					<h1 class="text-5xl sm:text-6xl font-bold">rtc.skuy.uk</h1>
					<p class="mt-3 text-xl sm:text-2xl">Extremely simple WebRTC application</p>
				</div>
				<form
					class="flex items-center sm:w-[22rem] mt-10 border-2 rounded-xl p-2 hover:border-blue-500 focus-within:border-blue-500"
					class:!border-red-500={invalidMeetCode}
					on:submit={(event) => meetCodeSubmitHandler(event)}
				>
					<MaterialIconOutlined props={{}}>keyboard</MaterialIconOutlined>
					<input
						class="mx-2 py-1 w-full outline-none bg-transparent"
						style="font-size: 1.00875rem;"
						type="text"
						autocomplete="off"
						placeholder={meetCodePlaceholder}
						spellcheck="false"
						title={`Meeting name should not contain any of these characters: ${reservedChar
							.split('')
							.map((c, i) => (i > 0 ? ' ' + c : c))}.`}
						bind:value={meetCode}
					/>
					<button
						class={`border-2 py-1 px-2 rounded-lg hover:text-white ${
							invalidMeetCode
								? 'hover:border-red-500 hover:bg-red-500'
								: 'hover:border-blue-500 hover:bg-blue-500'
						}`}
						style="outline-color: rgb(59, 130, 246);"
						type="submit">Start</button
					>
				</form>
				{#if invalidMeetCode}
					<p class="mt-2">
						{`Meeting name should not contain any of these characters: ${reservedChar
							.split('')
							.map((c, i) => (i > 0 ? ' ' + c : c))}.`}
					</p>
				{/if}
			</main>
			<footer class="flex items-center justify-center w-full h-12">
				<p class="text-center">
					Made with 🐧 by
					<a
						class="hover:underline"
						href="https://skuy.uk/splashmodic"
						target="_blank"
						rel="noreferrer noopener"
					>
						splashmodic
					</a>
					© {new Date().getFullYear()}
				</p>
			</footer>
		</div>
	</div>
{/if}
