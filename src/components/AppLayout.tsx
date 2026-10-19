import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={session} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
