export function setCookie(key: string, data: string) {
	document.cookie = `${key}=${data}; expires=Tue, 19 Jan 2038 04:14:07 UTC"`;
}

export function getCookie(key: string) {
	try {
		return document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${key}=`))
			.split('=')[1];
	} catch (e) {
		return undefined;
	}
}

export function removeCookie(key: string) {
	document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
}

export function setItem(key: string, data: string) {
	localStorage.setItem(key, data);
}

export function getItem(key: string) {
	return localStorage.getItem(key);
}

export function removeItem(key: string) {
	localStorage.removeItem(key);
}
