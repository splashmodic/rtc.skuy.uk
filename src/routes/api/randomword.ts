import { words } from '$lib/wordlist';

export async function get() {
	let wordlist = '';

	const wordlistLength = 7776;

	for (let i = 0; i < 3; ++i) {
		wordlist += words[Math.floor(Math.random() * wordlistLength)] + `${i < 2 ? '-' : ''}`;
	}

	if (wordlist) {
		return {
			body: {
				wordlist
			}
		};
	}
}
