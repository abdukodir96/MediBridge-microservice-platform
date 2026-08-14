import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadSignatureResponse } from '../../libs/dto/upload/upload';

// This is deliberately the ONLY file in the app that talks to Cloudinary
// directly — every caller (the resolver, and eventually other services)
// goes through createUploadSignature()'s method signature, not Cloudinary's
// SDK. Swapping providers later (e.g. to S3) means rewriting this file's
// internals only.
@Injectable()
export class UploadService {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
	}

	// Generates a short-lived signature so the frontend can upload directly
	// to Cloudinary — the API secret never leaves this server.
	public createUploadSignature(folder: string): UploadSignatureResponse {
		const timestamp = Math.round(Date.now() / 1000);

		// Cloudinary computes the signature from exactly these params — the
		// frontend's upload request must send the SAME params back, or
		// Cloudinary rejects it as a signature mismatch.
		const signature = cloudinary.utils.api_sign_request(
			{ timestamp, folder },
			process.env.CLOUDINARY_API_SECRET as string,
		);

		return {
			signature,
			timestamp,
			apiKey: process.env.CLOUDINARY_API_KEY as string,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
			folder,
		};
	}
}
