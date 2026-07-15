import 'dotenv/config';
import * as mongoose from 'mongoose';
import MemberSchema from '../libs/schema/member.model';
import ClinicSchema from '../libs/schema/clinic.model';
import ProcedureSchema from '../libs/schema/procedure.model';
import { MemberType } from '../libs/enums/member.enum';
import { ClinicStatus, ClinicSpecialty } from '../libs/enums/clinic.enum';
import { ProcedureCategory } from '../libs/enums/procedure.enum';

// Dev/test-only fixtures: a CLINIC owner + a VERIFIED clinic + a procedure +
// a PATIENT, so local/E2E testing doesn't need manual DB edits every time.
// Uses known passwords on purpose (it's throwaway test data) — never run
// this against production.
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

	let clinic = await ClinicModel.findOne({ clinicOwnerId: owner._id });
	if (!clinic) {
		clinic = await ClinicModel.create({
			clinicName: 'Fixture Test Clinic',
			clinicAddress: 'Seoul, Gangnam',
			clinicSpecialties: [ClinicSpecialty.PLASTIC_SURGERY],
			clinicStatus: ClinicStatus.VERIFIED,
			clinicOwnerId: owner._id,
		});
		console.log(`Created VERIFIED clinic: ${clinic._id}`);
	} else {
		console.log(`Clinic already exists: ${clinic._id}`);
	}

	let procedure = await ProcedureModel.findOne({ procedureClinicId: clinic._id });
	if (!procedure) {
		procedure = await ProcedureModel.create({
			procedureName: 'Rhinoplasty',
			procedureCategory: ProcedureCategory.FACE,
			procedurePriceMin: 2400,
			procedurePriceMax: 3800,
			procedureClinicId: clinic._id,
		});
		console.log(`Created procedure: ${procedure._id}`);
	} else {
		console.log(`Procedure already exists: ${procedure._id}`);
	}

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
	console.log(`  clinicId:      ${clinic._id}`);
	console.log(`  procedureId:   ${procedure._id}`);
	console.log(`  CLINIC login:  ${CLINIC_EMAIL} / ${CLINIC_PASSWORD}`);
	console.log(`  PATIENT login: ${PATIENT_EMAIL} / ${PATIENT_PASSWORD}`);

	await mongoose.disconnect();
}

seedFixtures()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seed failed:', err.message);
		process.exit(1);
	});
