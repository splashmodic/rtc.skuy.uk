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
	import { getItem, setItem } from '$lib/storage';
	import MaterialIcon from './_MaterialIcon.svelte';

	export let slug: string;
	const title = `Meet | ${slug}`;
	let mounted = false;
	let initMeet = false;
	let chat = false;
	let audio = false;
	let video = false;
	let present = false;
	let hand = false;
	let settings = false;
	let people = true;
	let sendChatEnabled = false;
	let isMobile = false;
	let noNameError = false;
	let name: string;
	let chatTextArea: HTMLTextAreaElement;
	let chatTextAreaValue = '';
	let chatTextLength = 0;
	let localStream: MediaStream;
	let notification: { type?: string; message?: string } = {};

	onMount(() => {
		mounted = true;
		name = getItem('name');
		if (!name) {
			name = undefined;
		}
		isMobile = (navigator as any).userAgentData.mobile ? true : false;

		setVideo(video);
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
				audio = false;
				if (error.name === 'NotAllowedError') {
					notification = {
						type: 'error',
						message: 'You need to enable microphone access'
					};
				}
			}
			if (newAudioStream) {
				audio = true;
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
			audio = false;
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
				video = false;
				if (error.name === 'NotAllowedError') {
					notification = {
						type: 'error',
						message: 'You need to enable camera access'
					};
				}
			}
			if (newVideoStream) {
				video = true;
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
			video = false;
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

	function sendChat(event: Event) {
		event.preventDefault();
		console.log(chatTextAreaValue);
		chatTextAreaValue = '';
	}

	function textAreaKeydownHandler(
		event: KeyboardEvent & {
			currentTarget: EventTarget & HTMLTextAreaElement;
		}
	) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			(event.target as HTMLTextAreaElement).form.dispatchEvent(
				new Event('submit', { bubbles: true, cancelable: true })
			);
		}
	}

	$: {
		if (chatTextAreaValue) {
			sendChatEnabled = true;
		} else {
			sendChatEnabled = false;
		}

		if (chatTextArea) {
			const textHeight = chatTextAreaValue.split('\n').length * 20;
			let height = textHeight;
			chatTextArea.style.height = `${height}px`;

			const textAreaHeight = chatTextArea.scrollHeight;

			if (textAreaHeight > textHeight) {
				height = textAreaHeight;
			}

			if (height > 20 * 5) {
				height = 20 * 5;
			}

			chatTextArea.style.height = `${height}px`;
		}
	}

	$: if (name !== undefined) {
		if (name) {
			noNameError = false;
		}
		setItem('name', name);
	}

	$: if (audio) {
		console.log('starting audio');
		if (localStream && localStream.getAudioTracks()[0])
			notification = {
				type: 'success',
				message: 'Your microphone is working properly'
			};
	}

	$: if (video) {
		console.log('starting video');
		if (localStream && localStream.getVideoTracks()[0])
			notification = {
				type: 'success',
				message: 'Your camera is working properly'
			};
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
							on:click={() => setAudio(!audio)}
						>
							{#if audio}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic</MaterialIcon>
							{:else}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic_off</MaterialIcon>
							{/if}
						</button>
						<button
							class="hover:bg-white hover:bg-opacity-25 rounded"
							on:click={() => setVideo(!video)}
						>
							{#if video}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam</MaterialIcon>
							{:else}
								<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam_off</MaterialIcon>
							{/if}
						</button>
						<button class="hover:bg-white hover:bg-opacity-25 rounded"
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
			<div class="fixed z-10 flex justify-between w-full p-4 text-white">
				<button
					class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
						chat ? 'text-[#8ab4f8]' : ''
					}`}
					on:click={() => (chat = !chat)}
				>
					<MaterialIcon props={{ type: chat ? 'filled' : 'outlined', class: 'p-3' }}
						>chat</MaterialIcon
					>
				</button>
				<div class="flex gap-2.5">
					<button
						class={`${
							audio ? 'bg-black bg-opacity-25' : 'bg-[#ea4335] bg-opacity-80'
						} border border-opacity-25 rounded-full`}
						on:click={() => setAudio(!audio)}
					>
						{#if audio}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic</MaterialIcon>
						{:else}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>mic_off</MaterialIcon>
						{/if}
					</button>
					<button
						class={`${
							video ? 'bg-black bg-opacity-25' : 'bg-[#ea4335] bg-opacity-80'
						} border border-opacity-25 rounded-full`}
						on:click={() => setVideo(!video)}
					>
						{#if video}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam</MaterialIcon>
						{:else}
							<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>videocam_off</MaterialIcon>
						{/if}
					</button>
					<button
						class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
							hand ? 'text-[#8ab4f8]' : ''
						}`}
						on:click={() => (hand = !hand)}
					>
						<MaterialIcon props={{ type: hand ? 'filled' : 'outlined', class: 'p-3' }}
							>front_hand</MaterialIcon
						>
					</button>
					<button
						class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
							present ? 'text-[#8ab4f8]' : ''
						}`}
						on:click={() => (present = !present)}
					>
						<MaterialIcon props={{ type: present ? 'filled' : 'outlined', class: 'p-3' }}
							>present_to_all</MaterialIcon
						>
					</button>
					<button class="bg-black bg-opacity-25 border border-opacity-25 rounded-full">
						<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>more_vert</MaterialIcon>
					</button>
					<button class="bg-[#ea4335] bg-opacity-80 border border-opacity-25 rounded-full">
						<MaterialIcon props={{ type: 'outlined', class: 'p-3' }}>call_end</MaterialIcon>
					</button>
				</div>
				<button
					class={`bg-black bg-opacity-25 border border-opacity-25 rounded-full ${
						people ? 'text-[#8ab4f8]' : ''
					}`}
					on:click={() => (people = !people)}
				>
					<MaterialIcon props={{ type: people ? 'filled' : 'outlined', class: 'p-3' }}
						>people_alt</MaterialIcon
					>
				</button>
			</div>
		{/if}
		<div class="flex-1 flex items-center justify-center max-w-screen max-h-screen bg-black">
			{#if chat}
				<div class="relative z-10 h-full p-4 pr-0 pb-[5.125rem]">
					<div class="flex flex-col w-[22.5rem] h-full bg-white rounded-lg">
						<div class="flex items-center justify-between h-16 ml-6 mr-1">
							<p class="text-lg leading-6">In-call messages</p>
							<button
								class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={() => (chat = false)}
								><MaterialIcon props={{ type: 'outlined', class: `p-3` }}>close</MaterialIcon
								></button
							>
						</div>
						<div class="flex-1 mx-6 text-sm overflow-y-auto">
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
							<div class="my-3.5">
								<div class="flex items-end">
									<p class="mr-2 font-semibold text-black">You</p>
									<p class="text-black text-opacity-50">11:00</p>
								</div>
								<p>This is dummy message</p>
							</div>
						</div>
						<form class="m-4 bg-[#f1f3f4] rounded-3xl flex items-center" on:submit={sendChat}>
							<!-- svelte-ignore a11y-autofocus -->
							<textarea
								class="w-full mx-4 my-3.5 mr-0 bg-transparent text-sm placeholder-[#5f6368] resize-none outline-none"
								placeholder="Send a message to everyone"
								rows="1"
								autofocus
								bind:this={chatTextArea}
								bind:value={chatTextAreaValue}
								on:keydown={textAreaKeydownHandler}
							/>
							<button type="submit"
								><MaterialIcon
									props={{
										type: 'filled',
										class: `p-3 bg-transparent ${
											sendChatEnabled ? 'text-[#1a73e8]' : 'text-[rgba(60,64,67,0.38)]'
										}`
									}}>send</MaterialIcon
								></button
							>
						</form>
					</div>
				</div>
			{/if}
			{#if video}
				<div class={`w-full h-full ${chat || people ? 'p-4 pb-[5.125rem]' : ''}`}>
					<div class={`w-full h-full ${chat || people ? 'rounded-lg overflow-hidden' : ''}`}>
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
						class={`relative z-0 flex items-center justify-center w-48 h-48 rounded-full text-white ${
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
			{#if people}
				<div class="relative z-10 h-full p-4 pl-0 pb-[5.125rem]">
					<div class="flex flex-col w-[22.5rem] h-full bg-white rounded-lg">
						<div class="flex items-center justify-between h-16 ml-6 mr-1">
							<p class="text-lg leading-6">People</p>
							<button
								class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
								on:click={() => (people = false)}
								><MaterialIcon props={{ type: 'outlined', class: `p-3` }}>close</MaterialIcon
								></button
							>
						</div>
						<div class="m-4 bg-[#f1f3f4] rounded-3xl flex items-center">
							<MaterialIcon
								props={{
									type: 'outlined',
									class: `p-3 bg-transparent ${
										sendChatEnabled ? 'text-[#1a73e8]' : 'text-[rgba(60,64,67,0.38)]'
									}`
								}}>search</MaterialIcon
							>
							<!-- svelte-ignore a11y-autofocus -->
							<input
								class="w-full mx-4 my-3.5 ml-0 bg-transparent text-sm placeholder-[#5f6368] resize-none outline-none"
								placeholder="Search for people"
							/>
						</div>
						<div class="flex-1 mx-6 text-sm overflow-y-auto">
							<div class="flex items-center my-3.5">
								<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#512da8]">
									<p class="text-lg text-white">{name[0].toUpperCase()}</p>
								</div>
								<div class="w-[11.25rem] flex mx-2.5">
									<p class="truncate">{name}</p>
									<p class="ml-1">(You)</p>
								</div>
								<div class="">o</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
