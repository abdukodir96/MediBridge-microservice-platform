import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TranslationService } from './translation.service';
import ContentTranslationSchema from '../../libs/schema/content-translation.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'ContentTranslation', schema: ContentTranslationSchema },
		]),
	],
	providers: [TranslationService],
	exports: [TranslationService],
})
export class TranslationModule {}
