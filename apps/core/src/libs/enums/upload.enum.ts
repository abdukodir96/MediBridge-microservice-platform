import { registerEnumType } from '@nestjs/graphql';

// Whitelisted upload destinations — the client picks one of these, never an
// arbitrary folder string. The resolver maps each to its actual Cloudinary
// path (see upload.resolver.ts's FOLDER_PATHS), so this enum is just the
// wire-level whitelist, not the real path.
export enum UploadFolder {
	CLINIC_GALLERY = 'CLINIC_GALLERY',
	PROCEDURE_IMAGES = 'PROCEDURE_IMAGES',
	PROFILE_IMAGE = 'PROFILE_IMAGE',
}
registerEnumType(UploadFolder, { name: 'UploadFolder' });
