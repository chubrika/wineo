import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryRedirectPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/buy/${encodeURIComponent(slug)}`);
}
