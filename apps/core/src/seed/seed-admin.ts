import 'dotenv/config';
import * as mongoose from 'mongoose';
import MemberSchema from '../libs/schema/member.model';
import { MemberType } from '../libs/enums/member.enum';

// One-off bootstrap: MemberType.ADMIN can't be created through any GraphQL
// mutation (by design, to prevent privilege escalation via signup), so the
// very first admin has to be seeded directly against the database.
async function seedAdmin() {
	const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NICK, ADMIN_PHONE } =
		process.env;

	if (!MONGO_URI) {
		throw new Error('MONGO_URI is not set');
	}
	if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
		throw new Error(
			'ADMIN_EMAIL and ADMIN_PASSWORD must be set (e.g. ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin)',
		);
	}
	if (ADMIN_PASSWORD.length < 6) {
		throw new Error('ADMIN_PASSWORD must be at least 6 characters');
	}

	await mongoose.connect(MONGO_URI);
	const MemberModel = mongoose.model('Member', MemberSchema);

	const existing = await MemberModel.findOne({ memberEmail: ADMIN_EMAIL });
	if (existing) {
		if (existing.get('memberType') === MemberType.ADMIN) {
			console.log(`Admin already exists: ${ADMIN_EMAIL}`);
		} else {
			throw new Error(
				`A member with this email already exists with role ${existing.get('memberType')} — refusing to overwrite`,
			);
		}
	} else {
		await MemberModel.create({
			memberEmail: ADMIN_EMAIL,
			memberPassword: ADMIN_PASSWORD, // hashed by the schema's pre('save') hook
			memberNick: ADMIN_NICK ?? 'admin',
			memberPhone: ADMIN_PHONE ?? '-',
			memberType: MemberType.ADMIN,
		});
		console.log(`Admin created: ${ADMIN_EMAIL}`);
	}

	await mongoose.disconnect();
}

seedAdmin()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seed failed:', err.message);
		process.exit(1);
	});
