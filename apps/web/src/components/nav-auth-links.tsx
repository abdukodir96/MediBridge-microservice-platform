'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

function subscribe(callback: () => void) {
	window.addEventListener('storage', callback);
	return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
	return localStorage.getItem('memberType');
}

function getServerSnapshot() {
	return null;
}

export function NavAuthLinks() {
	const memberType = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	if (memberType === 'PATIENT') {
		return (
			<Link href="/my-page" className="hover:text-brand-teal-700">
				My Page
			</Link>
		);
	}

	if (memberType === 'CLINIC') {
		return (
			<Link href="/my-clinic" className="hover:text-brand-teal-700">
				My Clinic
			</Link>
		);
	}

	return null;
}
