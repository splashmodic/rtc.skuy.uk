<script context="module" lang="ts">
	export async function load({ page }) {
		return {
			props: {
				slug: page.params.slug
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import MaterialIconOutlined from './_MaterialIconOutlined.svelte';
	import Button from './_Button.svelte';

	export let slug: string;
	let audio = false;
	let video = true;
	let isMobile = false;
	const title = `Meet | ${slug}`;
	let stream: MediaStream;

	onMount(() => {
		window.history.replaceState({}, title, slug);

		isMobile = (navigator as any).userAgentData.mobile ? true : false;

		async function openUserMedia() {
			if (audio || video) {
				stream = await navigator.mediaDevices.getUserMedia({ audio, video });
			}
		}
		openUserMedia();
	});

	function popStateHandler(event: Event) {
		location.reload();
	}

	async function setAudio(enabled: boolean) {
		audio = enabled;
		if (audio) {
			const newAudioStream = await navigator.mediaDevices.getUserMedia({ audio });
			if (stream) {
				if (stream && stream.getAudioTracks().length) {
					stream.removeTrack(stream.getAudioTracks()[0]);
				}
				stream.addTrack(newAudioStream.getAudioTracks()[0]);
			} else {
				stream = newAudioStream;
			}
		} else {
			stream.getAudioTracks()[0].stop();
		}
	}

	async function setVideo(enabled: boolean) {
		video = enabled;
		if (video) {
			const newVideoStream = await navigator.mediaDevices.getUserMedia({ video });
			if (stream) {
				if (stream.getVideoTracks().length) {
					stream.removeTrack(stream.getVideoTracks()[0]);
				}
				stream.addTrack(newVideoStream.getVideoTracks()[0]);
			} else {
				stream = newVideoStream;
			}
		} else {
			stream.getVideoTracks()[0].stop();
		}
	}

	function videoSrcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(newStream: MediaStream) {
				node.srcObject = newStream;
			}
		};
	}

	$: if (audio) {
		console.log('starting audio');
	}

	$: if (video) {
		console.log('starting video');
	}
</script>

<svelte:window on:popstate={(event) => popStateHandler(event)} />

<svelte:head>
	<meta name="robots" content="noindex" />
	<title>{title}</title>
</svelte:head>

<div class="flex flex-col-reverse lg:flex-row" class:h-screen={!isMobile}>
	<div
		class="relative z-10 flex justify-center lg:w-[34.725rem] lg:h-full text-white"
		style="background-color: #292929;"
	>
		<div class="flex flex-col items-center justify-center w-[21rem] mt-6 mb-4">
			<p class="mb-8 text-[1.75rem] font-semibold">Join meeting</p>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				class="w-full py-2.5 px-4 mb-4 text-sm text-center rounded-md text-black placeholder-black"
				autocomplete="name"
				placeholder="Enter your name here"
				autofocus
			/>
			<button class="block w-full h-10 py-2 px-4 mb-4 bg-[#0376da] text-sm font-semibold rounded-md"
				>Join meeting</button
			>
			<div class="flex justify-evenly w-full my-2">
				<Button on:click={() => setAudio(!audio)}>
					{#if audio}
						<MaterialIconOutlined props={{}}>mic_none</MaterialIconOutlined>
					{:else}
						<MaterialIconOutlined props={{}}>mic_off</MaterialIconOutlined>
					{/if}
				</Button>
				<Button on:click={() => setVideo(!video)}>
					{#if video}
						<MaterialIconOutlined props={{}}>videocam</MaterialIconOutlined>
					{:else}
						<MaterialIconOutlined props={{}}>videocam_off</MaterialIconOutlined>
					{/if}
				</Button>
				<Button><MaterialIconOutlined props={{}}>person_add</MaterialIconOutlined></Button>
			</div>
		</div>
	</div>
	<div class="flex-1 flex items-center justify-center bg-black">
		{#if !video}
			<div class="flex items-center justify-center w-[12.5rem] h-[12.5rem] bg-[#aaa] rounded-full">
				<MaterialIconOutlined props={{ size: '10.5rem', class: 'relative z-10 text-white' }}
					>perm_identity</MaterialIconOutlined
				>
			</div>
		{/if}
		{#if video}
			<video
				class="object-cover w-full lg:h-full"
				style="transform: rotateY(180deg);"
				use:videoSrcObject={stream}
				muted
				autoplay
				playsinline
			/>
		{/if}
	</div>
</div>
