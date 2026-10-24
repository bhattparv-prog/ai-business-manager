import AppLayout from "@/components/AppLayout";
import DashboardClient from "./DashboardClient";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <AppLayout>
      <DashboardClient initialUser={session} />
    </AppLayout>
  );
}
