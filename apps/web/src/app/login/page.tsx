'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

interface LoginData {
	login: {
		_id: string;
		memberNick: string;
		memberType: string;
		accessToken: string;
	};
}

interface LoginVars {
	input: { memberEmail: string; memberPassword: string };
}

const LOGIN: TypedDocumentNode<LoginData, LoginVars> = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberNick
			memberType
			accessToken
		}
	}
`;

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [login, { loading, error }] = useMutation(LOGIN);

	const handleSubmit = async () => {
		try {
			const { data } = await login({
				variables: {
					input: { memberEmail: email, memberPassword: password },
				},
			});
			if (!data) return;
			localStorage.setItem('accessToken', data.login.accessToken);
			localStorage.setItem('memberType', data.login.memberType);
			router.push('/clinics');
		} catch {
			// error Apollo state'da — pastda ko'rsatiladi
		}
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-stone-50">
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
				<h1 className="text-2xl font-semibold text-teal-900 mb-6">
					Log in to MediBridge
				</h1>
				<div className="space-y-4">
					<input
						className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						type="password"
						className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
					/>
					{error && (
						<p className="text-sm text-red-600">{error.message}</p>
					)}
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="w-full bg-teal-800 text-white rounded-lg py-3 text-sm font-semibold hover:bg-teal-900 disabled:opacity-50"
					>
						{loading ? 'Logging in...' : 'Log in'}
					</button>
				</div>
			</div>
		</main>
	);
}
