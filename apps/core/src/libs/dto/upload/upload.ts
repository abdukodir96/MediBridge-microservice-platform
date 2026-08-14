import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class UploadSignatureResponse {
	@Field(() => String)
	signature: string;

	@Field(() => Int)
	timestamp: number;

	@Field(() => String)
	apiKey: string;

	@Field(() => String)
	cloudName: string;

	@Field(() => String)
	folder: string;
}
