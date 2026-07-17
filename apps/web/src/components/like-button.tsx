'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export function LikeButton() {
	const [liked, setLiked] = useState(false);

	const handleClick = () => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			Swal.fire({
				icon: 'info',
				title: 'Please login first',
				confirmButtonColor: '#125453',
			});
			return;
		}
		setLiked((prev) => !prev);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={liked}
			aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
			className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-brand-ink"
		>
			<svg viewBox="0 0 24 24" className="h-4 w-4" fill={liked ? '#e0736b' : 'none'}>
				<path
					d="M12 21s-7.5-4.6-10-9.1C0.3 8.2 1.7 4.5 5.1 3.4c2-0.6 4.1 0.2 5.4 1.9l1.5 1.9 1.5-1.9c1.3-1.7 3.4-2.5 5.4-1.9 3.4 1.1 4.8 4.8 3.1 8.5C19.5 16.4 12 21 12 21z"
					stroke={liked ? '#e0736b' : 'currentColor'}
					strokeWidth="1.8"
					strokeLinejoin="round"
				/>
			</svg>
		</button>
	);
}
