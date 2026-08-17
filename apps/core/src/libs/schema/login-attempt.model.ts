import { Schema } from 'mongoose';

const LoginAttemptSchema = new Schema(
	{
		email: { type: String, required: true },
		ipAddress: { type: String, required: true },
		attempts: { type: Number, default: 0 },
		lockedUntil: { type: Date, default: null },
	},
	{ timestamps: true },
);

// One record per email+IP pair — lockout is scoped to the pair, not the
// email alone, so a single attacker IP can't lock out the real owner
// logging in from elsewhere.
LoginAttemptSchema.index({ email: 1, ipAddress: 1 }, { unique: true });

export default LoginAttemptSchema;
