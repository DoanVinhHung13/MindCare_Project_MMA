import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, FAB, Text } from "react-native-paper";

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({
    "2024-01-15": {
      marked: true,
      dotColor: "#e91e63",
      customStyles: {
        container: { backgroundColor: "#ffebee" },
        text: { color: "#e91e63", fontWeight: "bold" },
      },
    },
  });

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType={"custom"}
              theme={{
                selectedDayBackgroundColor: "#e91e63",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#e91e63",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: "#e91e63",
                monthTextColor: "#2d4150",
                indicatorColor: "#e91e63",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </Card.Content>
        </Card>

        {/* Current Cycle Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin chu kỳ hiện tại
            </Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Ngày bắt đầu:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                15/01/2024
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Ngày dự kiến rụng trứng:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                29/01/2024
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Chu kỳ tiếp theo:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                12/02/2024
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thao tác nhanh
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.actionButton}
                buttonColor="#e91e63"
              >
                Đánh dấu ngày kinh
              </Button>
              <Button
                mode="outlined"
                style={styles.actionButton}
                textColor="#e91e63"
              >
                Ghi chú triệu chứng
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        customSize={56}
        onPress={() => console.log("Add pressed")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
    color: "#2d4150",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoValue: {
    fontWeight: "bold",
    color: "#e91e63",
  },
  buttonContainer: {
    gap: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#e91e63",
  },
});
