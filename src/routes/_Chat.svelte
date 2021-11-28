<script lang="ts">
	import { beforeUpdate, afterUpdate } from 'svelte';
	import Eliza from 'elizabot';
	import ItemMessage from './_ItemMessage.svelte';
	import MaterialIcon from './_MaterialIcon.svelte';

	export let chatState: boolean;
	export let chat: Array<any>;

	const eliza = new Eliza();
	let chatTextArea: HTMLTextAreaElement;
	let chatTextAreaValue = '';
	let sendChatEnabled = false;

	if (!chat.length) {
		chat = [
			{
				name: 'Eliza (bot)',
				time: new Date().toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				}),
				message: eliza.getInitial(),
				continue: false
			}
		];
	}

	let autoscroll: boolean;

	beforeUpdate(() => {
		autoscroll =
			chatTextArea &&
			chatTextArea.offsetHeight + chatTextArea.scrollTop > chatTextArea.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) {
			chatTextArea.scrollTo(0, chatTextArea.scrollHeight);
		}
	});

	function sendChat(event: Event) {
		event.preventDefault();
		const time = new Date().toLocaleTimeString(navigator.language, {
			hour: '2-digit',
			minute: '2-digit'
		});
		chat = chat.concat({
			name: 'You',
			time: new Date().toLocaleTimeString(navigator.language, {
				hour: '2-digit',
				minute: '2-digit'
			}),
			message: chatTextAreaValue,
			continue: chat[chat.length - 1].time === time && chat[chat.length - 1].name === 'You'
		});

		const reply = eliza.transform(chatTextAreaValue);

		chatTextAreaValue = '';

		setTimeout(() => {
			chat = chat.concat({
				name: chat[0].name,
				time: new Date().toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				}),
				message: reply,
				continue: chat[chat.length - 1].time === time && chat[chat.length - 1].name === chat[0].name
			});
		}, 500 + Math.random() * 500);
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

			if (chatTextAreaValue) {
				const textAreaHeight = chatTextArea.scrollHeight;

				if (textAreaHeight > textHeight) {
					height = textAreaHeight;
				}
			}

			if (height > 20 * 5) {
				height = 20 * 5;
				chatTextArea.style.overflowY = 'auto';
			} else if (chatTextArea.style.overflowY === 'auto') {
				chatTextArea.style.overflowY = 'hidden';
			}

			if (chatTextArea.style.height !== height.toString()) {
				chatTextArea.style.height = `${height}px`;
			}
		}
	}
</script>

<div class="relative z-10 h-full p-4 pr-0 pb-[5.125rem]">
	<div class="flex flex-col w-[22.5rem] h-full bg-white rounded-lg">
		<div class="flex items-center justify-between h-16 ml-6 mr-1">
			<p class="text-lg leading-6">In-call messages</p>
			<button
				class="rounded-full hover:bg-[#dadce0] hover:bg-opacity-30"
				on:click={() => (chatState = false)}
				><MaterialIcon props={{ type: 'outlined', class: `p-3` }}>close</MaterialIcon></button
			>
		</div>
		<div class="flex-1 flex flex-col mx-6 text-sm overflow-y-auto">
			{#each chat as msg}
				<ItemMessage chat={msg} />
			{/each}
		</div>
		<form class="m-4 bg-[#f1f3f4] rounded-3xl flex items-center" on:submit={sendChat}>
			<!-- svelte-ignore a11y-autofocus -->
			<textarea
				class="w-full mx-4 my-3.5 mr-0 bg-transparent text-sm placeholder-[#5f6368] resize-none outline-none overflow-hidden"
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
