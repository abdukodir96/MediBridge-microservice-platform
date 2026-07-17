import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
	uri: process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
	const token =
		typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
	return {
		headers: {
			...headers,
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
	};
});

export const apolloClient = new ApolloClient({
	link: from([authLink, httpLink]),
	cache: new InMemoryCache(),
});
