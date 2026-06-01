import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

export default function EntryPoint() {
  const { user, verified, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!verified) {
    return <Redirect href={{ pathname: "/(auth)/verify-email", params: { email: user.email ?? "" } }} />;
  }

  return <Redirect href="/(tabs)" />;
}
