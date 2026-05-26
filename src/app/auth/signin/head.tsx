import PageMetadata from "@/components/PageMetadata";

export default function Head() {
  return (
    <PageMetadata
      title="Sign In | TapCash"
      description="Access your TapCash dashboard to view offers, balances, and cashout progress."
      canonical="/auth/signin"
      noindex
    />
  );
}
