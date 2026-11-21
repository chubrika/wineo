import Image from "next/image";

function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    return url.hostname === "picsum.photos" || url.hostname.endsWith(".r2.dev");
  } catch {
    return false;
  }
}

type ContentImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

/** next/image for known hosts, with a plain img fallback so unknown URLs still render. */
export function ContentImage({
  src,
  alt,
  className,
  sizes,
  fill = false,
  width,
  height,
}: ContentImageProps) {
  if (!canOptimize(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }

  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes ?? "100vw"} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      sizes={sizes}
      className={className}
    />
  );
}
