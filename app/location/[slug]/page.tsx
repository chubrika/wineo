import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function LocationRedirectPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/buy?region=${encodeURIComponent(slug)}`);
}
