import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";

export const commonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  errorBox: {
    backgroundColor: "#F8EEEE",
    borderColor: "#E8CACA",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  link: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  screenTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
});
