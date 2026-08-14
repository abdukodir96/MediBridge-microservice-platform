import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { UploadSignatureResponse } from '../../libs/dto/upload/upload';
import { UploadFolder } from '../../libs/enums/upload.enum';
import { AuthGuard } from '../../libs/auth/guards/auth.guard';

// Real Cloudinary destination per whitelisted folder — kept out of the
// GraphQL-facing enum so the wire value stays a stable name, not a path.
const FOLDER_PATHS: Record<UploadFolder, string> = {
	[UploadFolder.CLINIC_GALLERY]: 'medibridge/clinics',
	[UploadFolder.PROCEDURE_IMAGES]: 'medibridge/procedures',
	[UploadFolder.PROFILE_IMAGE]: 'medibridge/profiles',
};

@Resolver()
export class UploadResolver {
	constructor(private readonly uploadService: UploadService) {}

	// Any logged-in member can request a signature — this alone doesn't
	// "unlock" anything, it just lets the file land in Cloudinary. Actually
	// attaching it to a clinic/procedure still goes through updateClinic/
	// updateProcedure, which already enforce ownership. Two-stage security:
	// signature = "you're logged in", save = "you own this".
	@UseGuards(AuthGuard)
	@Query(() => UploadSignatureResponse)
	public getUploadSignature(
		@Args('folder', { type: () => UploadFolder }) folder: UploadFolder,
	): UploadSignatureResponse {
		console.log('Query: getUploadSignature');
		return this.uploadService.createUploadSignature(FOLDER_PATHS[folder]);
	}
}
