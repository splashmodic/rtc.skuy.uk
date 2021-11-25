export async function post({ body }) {
	let query = '';
	function appendQuery(i: number) {
		switch (i) {
			case 0:
				return 'chat';
			case 1:
				return 'audio';
			case 2:
				return 'video';
		}
	}
	let totalFeature = 0;
	body.forEach((val: boolean, i: number) => {
		if (val === true) {
			if (totalFeature > 0) {
				query += '&';
			} else {
				query += '?';
			}
			query += appendQuery(i);
			++totalFeature;
		}
	});
	return {
		body: {
			query
		}
	};
}
