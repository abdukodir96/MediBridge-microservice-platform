import type { Metadata } from "next";
import { ClinicProcedureFormScreen } from "@/components/clinic-procedure-form-screen";

export const metadata: Metadata = {
  title: "Edit Procedure | My Clinic | MediBridge",
  description: "Update a procedure on your MediBridge clinic profile.",
};

export default async function EditClinicProcedurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClinicProcedureFormScreen mode="edit" procedureId={id} />;
}
