import { gql } from "@apollo/client";
import { apolloClient } from "@/lib/apollo";

const GET_UPLOAD_SIGNATURE = gql`
	query GetUploadSignature($folder: UploadFolder!) {
		getUploadSignature(folder: $folder) {
			signature
			timestamp
			apiKey
			cloudName
			folder
		}
	}
`;

export type UploadFolder = "CLINIC_GALLERY" | "PROCEDURE_IMAGES" | "PROFILE_IMAGE";

interface GetUploadSignatureData {
	getUploadSignature: {
		signature: string;
		timestamp: number;
		apiKey: string;
		cloudName: string;
		folder: string;
	};
}

export async function uploadImageToCloudinary(
	file: File,
	folder: UploadFolder,
): Promise<string> {
	// A fresh signature per file — timestamp-bound and single-use, so it must
	// never be served from Apollo's cache (a reused signature is rejected by
	// Cloudinary).
	const { data } = await apolloClient.query<GetUploadSignatureData>({
		query: GET_UPLOAD_SIGNATURE,
		variables: { folder },
		fetchPolicy: "network-only",
	});
	if (!data) throw new Error("Failed to get an upload signature");
	const sig = data.getUploadSignature;

	const formData = new FormData();
	formData.append("file", file);
	formData.append("api_key", sig.apiKey);
	formData.append("timestamp", String(sig.timestamp));
	formData.append("signature", sig.signature);
	formData.append("folder", sig.folder); // must match what was signed exactly

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
		{ method: "POST", body: formData },
	);

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.error?.message ?? "Upload failed");
	}

	const result = await res.json();
	return result.secure_url as string;
}
