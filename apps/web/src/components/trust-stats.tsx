const stats = [
	{ value: "240+", label: "Verified clinics" },
	{ value: "18K", label: "Bookings completed" },
	{ value: "4.9★", label: "Avg. patient rating" },
	{ value: "100%", label: "Escrow-protected pay" },
];

export function TrustStats() {
	return (
		<section className="relative z-10 grid grid-cols-2 border-y border-brand-line bg-white shadow-[0_8px_16px_-12px_rgba(13,59,59,0.2),0_-8px_16px_-12px_rgba(13,59,59,0.2)] sm:grid-cols-4">
			{stats.map((stat) => (
				<div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-5 text-center sm:py-7">
					<div className="font-serif text-2xl font-semibold text-brand-teal-900 sm:text-3xl">{stat.value}</div>
					<div className="text-xs text-brand-muted sm:text-sm">{stat.label}</div>
				</div>
			))}
		</section>
	);
}
