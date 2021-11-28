import { words } from '$lib/wordlist';
import type { Request } from '@sveltejs/kit';

export async function get(req: Request) {
	let w = Number(req.query.get('w'));
	if (!w) {
		w = 1;
	}
	const wordlistLength = 7776;
	let wordlist = '';

	for (let i = 0; i < w; ++i) {
		wordlist += words[Math.floor(Math.random() * wordlistLength)] + `${i + 1 < w ? '-' : ''}`;
	}

	if (wordlist) {
		return {
			body: {
				wordlist
			}
		};
	}
}
