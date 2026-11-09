import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isRole } from "@/lib/permissions";

export default async function DashboardRootPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  if (isRole(role)) {
    redirect(`/dashboard/${role}`);
  }

  redirect("/login");
}
