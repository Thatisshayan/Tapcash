import PageMetadata from "@/components/PageMetadata";

export default function Head() {
  return (
    <PageMetadata
      title="Ledger Transactions | TapCash"
      description="Review your verified TapCash ledger entries, offer credits, reversals, and cashout activity."
      canonical="/transactions"
      noindex
    />
  );
}
