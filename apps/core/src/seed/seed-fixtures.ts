import 'dotenv/config';
import * as mongoose from 'mongoose';
import MemberSchema from '../libs/schema/member.model';
import ClinicSchema from '../libs/schema/clinic.model';
import ProcedureSchema from '../libs/schema/procedure.model';
import { MemberType, MemberLang } from '../libs/enums/member.enum';
import { ClinicStatus, ClinicSpecialty } from '../libs/enums/clinic.enum';
import { ProcedureCategory } from '../libs/enums/procedure.enum';

// Dev/test-only fixtures: a CLINIC owner + 24 VERIFIED clinics (each with one
// procedure) + a PATIENT, so local/E2E testing and frontend development don't
// need manual DB edits every time. Mirrors the 24 clinics the frontend's
// /clinics page currently renders from a hardcoded array, so once that page
// switches to real data the grid/pagination/filters keep working unchanged.
// Uses known passwords on purpose (it's throwaway test data) — never run
// this against production.

type ClinicFixture = {
	name: string;
	address: string;
	specialty: ClinicSpecialty;
	lang: MemberLang;
	rating: number;
	reviews: number;
	desc: string;
	procedureName: string;
	category: ProcedureCategory;
	priceMin: number;
};

const CLINICS: ClinicFixture[] = [
	{ name: 'Seoul Line Clinic', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.ZH, rating: 4.9, reviews: 312, desc: 'Established in 2009 in the heart of Gangnam, Seoul Line Clinic specializes in natural-looking rhinoplasty. Board-certified surgeons have treated more than 8,000 international patients, with dedicated Chinese and English coordinators guiding every step of the journey.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2400 },
	{ name: 'Banobagi Aesthetic', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 5.0, reviews: 489, desc: 'Banobagi Aesthetic is one of Korea’s most recognized facial contouring centers, known for precise V-line surgery and a fully English-speaking patient care team that walks foreign patients through every consultation.', procedureName: 'V-line Face Contouring', category: ProcedureCategory.FACE, priceMin: 3100 },
	{ name: 'ID Hospital', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.JA, rating: 4.7, reviews: 920, desc: 'ID Hospital is a large multi-surgeon plastic surgery hospital in Gangnam with over a decade of experience in rhinoplasty. A dedicated Japanese-language desk handles scheduling, translation, and aftercare follow-up.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2800 },
	{ name: 'VIP Plastic Surgery', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.ZH, rating: 4.8, reviews: 154, desc: 'VIP Plastic Surgery in Apgujeong focuses on refined, natural rhinoplasty results for international patients, with a Chinese-speaking coordinator available throughout consultation, surgery, and recovery.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2600 },
	{ name: 'Apgujeong Derma Center', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.DERMATOLOGY, lang: MemberLang.JA, rating: 4.8, reviews: 206, desc: 'Apgujeong Derma Center offers advanced laser and skin rejuvenation treatments in one of Seoul’s most established dermatology districts, with Japanese-speaking staff for a smooth first-time visit.', procedureName: 'Skin Rejuvenation', category: ProcedureCategory.SKIN, priceMin: 180 },
	{ name: 'Wonjin Beauty Medical', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 4.9, reviews: 271, desc: 'Wonjin Beauty Medical is known internationally for rhinoplasty and revision surgery, backed by an in-house international patient center that coordinates every stage in English.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2900 },
	{ name: 'JK Plastic Surgery', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 4.9, reviews: 438, desc: 'JK Plastic Surgery has treated patients from over 60 countries, with a rhinoplasty program built around 3D simulation consultations and English-speaking patient coordinators.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2750 },
	{ name: 'Toxnfill Dermatology', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.DERMATOLOGY, lang: MemberLang.ZH, rating: 4.7, reviews: 361, desc: 'Toxnfill Dermatology specializes in non-surgical skin rejuvenation and injectables, popular with Chinese-speaking patients visiting Seoul for short recovery-free treatment trips.', procedureName: 'Skin Rejuvenation', category: ProcedureCategory.SKIN, priceMin: 220 },
	{ name: 'Seoul Dental Hub', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.DENTAL, lang: MemberLang.EN, rating: 4.8, reviews: 184, desc: 'Seoul Dental Hub offers cosmetic and general dentistry for international visitors, with same-day teeth whitening and an English-speaking front desk built for short-stay patients.', procedureName: 'Teeth Whitening', category: ProcedureCategory.DENTAL, priceMin: 350 },
	{ name: 'ForHair Clinic', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.HAIR_TRANSPLANT, lang: MemberLang.JA, rating: 4.9, reviews: 226, desc: 'ForHair Clinic is a hair-transplant-only practice using FUE extraction, with a Japanese patient program covering pre-op planning through post-op hair growth check-ins.', procedureName: 'Hair Transplant (FUE)', category: ProcedureCategory.HAIR, priceMin: 3400 },
	{ name: 'View Plastic Surgery', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 4.8, reviews: 517, desc: 'View Plastic Surgery is recognized for facial contouring and jaw surgery, with an international team that supports English-speaking patients from first inquiry to final follow-up.', procedureName: 'V-line Face Contouring', category: ProcedureCategory.FACE, priceMin: 4200 },
	{ name: 'Dream Medical Center', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.ZH, rating: 4.7, reviews: 298, desc: 'Dream Medical Center in Apgujeong is a mid-size rhinoplasty-focused practice with a dedicated Chinese-language consultation room and transparent, itemized pricing.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2550 },
	{ name: 'JY Dermatology', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.DERMATOLOGY, lang: MemberLang.JA, rating: 4.8, reviews: 173, desc: 'JY Dermatology focuses on gentle, results-driven skin rejuvenation treatments, with a loyal Japanese patient base who return for seasonal skincare visits.', procedureName: 'Skin Rejuvenation', category: ProcedureCategory.SKIN, priceMin: 195 },
	{ name: 'Gangnam Dental Center', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.DENTAL, lang: MemberLang.EN, rating: 4.9, reviews: 342, desc: 'Gangnam Dental Center combines cosmetic dentistry with general care, offering same-visit teeth whitening and English-language treatment plans for visiting patients.', procedureName: 'Teeth Whitening', category: ProcedureCategory.DENTAL, priceMin: 420 },
	{ name: 'Motion Hair Clinic', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.HAIR_TRANSPLANT, lang: MemberLang.EN, rating: 4.8, reviews: 207, desc: 'Motion Hair Clinic specializes in FUE hair transplantation with a strong track record among international patients, supported by an English-speaking aftercare team.', procedureName: 'Hair Transplant (FUE)', category: ProcedureCategory.HAIR, priceMin: 3250 },
	{ name: 'DA Plastic Surgery', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.ZH, rating: 4.9, reviews: 611, desc: 'DA Plastic Surgery is one of the highest-volume rhinoplasty practices in Sinsa-dong, with a large Chinese-speaking patient coordination team handling travel and recovery logistics.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2950 },
	{ name: 'Seoul Face Center', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.JA, rating: 4.7, reviews: 264, desc: 'Seoul Face Center specializes in comprehensive facial contouring for patients seeking a fuller transformation, with a dedicated Japanese-language consultation program.', procedureName: 'V-line Face Contouring', category: ProcedureCategory.FACE, priceMin: 4800 },
	{ name: 'Renew Rhinoplasty', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 4.8, reviews: 193, desc: 'Renew Rhinoplasty is a boutique practice focused exclusively on primary and revision nose surgery, with English-speaking surgeons who personally handle every consultation.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2700 },
	{ name: 'Oracle Dermatology', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.DERMATOLOGY, lang: MemberLang.ZH, rating: 4.6, reviews: 405, desc: 'Oracle Dermatology is a high-volume skin clinic popular with short-stay visitors, offering rejuvenation packages designed around a typical week-long Seoul trip.', procedureName: 'Skin Rejuvenation', category: ProcedureCategory.SKIN, priceMin: 160 },
	{ name: 'Bright Smile Dental', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.DENTAL, lang: MemberLang.JA, rating: 4.9, reviews: 218, desc: 'Bright Smile Dental provides cosmetic whitening and general dental care in Apgujeong, with a Japanese-speaking coordinator for patients combining dental work with other treatments.', procedureName: 'Teeth Whitening', category: ProcedureCategory.DENTAL, priceMin: 390 },
	{ name: 'Maxwell Hair Clinic', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.HAIR_TRANSPLANT, lang: MemberLang.EN, rating: 4.8, reviews: 287, desc: 'Maxwell Hair Clinic offers FUE hair restoration with a strong international reputation, including English-language planning sessions and long-term growth tracking.', procedureName: 'Hair Transplant (FUE)', category: ProcedureCategory.HAIR, priceMin: 3600 },
	{ name: 'Woori Plastic Surgery', address: 'Sinsa-dong, Seoul', specialty: ClinicSpecialty.PLASTIC_SURGERY, lang: MemberLang.EN, rating: 4.7, reviews: 352, desc: 'Woori Plastic Surgery is a well-established Sinsa-dong practice offering rhinoplasty and facial procedures, with an English-speaking team handling international bookings.', procedureName: 'Rhinoplasty', category: ProcedureCategory.FACE, priceMin: 2650 },
	{ name: 'Reone Dermatology', address: 'Apgujeong, Seoul', specialty: ClinicSpecialty.DERMATOLOGY, lang: MemberLang.ZH, rating: 4.8, reviews: 149, desc: 'Reone Dermatology is a boutique skin clinic in Apgujeong known for personalized rejuvenation plans and a Chinese-speaking consultation team.', procedureName: 'Skin Rejuvenation', category: ProcedureCategory.SKIN, priceMin: 210 },
	{ name: 'Onejin Dental', address: 'Gangnam-gu, Seoul', specialty: ClinicSpecialty.DENTAL, lang: MemberLang.EN, rating: 4.7, reviews: 176, desc: 'Onejin Dental offers cosmetic and restorative dentistry for international visitors, with flexible same-week appointments and English-speaking treatment coordinators.', procedureName: 'Teeth Whitening', category: ProcedureCategory.DENTAL, priceMin: 330 },
];

// Rounds to the nearest 50 so generated max prices look like real pricing
// tiers instead of arbitrary decimals.
const roundTo50 = (value: number): number => Math.round(value / 50) * 50;

async function seedFixtures() {
	if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'seed:fixtures must not be run in production (creates test accounts with known passwords)',
		);
	}

	const { MONGO_URI } = process.env;
	if (!MONGO_URI) {
		throw new Error('MONGO_URI is not set');
	}

	const CLINIC_EMAIL = process.env.FIXTURE_CLINIC_EMAIL ?? 'clinic-owner@fixture.dev';
	const CLINIC_PASSWORD = process.env.FIXTURE_CLINIC_PASSWORD ?? 'fixture1234';
	const PATIENT_EMAIL = process.env.FIXTURE_PATIENT_EMAIL ?? 'patient@fixture.dev';
	const PATIENT_PASSWORD = process.env.FIXTURE_PATIENT_PASSWORD ?? 'fixture1234';

	await mongoose.connect(MONGO_URI);
	const MemberModel = mongoose.model('Member', MemberSchema);
	const ClinicModel = mongoose.model('Clinic', ClinicSchema);
	const ProcedureModel = mongoose.model('Procedure', ProcedureSchema);

	let owner = await MemberModel.findOne({ memberEmail: CLINIC_EMAIL });
	if (!owner) {
		owner = await MemberModel.create({
			memberEmail: CLINIC_EMAIL,
			memberPassword: CLINIC_PASSWORD, // hashed by the schema's pre('save') hook
			memberNick: 'fixture-clinic',
			memberPhone: '+000000000',
			memberType: MemberType.CLINIC,
		});
		console.log(`Created CLINIC owner: ${CLINIC_EMAIL} / ${CLINIC_PASSWORD}`);
	} else {
		console.log(`CLINIC owner already exists: ${CLINIC_EMAIL}`);
	}

	let createdClinics = 0;
	let updatedClinics = 0;
	let createdProcedures = 0;

	for (const fixture of CLINICS) {
		let clinic = await ClinicModel.findOne({
			clinicName: fixture.name,
			clinicOwnerId: owner._id,
		});
		if (!clinic) {
			clinic = await ClinicModel.create({
				clinicName: fixture.name,
				clinicAddress: fixture.address,
				clinicDesc: fixture.desc,
				clinicSpecialties: [fixture.specialty],
				clinicLangs: [...new Set([fixture.lang, MemberLang.EN])],
				clinicStatus: ClinicStatus.VERIFIED,
				clinicRating: fixture.rating,
				clinicReviewCount: fixture.reviews,
				clinicOwnerId: owner._id,
			});
			createdClinics++;
		} else if (!clinic.clinicDesc) {
			// Backfills clinics created by an earlier version of this script,
			// before clinicDesc was part of the fixture data.
			clinic.clinicDesc = fixture.desc;
			await clinic.save();
			updatedClinics++;
		}

		let procedure = await ProcedureModel.findOne({ procedureClinicId: clinic._id });
		if (!procedure) {
			procedure = await ProcedureModel.create({
				procedureName: fixture.procedureName,
				procedureCategory: fixture.category,
				procedurePriceMin: fixture.priceMin,
				procedurePriceMax: roundTo50(fixture.priceMin * 1.4),
				procedureClinicId: clinic._id,
			});
			createdProcedures++;
		}
	}

	console.log(
		`Clinics: ${createdClinics} created, ${updatedClinics} backfilled with a description, ${CLINICS.length - createdClinics - updatedClinics} unchanged.`,
	);
	console.log(
		`Procedures: ${createdProcedures} created, ${CLINICS.length - createdProcedures} already existed.`,
	);

	let patient = await MemberModel.findOne({ memberEmail: PATIENT_EMAIL });
	if (!patient) {
		patient = await MemberModel.create({
			memberEmail: PATIENT_EMAIL,
			memberPassword: PATIENT_PASSWORD,
			memberNick: 'fixture-patient',
			memberPhone: '+000000001',
			memberType: MemberType.PATIENT,
		});
		console.log(`Created PATIENT: ${PATIENT_EMAIL} / ${PATIENT_PASSWORD}`);
	} else {
		console.log(`PATIENT already exists: ${PATIENT_EMAIL}`);
	}

	console.log('\nSummary:');
	console.log(`  clinics seeded: ${CLINICS.length}`);
	console.log(`  CLINIC login:   ${CLINIC_EMAIL} / ${CLINIC_PASSWORD}`);
	console.log(`  PATIENT login:  ${PATIENT_EMAIL} / ${PATIENT_PASSWORD}`);

	await mongoose.disconnect();
}

seedFixtures()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seed failed:', err.message);
		process.exit(1);
	});
