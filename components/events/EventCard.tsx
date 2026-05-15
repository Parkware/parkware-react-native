import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import { DocDataPair, EventStatus } from "../../types/events";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface EventCardProps {
  event: DocDataPair;
  showName?: boolean;
  showSpaces?: boolean;
  status?: EventStatus;
  textStyle?: StyleProp<TextStyle>;
}

const toDate = (value: DocDataPair["doc"]["startTime"]) => ("toDate" in value ? value.toDate() : value);

const formatTime = (value: DocDataPair["doc"]["startTime"]) =>
  toDate(value).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });

const formatDate = (value: DocDataPair["doc"]["startTime"]) => toDate(value).toLocaleDateString();

const statusLabels: Record<EventStatus, string> = {
  accepted: "Accepted",
  ended: "Ended",
  open: "Open",
  pending: "Pending",
};

export const EventCard = ({ event, showName = true, showSpaces = true, status, textStyle }: EventCardProps) => (
  <View>
    <View style={styles.headerRow}>
      {showName && <Text style={[styles.title, textStyle]}>{event.doc.eventName}</Text>}
      {status && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabels[status]}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.eventText, textStyle]}>Address  {event.doc.address}</Text>
    <Text style={[styles.eventText, textStyle]}>Date  {formatDate(event.doc.startTime)}</Text>
    <Text style={[styles.eventText, textStyle]}>
      Time: {formatTime(event.doc.startTime)} - {formatTime(event.doc.endTime)}
    </Text>
    {showSpaces && (
      <Text style={[styles.eventText, textStyle]}>
        Spaces: {event.doc.accSpaceCount} / {event.doc.requestedSpaces}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  eventText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 2,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    paddingRight: spacing.sm,
  },
});
