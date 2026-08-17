import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type TranslatableEntityType = 'CLINIC' | 'PROCEDURE';

interface ContentTranslationDoc {
	entityType: TranslatableEntityType;
	entityId: string;
	locale: string;
	fields: Record<string, string>;
}

// Maps a URL locale segment (lowercase, from next-intl) to the AI service's
// language code (uppercase, matches Member.memberLang). 'en' is deliberately
// absent — translateFields() short-circuits before ever consulting this map,
// since content is always authored in English (see the class comment).
const LOCALE_TO_LANG: Record<string, string> = { zh: 'ZH', ko: 'KO', ja: 'JA' };

@Injectable()
export class TranslationService {
	constructor(
		@InjectModel('ContentTranslation')
		private readonly translationModel: Model<ContentTranslationDoc>,
	) {}

	// Translates a set of fields for one entity into one locale, cached after
	// the first successful call. Source language is always assumed English —
	// clinics/procedures are only ever authored in English today (no i18n
	// input UI exists for clinic owners), so there's no real "which language
	// is this in" question to ask.
	//
	// Fail-open per field: if the AI service is down/misconfigured/errors,
	// that field falls back to its original English text rather than
	// blocking the page — same philosophy as chat translation. The *whole*
	// result is only cached if every field translated successfully, so a
	// transient outage doesn't freeze a page in English forever; the next
	// request just retries.
	public async translateFields(
		entityType: TranslatableEntityType,
		entityId: string,
		locale: string,
		fields: Record<string, string>,
	): Promise<Record<string, string>> {
		const targetLang = LOCALE_TO_LANG[locale];
		if (!targetLang) return fields;

		const cached = await this.translationModel.findOne({ entityType, entityId, locale }).exec();
		if (cached) return cached.fields;

		const translated: Record<string, string> = {};
		let allSucceeded = true;

		for (const [key, text] of Object.entries(fields)) {
			if (!text) {
				translated[key] = text;
				continue;
			}
			const result = await this.callAiTranslate(text, 'EN', targetLang);
			if (result) {
				translated[key] = result;
			} else {
				translated[key] = text;
				allSucceeded = false;
			}
		}

		if (allSucceeded) {
			await this.translationModel
				.findOneAndUpdate(
					{ entityType, entityId, locale },
					{ fields: translated },
					{ upsert: true },
				)
				.exec();
		}

		return translated;
	}

	private async callAiTranslate(
		text: string,
		sourceLang: string,
		targetLang: string,
	): Promise<string | null> {
		try {
			const res = await fetch(`${process.env.AI_SERVICE_URL}/translate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text, sourceLang, targetLang }),
				signal: AbortSignal.timeout(10_000),
			});
			if (!res.ok) return null;
			const data = (await res.json()) as { translatedText?: string };
			return data.translatedText ?? null;
		} catch {
			return null;
		}
	}
}
