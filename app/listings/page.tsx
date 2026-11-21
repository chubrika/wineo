import { permanentRedirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageRaw = params.page;
  const page = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const pageNum = page ? Number(page) : 1;
  if (Number.isFinite(pageNum) && pageNum > 1) {
    permanentRedirect(`/buy?page=${pageNum}`);
  }
  permanentRedirect("/buy");
}
