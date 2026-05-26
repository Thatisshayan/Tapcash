import PageMetadata from "@/components/PageMetadata";

export default function Head() {
  return (
    <PageMetadata
      title="Admin | TapCash"
      description="TapCash admin tools for reviewing users, fraud flags, ledger activity, and payout requests."
      canonical="/admin"
      noindex
    />
  );
}
