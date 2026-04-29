import { ssoRoles } from "@/lib/sso-data";
import RoleFormClient from "./RoleFormClient";

export function generateStaticParams() {
  return [
    { id: "new" },
    ...ssoRoles.map((r) => ({ id: r.id })),
  ];
}

export default function RoleFormPage() {
  return <RoleFormClient />;
}
