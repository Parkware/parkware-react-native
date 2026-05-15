import React, { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  centered?: boolean;
}

export const ScreenContainer = ({ children, centered = false, scroll = false }: ScreenContainerProps) => {
  const content = <View style={[styles.content, centered && styles.centered]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.scrollContent, centered && styles.centered]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
});
