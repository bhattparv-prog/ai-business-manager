import AppLayout from "@/components/AppLayout";
import RecordExplorerClient from "./RecordExplorerClient";

export default async function RecordExplorerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <AppLayout>
      <RecordExplorerClient slug={slug} />
    </AppLayout>
  );
}
