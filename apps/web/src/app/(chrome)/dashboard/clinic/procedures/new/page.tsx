import type { Metadata } from "next";
import { ClinicProcedureFormScreen } from "@/components/clinic-procedure-form-screen";

export const metadata: Metadata = {
  title: "Add Procedure | My Clinic | MediBridge",
  description: "Add a procedure to your MediBridge clinic profile.",
};

export default function AddClinicProcedurePage() {
  return <ClinicProcedureFormScreen mode="add" />;
}
