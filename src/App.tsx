import React, { FC, useState } from 'react';
import { useQuery, QueryCache, ReactQueryCacheProvider } from 'react-query';

interface Repository {
	language: string | null;
	stargazers_count: number;
}

interface Languages {
	[language: string]: boolean;
}

interface Stats {
	totalStars: number;
	languages: Languages;
}

const extractStats = (repositories: Repository[]): Stats => {
	const languages: Languages = {};
	let totalStars: number = 0;

	repositories.length &&
		repositories.map((repo: Repository) => {
			totalStars += repo.stargazers_count;

			if (!repo.language || languages[repo.language]) {
				return null;
			} else {
				languages[repo.language] = true;
				return null;
			}
		});

	return {
		totalStars,
		languages,
	};
};

const Form: FC<{
	defaultUser: string;
	submitHandler: (user: string) => void;
}> = ({ defaultUser, submitHandler }) => {
	const [user, setUser] = useState(defaultUser);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submitHandler(user);
			}}
		>
			<input
				required
				type="text"
				name="user"
				placeholder="For example: danielkvist"
				value={user}
				onChange={(e) => setUser(e.target.value)}
			/>
			<button type="submit">Search</button>
		</form>
	);
};

const GithubStats: FC<{ user: string }> = ({ user }) => {
	const { isLoading, isError, data, status } = useQuery('repos', () => {
		return fetch(`https://api.github.com/users/${user}/repos`).then((res) =>
			res.json()
		);
	});

	if (isLoading) {
		return <p>Loading</p>;
	}

	if (isError || status !== 'success') {
		return <p>An Error has ocurred</p>;
	}

	const { languages, totalStars } = extractStats(data);
	return (
		<div>
			<p>
				Profile:{' '}
				<a
					href={`https://github.com/${user}`}
					target="_blank"
					rel="noopener noreferrer"
				>{`https://github.com/${user}`}</a>
			</p>
			<p>Number of public repos: {data.length}</p>
			<p>Total number of stars: {totalStars}</p>
			<p>Languages:</p>
			<ul>
				{Object.keys(languages).map((lang) => (
					<li key={lang}>{lang}</li>
				))}
			</ul>
		</div>
	);
};

const App: FC = () => {
	const [user, setUser] = useState('danielkvist');
	const queryCache: QueryCache = new QueryCache();

	const submitHandler = (user: string) => {
		setUser(user);
	};

	return (
		<ReactQueryCacheProvider queryCache={queryCache}>
			<Form defaultUser={user} submitHandler={submitHandler} />
			<GithubStats user={user} />
		</ReactQueryCacheProvider>
	);
};

export default App;
