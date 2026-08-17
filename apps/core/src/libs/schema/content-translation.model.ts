import { Schema } from 'mongoose';

// Cache of AI-translated content fields, keyed by (entityType, entityId,
// locale). Shared by Clinic and Procedure — both are just "an id with a few
// translatable string fields", so one collection instead of two. Populated
// lazily (on first request for a given entity+locale, not pre-warmed) by
// TranslationService.
const ContentTranslationSchema = new Schema(
	{
		entityType: { type: String, enum: ['CLINIC', 'PROCEDURE'], required: true },
		entityId: { type: String, required: true },
		locale: { type: String, required: true },
		fields: { type: Schema.Types.Mixed, required: true },
	},
	{ timestamps: true },
);

ContentTranslationSchema.index(
	{ entityType: 1, entityId: 1, locale: 1 },
	{ unique: true },
);

export default ContentTranslationSchema;
