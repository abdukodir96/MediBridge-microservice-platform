import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";

export type ProcedureCategory = "FACE" | "BODY" | "SKIN" | "DENTAL" | "HAIR" | "EYE";
export type ProcedureCurrency = "USD" | "KRW";

export interface Procedure {
	_id: string;
	procedureName: string;
	procedureCategory: ProcedureCategory;
	procedureDesc: string;
	procedurePriceMin: number;
	procedurePriceMax: number;
	procedureCurrency: ProcedureCurrency;
	procedureDuration: number;
	procedureImages: string[];
}

interface GetProcedureData {
	getProcedure: Procedure;
}
interface GetProcedureVars {
	procedureId: string;
}

export const GET_PROCEDURE: TypedDocumentNode<GetProcedureData, GetProcedureVars> = gql`
	query GetProcedure($procedureId: String!) {
		getProcedure(procedureId: $procedureId) {
			_id
			procedureName
			procedureCategory
			procedureDesc
			procedurePriceMin
			procedurePriceMax
			procedureCurrency
			procedureDuration
			procedureImages
		}
	}
`;

interface GetMyProceduresData {
	getMyProcedures: { list: Procedure[]; total: number };
}

// No variables — like getMyClinic, the caller's clinic is resolved from the
// auth token, and this bypasses getProceduresByClinic's VERIFIED filter so a
// PENDING clinic owner can still manage their own procedures.
export const GET_MY_PROCEDURES: TypedDocumentNode<GetMyProceduresData, Record<string, never>> = gql`
	query GetMyProcedures {
		getMyProcedures {
			total
			list {
				_id
				procedureName
				procedureCategory
				procedureDesc
				procedurePriceMin
				procedurePriceMax
				procedureCurrency
				procedureDuration
				procedureImages
			}
		}
	}
`;

export interface ProcedureInput {
	procedureName: string;
	procedureCategory: ProcedureCategory;
	procedureDesc?: string;
	procedurePriceMin: number;
	procedurePriceMax: number;
	procedureCurrency?: ProcedureCurrency;
	procedureDuration?: number;
	procedureImages?: string[];
	procedureClinicId: string;
}

interface CreateProcedureData {
	createProcedure: Procedure;
}
interface CreateProcedureVars {
	input: ProcedureInput;
}

export const CREATE_PROCEDURE: TypedDocumentNode<CreateProcedureData, CreateProcedureVars> = gql`
	mutation CreateProcedure($input: ProcedureInput!) {
		createProcedure(input: $input) {
			_id
		}
	}
`;

interface UpdateProcedureData {
	updateProcedure: Procedure;
}
interface UpdateProcedureVars {
	procedureId: string;
	input: ProcedureInput;
}

export const UPDATE_PROCEDURE: TypedDocumentNode<UpdateProcedureData, UpdateProcedureVars> = gql`
	mutation UpdateProcedure($procedureId: String!, $input: ProcedureInput!) {
		updateProcedure(procedureId: $procedureId, input: $input) {
			_id
		}
	}
`;

interface DeleteProcedureData {
	deleteProcedure: { _id: string };
}
interface DeleteProcedureVars {
	procedureId: string;
}

export const DELETE_PROCEDURE: TypedDocumentNode<DeleteProcedureData, DeleteProcedureVars> = gql`
	mutation DeleteProcedure($procedureId: String!) {
		deleteProcedure(procedureId: $procedureId) {
			_id
		}
	}
`;
