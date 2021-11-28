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
	import alert from '$lib/alert';
	import { onMount } from 'svelte';
	import { getItem, setItem } from '$lib/storage';
	import MaterialIcon from './_MaterialIcon.svelte';
	import ItemPerson from './_ItemPerson.svelte';
	import Chat from './_Chat.svelte';
	import { goto } from '$app/navigation';

	export let slug: string;
	const title = `Meet | ${slug}`;
	let mounted = false;
	let initMeet = true;
	let isMobile = false;

	let name: string;
	let noNameError = false;
	let peopleSearchValue = '';

	let chatState = false;
	let audioState = false;
	let videoState = true;
	let presentState = false;
	let handState = false;
	let settingsState = false;
	let peopleState = false;

	let localStream: MediaStream;
	let notification: { type?: string; message?: string } = {};

	let chat = [];

	let peopleAll = [];
	let people = [];

	onMount(() => {
		isMobile = (navigator as any).userAgentData.mobile ? true : false;

		mounted = true;
		name = getItem('name');
		if (!name) {
			name = undefined;
		}

		setVideo(videoState);
	});

	function popStateHandler(event: Event) {
		location.reload();
	}

	async function setAudio(enabled: boolean) {
		if (enabled) {
			let newAudioStream: MediaStream;
			try {
				newAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch (error) {
				audioState = false;
				if (error.name === 'NotAllowedError') {
					notification = {
						type: 'error',
						message: 'You need to enable microphone access'
					};
				}
			}
			if (newAudioStream) {
				audioState = true;
				if (localStream) {
					if (localStream && localStream.getAudioTracks().length) {
						localStream.removeTrack(localStream.getAudioTracks()[0]);
					}
					localStream.addTrack(newAudioStream.getAudioTracks()[0]);
				} else {
					localStream = newAudioStream;
				}
			}
		} else {
			audioState = false;
			notification = {};
			if (localStream) {
				localStream.getAudioTracks()[0].stop();
			}
		}
	}

	async function setVideo(enabled: boolean) {
		if (enabled) {
			let newVideoStream: MediaStream;
			try {
				newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
			} catch (error) {
				videoState = false;
				if (error.name === 'NotAllowedError') {
					notification = {
						type: 'error',
						message: 'You need to enable camera access'
					};
				}
			}
			if (newVideoStream) {
				videoState = true;
				if (localStream) {
					if (localStream.getVideoTracks().length) {
						localStream.removeTrack(localStream.getVideoTracks()[0]);
					}
					localStream.addTrack(newVideoStream.getVideoTracks()[0]);
				} else {
					localStream = newVideoStream;
				}
			}
		} else {
			videoState = false;
			notification = {};
			if (localStream) {
				localStream.getVideoTracks()[0].stop();
			}
		}
	}

	function videoSrcObject(node: HTMLVideoElement, localStream: MediaStream) {
		node.srcObject = localStream;
		return {
			update(newStream: MediaStream) {
				node.srcObject = newStream;
			}
		};
	}

	function joinMeetHandler(event: Event) {
		event.preventDefault();
		if (!name) {
			noNameError = true;
			return;
		}

		initMeet = false;
	}

	function endCall() {
		if (localStream) {
			localStream.getTracks().forEach((track) => {
				track.stop();
			});
		}
		goto('/');
		location.reload();
	}

	$: if (!initMeet) {
		peopleAll = peopleAll.concat({ name: name.toString() });
	}

	$: if (name !== undefined) {
		if (name) {
			noNameError = false;
		}
		setItem('name', name);
	}

	$: if (peopleAll.length) {
		people = peopleAll.map((person) => {
			if (person.name.toLowerCase().indexOf(peopleSearchValue.toLowerCase()) !== -1) {
				return person;
			}
		});
	}

	$: if (audioState) {
		console.log('starting audioState');
		if (localStream && localStream.getAudioTracks()[0]) {
			notification = {
				type: 'success',
				message: 'Your microphone is working properly'
			};
		}
	}

	$: if (videoState) {
		console.log('starting videoState');
		if (localStream && localStream.getVideoTracks()[0]) {
			notification = {
				type: 'success',
				message: 'Your camera is working properly'
			};
		}
	}
</script>

<svelte:window on:popstate={popStateHandler} />

<svelte:head>
	<meta name="robots" content="noindex" />
	<title>{title}</title>
</svelte:head>

{#if mounted}
	<div class="flex flex-col-reverse" class:h-screen={!isMobile} class:lg:flex-row={initMeet}>
		{#if initMeet}
			<div
				class="relative z-10 flex justify-center lg:w-[34.725rem] lg:h-full text-white"
				style="background-color: #292929;"
			>
				<div class="flex flex-col items-center justify-center w-[21rem] mt-6 mb-4">
					<p class="mb-8 text-[1.75rem] font-semibold">Join meeting</p>
					<form class="w-full" on:submit={joinMeetHandler}>
						<div class="w-full mb-4">
							<!-- svelte-ignore a11y-autofocus -->
							<input
								class={`w-full py-2.5 px-4 text-sm text-center rounded-md text-black placeholder-black ${
									noNameError ? 'border border-[#e04757]' : ''
								}`}
								autocomplete="name"
								placeholder="Enter your name here"
								autofocus
								bind:value={name}
							/>
							{#if noNameError}
								<p class="w-full mt-2 p-1 bg-[#e04757] rounded-md text-center text-xs">
									Please enter your name to join the meeting
								</p>
							{/if}
						</div>
						<button
							class="block w-full h-10 py-2 px-4 mb-4 bg-[#0376da] text-sm font-semibold rounded-md"
							type="submit">Join meeting</button
						>
					</form>
					<div class="flex justify-evenly w-full pt-2 pb-3">
						<button
							class="hover:bg-white hover:bg-opacity-25 rounded"
							on:click={() => setAudio(!audioState)}
						>
							{#if audioState}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic</MaterialIcon>
							{:else}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic_off</MaterialIcon>
							{/if}
						</button>
						<button
							class="hover:bg-white hover:bg-opacity-25 rounded"
							on:click={() => setVideo(!videoState)}
						>
							{#if videoState}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam</MaterialIcon>
							{:else}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam_off</MaterialIcon>
							{/if}
						</button>
						<button class="hover:bg-white hover:bg-opacity-25 rounded" on:click={alert}
							><MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>person_add_alt</MaterialIcon
							></button
						>
					</div>
					{#if Object.keys(notification).length}
						<div
							class={`flex items-center gap-4 rounded-md text-sm ${
								notification.type === 'success' ? 'p-1.5' : 'py-3 px-4 bg-[#f8ae1a] text-black'
							}`}
						>
							<MaterialIcon
								props={{
									type: notification.type === 'success' ? 'filled' : 'outlined',
									size: '1.25rem',
									class: notification.type === 'success' ? 'text-green-500' : ''
								}}
							>
								{#if notification.type === 'success'}
									check_circle
								{:else if notification.type === 'error'}
									report_problem
								{/if}
							</MaterialIcon>
							<p>{notification.message}</p>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="fixed z-20 flex justify-between w-full p-4 text-white">
				<button
					class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
						chatState ? 'text-[#8ab4f8]' : ''
					}`}
					on:click={() => (chatState = !chatState)}
				>
					<MaterialIcon props={{ type: chatState ? 'filled' : 'outlined', class: 'p-3' }}
						>chat</MaterialIcon
					>
				</button>
				<div class="flex gap-2.5">
					<button
						class={`${
							audioState ? 'bg-black bg-opacity-25' : 'bg-[#ea4335] bg-opacity-80'
						} border border-opacity-25 rounded-full`}
						on:click={() => setAudio(!audioState)}
					>
						{#if audioState}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic</MaterialIcon>
						{:else}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic_off</MaterialIcon>
						{/if}
					</button>
					<button
						class={`${
							videoState ? 'bg-black bg-opacity-25' : 'bg-[#ea4335] bg-opacity-80'
						} border border-opacity-25 rounded-full`}
						on:click={() => setVideo(!videoState)}
					>
						{#if videoState}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam</MaterialIcon>
						{:else}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam_off</MaterialIcon>
						{/if}
					</button>
					<button
						class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
							handState ? 'text-[#8ab4f8]' : ''
						}`}
						on:click={() => {
							handState = !handState;
							alert();
						}}
					>
						<MaterialIcon props={{ type: handState ? 'filled' : 'outlined', class: 'p-3' }}
							>front_hand</MaterialIcon
						>
					</button>
					<button
						class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
							presentState ? 'text-[#8ab4f8]' : ''
						}`}
						on:click={() => {
							presentState = !presentState;
							alert();
						}}
					>
						<MaterialIcon props={{ type: presentState ? 'filled' : 'outlined', class: 'p-3' }}
							>present_to_all</MaterialIcon
						>
					</button>
					<button
						class="bg-black bg-opacity-25 border border-opacity-25 rounded-full"
						on:click={alert}
					>
						<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>more_vert</MaterialIcon>
					</button>
					<button
						class="bg-[#ea4335] bg-opacity-80 border border-opacity-25 rounded-full"
						on:click={endCall}
					>
						<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>call_end</MaterialIcon>
					</button>
				</div>
				<button
					class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
						peopleState ? 'text-[#8ab4f8]' : ''
					}`}
					on:click={() => (peopleState = !peopleState)}
				>
					<MaterialIcon props={{ type: peopleState ? 'filled' : 'outlined', class: 'p-3' }}
						>people_alt</MaterialIcon
					>
				</button>
			</div>
		{/if}
		<div class="flex-1 flex items-center justify-center max-w-screen max-h-screen bg-black">
			{#if chatState}
				<Chat bind:chatState bind:chat />
			{/if}
			{#if videoState}
				<div class={`w-full h-full ${chatState || peopleState ? 'p-4 pb-[5.125rem]' : ''}`}>
					<div
						class={`w-full h-full ${chatState || peopleState ? 'rounded-lg overflow-hidden' : ''}`}
					>
						<video
							class="w-full h-full object-cover"
							style="transform: rotateY(180deg);"
							use:videoSrcObject={localStream}
							muted
							autoplay
							playsinline
						/>
					</div>
				</div>
			{:else}
				<div class="flex items-center justify-center min-w-0 w-full max-w-full lg:h-full">
					<div
						class={`absolute z-0 flex items-center justify-center w-48 h-48 rounded-full text-white ${
							name ? 'bg-[#512da8]' : 'bg-[#aaa]'
						}`}
					>
						{#if name}
							<p class="text-9xl">{name[0].toUpperCase()}</p>
						{:else}
							<MaterialIcon
								props={{
									type: 'outlined',
									size: '10rem'
								}}
								>perm_identity
							</MaterialIcon>
						{/if}
					</div>
				</div>
			{/if}
			{#if peopleState}
				<div class="relative z-10 h-full p-4 pl-0 pb-[5.125rem]">
					<div class="flex flex-col w-[22.5rem] h-full bg-white rounded-lg">
						<div class="flex items-center justify-between h-16 ml-6 mr-1">
							<p class="text-lg leading-6">People</p>
							<button
								class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={() => (peopleState = false)}
								><MaterialIcon props={{ type: 'outlined', class: `p-3` }}>close</MaterialIcon
								></button
							>
						</div>
						<div class="flex justify-between mx-3 text-sm text-black text-opacity-80">
							<button
								class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={alert}
							>
								<MaterialIcon props={{ type: 'outlined' }}>mic_off</MaterialIcon>
								<p class="mt-2.5">Mute all</p>
							</button>
							<button
								class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={alert}
							>
								<MaterialIcon props={{ type: 'outlined' }}>person_add</MaterialIcon>
								<p class="mt-2.5">Add people</p>
							</button>
							<button
								class="w-28 h-20 rounded-lg hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={alert}
							>
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
							{#if people[0]}
								{#each people as person}
									<ItemPerson name={person.name} {audioState} {setAudio} />
								{/each}
							{:else}
								<p class="text-base text-center">No results</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
