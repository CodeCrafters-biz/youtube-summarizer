import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { language } from '@inlang/sdk-js';
import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import qs from 'qs';
import { redirect } from '@sveltejs/kit';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export 

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const checkRole = (user, rolesCanAccess = ['USER']) => {
	if (!rolesCanAccess.includes(user.role)) {
		throw redirect(302, '/search-references')
	}	
}


export function isValidDate(date) {
	return date instanceof Date && !isNaN(date.getTime());
}

export const downloadFile = async (response) => {
	if (response.ok) {
		const blob = await response.blob();
		console.log('Blob:', blob);
		const url = window.URL.createObjectURL(blob);
		console.log('URL:', url);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = 'exported-file.docx';
		document.body.appendChild(a);
		a.click();
		a.remove(); // Immediately remove the element

		// Revoke the object URL after a delay to ensure the download starts
		setTimeout(() => window.URL.revokeObjectURL(url), 100);
	} else {
		console.error('Failed to download file');
	}
}

export const handleFormError = (errors) => {
	if (errors._errors?.length) {
		errors._errors.forEach((error) => {
			toast.error(error);
		});
	}
};

export const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'EUR' // Specify your currency code here
	}).format(amount);
};

export const onPageChange = async (page) => {
	const queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
	await goto(`?${qs.stringify({ ...queryParams, pageIndex: page })}`);
};

export const onSearch = async (search) => {
	const { search: _, ...queryParams } = qs.parse(window.location.search, {
		ignoreQueryPrefix: true
	});
	await goto(`?${qs.stringify({ ...queryParams, ...(search && { search }) })}`);
};

export const dbi = (object, key) => {
	return object?.[`${key}_${language}`] || object?.[`${key}_en`] || object?.[`${key}_fi`] || object?.[key];
};

const storeInstances = {};

function safeJsonParse(jsonString) {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		// If parsing fails, return an empty object
		return {};
	}
}

export function localStorageWritable(key, initialValue) {
	if (!storeInstances[key]) {
		const storedValue = localStorage.getItem(key);
		const parsedValue = storedValue ? safeJsonParse(storedValue) : initialValue;

		const store = writable(parsedValue);

		storeInstances[key] = store;

		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return storeInstances[key];
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};
