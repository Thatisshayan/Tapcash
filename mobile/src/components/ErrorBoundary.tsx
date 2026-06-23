import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../theme";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          <Text style={styles.body}>Tap below to restart the app.</Text>
          <TouchableOpacity onPress={this.handleRestart} style={styles.button}>
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: "900",
    marginBottom: theme.spacing.sm,
  },
  body: {
    color: theme.colors.muted,
    fontSize: theme.font.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  button: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonText: {
    color: theme.colors.bg,
    fontSize: 15,
    fontWeight: "900",
  },
});
