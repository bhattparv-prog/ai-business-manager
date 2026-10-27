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
    <div className="flex min-h-screen bg-[#F5F6F7] text-[#1F2329] antialiased">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={session} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-[1400px] w-full mx-auto pb-24 md:pb-10">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
