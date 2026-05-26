type PageMetadataProps = {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  image?: string;
};

export default function PageMetadata({
  title,
  description,
  canonical,
  noindex = false,
  image = "/opengraph-image.png",
}: PageMetadataProps) {
  const url = `https://tapcash.online${canonical}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large"}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TapCash" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`https://tapcash.online${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://tapcash.online${image}`} />
    </>
  );
}
