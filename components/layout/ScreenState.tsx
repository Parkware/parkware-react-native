import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface ScreenStateProps {
  title: string;
  message?: string;
}

export const ScreenState = ({ title, message }: ScreenStateProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginVertical: spacing.lg,
    padding: spacing.xl,
  },
  message: {
    color: colors.text,
    fontSize: 15,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
