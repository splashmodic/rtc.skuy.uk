export async function deleteData(path: string, data: object) {
	return await fetch(path, {
		method: 'DELETE',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export async function getData(path: string, data: HeadersInit | undefined) {
	return await fetch(path, {
		method: 'GET',
		headers: data
	});
}

export async function postData(path: string, data: object) {
	return await fetch(path, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export async function putData(path: string, data: object) {
	return await fetch(path, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
