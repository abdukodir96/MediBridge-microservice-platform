import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ClinicBookingCard } from "@/components/clinic-booking-card";
import { ClinicComments } from "@/components/clinic-comments";
import { ClinicProfileStats } from "@/components/clinic-profile-stats";
import { fetchClinicProfile, type ClinicProcedure, type ClinicProfile } from "@/lib/graphql/clinic-profile";
import { langLabel, titleCaseEnum } from "@/lib/clinic-format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";

// schema.org structured data — lets Google show rating stars directly in
// search results (a "rich snippet") instead of a plain blue link, which
// meaningfully improves click-through. Reflects whatever this request's
// locale already resolved clinicName/clinicDesc to (English or AI-translated
// — see TranslationService), matching what the page actually displays.
function ClinicJsonLd({
	clinic,
	clinicId,
	locale,
}: {
	clinic: ClinicProfile;
	clinicId: string;
	locale: string;
}) {
	const data = {
		"@context": "https://schema.org",
		"@type": "MedicalBusiness",
		name: clinic.clinicName,
		description: clinic.clinicDesc,
		address: {
			"@type": "PostalAddress",
			addressLocality: clinic.clinicAddress,
			addressCountry: "KR",
		},
		...(clinic.clinicReviewCount > 0 && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: clinic.clinicRating,
				reviewCount: clinic.clinicReviewCount,
			},
		}),
		...(clinic.clinicImages[0] && { image: clinic.clinicImages[0] }),
		medicalSpecialty: clinic.clinicSpecialties,
		url: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}/clinics/${clinicId}`,
	};

	// clinicName/clinicDesc are clinic-owner-authored freeform text, and
	// JSON.stringify does NOT escape "</script>" — embedding it unescaped
	// inside dangerouslySetInnerHTML would let a clinic owner break out of
	// this <script> tag and inject arbitrary HTML/JS into every visitor's
	// page. Escaping "<" as its unicode form neutralizes that while staying
	// valid, semantically identical JSON-LD.
	const json = JSON.stringify(data).replace(/</g, "\\u003c");

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

// Only the "Verified" case has a translation (t("clinicProfile.verified"));
// the other two badge variants stay English — same scope gap as the
// /clinics list page's clinicBadgeKey() split.
function clinicBadge(rating: number, reviewCount: number, verifiedLabel: string) {
	if (rating >= 4.9) return "Top Rated on MediBridge";
	if (reviewCount >= 400) return "Patient Choice on MediBridge";
	return verifiedLabel;
}

function formatPriceRange(procedure: ClinicProcedure) {
	const { procedurePriceMin, procedurePriceMax, procedureCurrency } = procedure;
	return procedurePriceMin === procedurePriceMax
		? `${procedurePriceMin.toLocaleString()} ${procedureCurrency}`
		: `${procedurePriceMin.toLocaleString()}–${procedurePriceMax.toLocaleString()} ${procedureCurrency}`;
}

export default async function ClinicProfilePage({
	params,
}: {
	params: Promise<{ id: string; locale: string }>;
}) {
	const { id, locale } = await params;
	const [profile, t] = await Promise.all([
		fetchClinicProfile(id, locale),
		getTranslations("clinicProfile"),
	]);
	if (!profile) notFound();

	const { clinic, procedures } = profile;
	const startingPrice = procedures.length
		? `$${Math.min(...procedures.map((p) => p.procedurePriceMin)).toLocaleString()}`
		: "Contact clinic";
	const tags = [
		...clinic.clinicSpecialties.map(titleCaseEnum),
		...procedures.map((p) => p.procedureName),
	].filter((tag, index, all) => all.indexOf(tag) === index);

	// clinicImages is [] until a clinic uploads real photos — fall back to the
	// generic placeholder rather than showing a broken/empty hero.
	const coverImage = clinic.clinicImages[0] || "/doctor/doctor.jpg";
	const galleryImages = clinic.clinicImages.slice(1, 4);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<ClinicJsonLd clinic={clinic} clinicId={id} locale={locale} />
			<section className="relative h-[300px] overflow-hidden bg-brand-teal-900 sm:h-[380px]">
				<Image src={coverImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-75" />
				<div className="absolute inset-0 bg-linear-to-r from-brand-teal-900/80 via-brand-teal-700/35 to-brand-teal-900/55" />
				<Link href="/clinics" className="absolute left-5 top-5 z-10 rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-brand-teal-900 shadow-lg transition hover:bg-white sm:left-8 sm:top-7">
					‹ Back to results
				</Link>
				{galleryImages.length > 0 && (
					<div className="absolute bottom-5 right-5 z-10 flex gap-2 sm:bottom-7 sm:right-8">
						{galleryImages.map((image) => (
							<div key={image} className="relative h-14 w-18 overflow-hidden rounded-lg border border-white/60 bg-white/20">
								<Image src={image} alt="" fill sizes="72px" className="object-cover" />
							</div>
						))}
						{clinic.clinicImages.length > 4 && (
							<div className="flex h-14 w-18 items-center justify-center rounded-lg border border-white/60 bg-brand-teal-900/55 text-xs font-bold text-white">
								+{clinic.clinicImages.length - 4}
							</div>
						)}
					</div>
				)}
			</section>

			<main className="mx-auto grid w-full max-w-[1540px] gap-9 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-12">
				<div className="min-w-0">
					<header>
						<p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-teal-500">International patient clinic</p>
						<h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-brand-teal-900 sm:text-5xl">{clinic.clinicName}</h1>
						<span className="mt-4 inline-flex rounded-full bg-brand-teal-100 px-3.5 py-1.5 text-xs font-bold text-brand-teal-700">
							✦ {clinicBadge(clinic.clinicRating, clinic.clinicReviewCount, t("verified"))}
						</span>
						<div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-muted sm:text-base">
							<span className="font-bold text-brand-ink">
								<span className="text-brand-gold">★</span> {clinic.clinicRating.toFixed(1)} · {t("reviewsCount", { count: clinic.clinicReviewCount })}
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
						<h2 className="font-serif text-2xl font-semibold text-brand-teal-900">{t("aboutTitle")}</h2>
						<p className="mt-4 max-w-4xl text-base leading-8 text-brand-muted">{clinic.clinicDesc}</p>
					</section>

					<section className="mt-10">
						<h2 className="font-serif text-2xl font-semibold text-brand-teal-900">{t("proceduresTitle")}</h2>
						<div className="mt-4 divide-y divide-brand-line border-y border-brand-line">
							{procedures.map((procedure) => (
								<div key={procedure._id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h3 className="font-semibold text-brand-ink">{procedure.procedureName}</h3>
										<p className="mt-1 text-sm text-brand-muted">
											{procedure.procedureDesc || titleCaseEnum(procedure.procedureCategory)}
											{procedure.procedureDuration > 0 ? ` · ${t("recoveryDays", { days: procedure.procedureDuration })}` : ""}
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
					<ClinicBookingCard
						clinicSlug={id}
						clinicName={clinic.clinicName}
						startingPrice={startingPrice}
						procedures={procedures.map((p) => ({
							_id: p._id,
							procedureName: p.procedureName,
							procedurePriceMin: p.procedurePriceMin,
						}))}
					/>
				</div>
			</main>
		</div>
	);
}
