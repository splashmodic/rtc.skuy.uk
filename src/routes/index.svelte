<script context="module" lang="ts">
	export async function load({ fetch }) {
		async function generatorMeetCode() {
			return (await (await fetch('/api/randomword?w=3')).json()).wordlist;
		}
		return {
			props: {
				generatedMeetCode: await generatorMeetCode(),
				generatorMeetCode
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getItem, setItem } from '$lib/storage';
	import MaterialIcon from './_MaterialIcon.svelte';

	export let dark: boolean;
	export let generatedMeetCode: string;
	export let generatorMeetCode: Function;
	const reservedChar = `?/&:'"%#`;
	let meetCode = '';
	let meetCodePlaceholder: string;
	let invalidMeetCode = false;
	let mounted = false;
	let meetCodePlaceholderTypeInterval: NodeJS.Timer;

	function typingMeetCode() {
		meetCodePlaceholder = '';
		let i = 0;
		meetCodePlaceholderTypeInterval = setInterval(() => {
			meetCodePlaceholder += generatedMeetCode.charAt(i);
			++i;
			if (i === generatedMeetCode.length) {
				clearInterval(meetCodePlaceholderTypeInterval);
				generateMeetCode();
			}
		}, 100);
	}

	async function generateMeetCode() {
		setTimeout(async () => {
			if (!meetCode) {
				generatedMeetCode = await generatorMeetCode();
				typingMeetCode();
			}
		}, 10000);
	}

	onMount(() => {
		if (getItem('dark')) {
			dark = getItem('dark') === 'true' ? true : false;
		} else {
			dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		mounted = true;
		typingMeetCode();
	});

	function toggleDarkMode() {
		dark = !dark;
		setItem('dark', `${dark}`);
	}

	function meetCodeSubmitHandler(event: Event) {
		event.preventDefault();
		goto(meetCode ? meetCode : generatedMeetCode);
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

	$: if (invalidMeetCode) {
		setTimeout(() => {
			invalidMeetCode = false;
		}, 5000);
	}
</script>

<svelte:head>
	<title>rtc.skuy.uk - Extremely simple WebRTC application</title>
</svelte:head>

{#if mounted}
	<div class:dark>
		<div
			class="flex flex-col items-center justify-center min-h-screen transition-color duration-300 dark:bg-[#202124] dark:text-white"
		>
			<header class="w-full py-2 px-3">
				<div class="flex sm:w-11/12 space-x-4 items-center justify-end h-full">
					<button
						class="border-2 hover:border-blue-500 rounded-lg p-1 outline-[rgb(59,130,246)]"
						title={`Dark mode: ${dark ? 'enabled' : 'disabled'}`}
						on:click={toggleDarkMode}
					>
						<MaterialIcon props={{ type: 'outlined', class: 'text-[2rem]' }}>
							{#if dark}
								dark_mode
							{:else}
								light_mode
							{/if}
						</MaterialIcon>
					</button>
				</div>
			</header>
			<main class="flex flex-col items-center justify-center flex-1 px-2 py-4 text-center">
				<div>
					<h1 class="text-5xl sm:text-6xl font-bold">rtc.skuy.uk</h1>
					<p class="mt-3 text-xl sm:text-2xl">Extremely simple WebRTC application</p>
				</div>
				<form
					class="flex items-center w-96 mt-10 border-2 rounded-xl p-2 hover:border-blue-500 focus-within:border-blue-500"
					class:!border-red-500={invalidMeetCode}
					on:submit={meetCodeSubmitHandler}
				>
					<MaterialIcon props={{ type: 'outlined' }}>keyboard</MaterialIcon>
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
