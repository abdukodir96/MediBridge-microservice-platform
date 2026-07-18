import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicBookingCard } from "@/components/clinic-booking-card";
import { ClinicComments } from "@/components/clinic-comments";
import { ClinicProfileStats } from "@/components/clinic-profile-stats";
import { fetchClinicProfile, type ClinicProcedure } from "@/lib/graphql/clinic-profile";
import { langLabel, titleCaseEnum } from "@/lib/clinic-format";

function clinicBadge(rating: number, reviewCount: number) {
	if (rating >= 4.9) return "Top Rated on MediBridge";
	if (reviewCount >= 400) return "Patient Choice on MediBridge";
	return "Verified on MediBridge";
}

function formatPriceRange(procedure: ClinicProcedure) {
	const { procedurePriceMin, procedurePriceMax, procedureCurrency } = procedure;
	return procedurePriceMin === procedurePriceMax
		? `${procedurePriceMin.toLocaleString()} ${procedureCurrency}`
		: `${procedurePriceMin.toLocaleString()}–${procedurePriceMax.toLocaleString()} ${procedureCurrency}`;
}

export default async function ClinicProfilePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const profile = await fetchClinicProfile(id);
	if (!profile) notFound();

	const { clinic, procedures } = profile;
	const startingPrice = procedures.length
		? `$${Math.min(...procedures.map((p) => p.procedurePriceMin)).toLocaleString()}`
		: "Contact clinic";
	const tags = [
		...clinic.clinicSpecialties.map(titleCaseEnum),
		...procedures.map((p) => p.procedureName),
	].filter((tag, index, all) => all.indexOf(tag) === index);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<section className="relative h-[300px] overflow-hidden bg-brand-teal-900 sm:h-[380px]">
				<Image src="/doctor/doctor.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-75" />
				<div className="absolute inset-0 bg-linear-to-r from-brand-teal-900/80 via-brand-teal-700/35 to-brand-teal-900/55" />
				<Link href="/clinics" className="absolute left-5 top-5 z-10 rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-brand-teal-900 shadow-lg transition hover:bg-white sm:left-8 sm:top-7">
					‹ Back to results
				</Link>
				<div className="absolute bottom-5 right-5 z-10 flex gap-2 sm:bottom-7 sm:right-8">
					{[1, 2, 3].map((item) => (
						<div key={item} className="relative h-14 w-18 overflow-hidden rounded-lg border border-white/60 bg-white/20">
							<Image src="/doctor/doctor.jpg" alt="" fill sizes="72px" className="object-cover" />
						</div>
					))}
					<div className="flex h-14 w-18 items-center justify-center rounded-lg border border-white/60 bg-brand-teal-900/55 text-xs font-bold text-white">+12</div>
				</div>
			</section>

			<main className="mx-auto grid w-full max-w-[1540px] gap-9 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-12">
				<div className="min-w-0">
					<header>
						<p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-teal-500">International patient clinic</p>
						<h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-brand-teal-900 sm:text-5xl">{clinic.clinicName}</h1>
						<span className="mt-4 inline-flex rounded-full bg-brand-teal-100 px-3.5 py-1.5 text-xs font-bold text-brand-teal-700">
							✦ {clinicBadge(clinic.clinicRating, clinic.clinicReviewCount)}
						</span>
						<div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-muted sm:text-base">
							<span className="font-bold text-brand-ink">
								<span className="text-brand-gold">★</span> {clinic.clinicRating.toFixed(1)} · {clinic.clinicReviewCount} reviews
							</span>
							<span>📍 {clinic.clinicAddress}</span>
							<span>🗣 {clinic.clinicLangs.map(langLabel).join(" · ")}</span>
						</div>
						<ClinicProfileStats clinicSlug={id} />
						<div className="mt-5 flex flex-wrap gap-2">
							{tags.map((tag) => (
								<span key={tag} className="rounded-full bg-brand-teal-100 px-3 py-1.5 text-xs font-semibold text-brand-teal-700">{tag}</span>
							))}
						</div>
					</header>

					<section className="mt-10">
						<h2 className="font-serif text-2xl font-semibold text-brand-teal-900">About the clinic</h2>
						<p className="mt-4 max-w-4xl text-base leading-8 text-brand-muted">{clinic.clinicDesc}</p>
					</section>

					<section className="mt-10">
						<h2 className="font-serif text-2xl font-semibold text-brand-teal-900">Procedures & pricing</h2>
						<div className="mt-4 divide-y divide-brand-line border-y border-brand-line">
							{procedures.map((procedure) => (
								<div key={procedure._id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h3 className="font-semibold text-brand-ink">{procedure.procedureName}</h3>
										<p className="mt-1 text-sm text-brand-muted">
											{procedure.procedureDesc || titleCaseEnum(procedure.procedureCategory)}
											{procedure.procedureDuration > 0 ? ` · ${procedure.procedureDuration} days recovery` : ""}
										</p>
									</div>
									<p className="shrink-0 text-right font-bold text-brand-teal-900">
										{formatPriceRange(procedure)}
									</p>
								</div>
							))}
						</div>
					</section>

					<ClinicComments clinicSlug={id} clinicName={clinic.clinicName} />
				</div>

				<div className="order-first lg:order-none">
					<ClinicBookingCard clinicSlug={id} clinicName={clinic.clinicName} startingPrice={startingPrice} />
				</div>
			</main>
		</div>
	);
}
