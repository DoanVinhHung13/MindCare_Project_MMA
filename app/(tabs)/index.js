import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, FAB, Text, ActivityIndicator } from "react-native-paper";
import { useApp } from "../../src/contexts/AppContext";

export default function HomeScreen() {
  const {
    selectedDate,
    setSelectedDate,
    markedDates,
    currentCycle,
    cycleStats,
    predictions,
    addCycle,
    addSymptom,
    getSymptomsByDate,
    dataLoading
  } = useApp();

  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddPeriod = async () => {
    if (!selectedDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày bắt đầu chu kỳ");
      return;
    }

    try {
      const result = await addCycle({
        startDate: selectedDate,
        periodLength: cycleStats?.averagePeriodLength || 5,
        cycleLength: cycleStats?.averageCycleLength || 28
      });

      if (result.success) {
        Alert.alert("Thành công", "Đã thêm chu kỳ mới");
        setShowAddPeriodModal(false);
      } else {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn");
    }
  };

  const handleAddSymptom = () => {
    if (!selectedDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày để thêm triệu chứng");
      return;
    }
    // TODO: Implement symptom modal
    Alert.alert("Thông báo", "Tính năng thêm triệu chứng sẽ được phát triển");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (dataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

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
                {formatDate(currentCycle?.startDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Ngày dự kiến rụng trứng:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(predictions?.nextOvulationDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Chu kỳ tiếp theo:</Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(predictions?.nextPeriodStart)}
              </Text>
            </View>
            {cycleStats && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium">Chu kỳ trung bình:</Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {cycleStats.averageCycleLength} ngày
                </Text>
              </View>
            )}
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
                onPress={handleAddPeriod}
              >
                Đánh dấu ngày kinh
              </Button>
              <Button
                mode="outlined"
                style={styles.actionButton}
                textColor="#e91e63"
                onPress={handleAddSymptom}
              >
                Ghi chú triệu chứng
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Selected Date Info */}
        {selectedDate && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Thông tin ngày {formatDate(selectedDate)}
              </Text>
              {(() => {
                const daySymptoms = getSymptomsByDate(selectedDate);
                return daySymptoms ? (
                  <View>
                    <Text variant="bodyMedium">Triệu chứng: {daySymptoms.symptoms?.join(', ') || 'Không có'}</Text>
                    {daySymptoms.notes && (
                      <Text variant="bodyMedium" style={styles.notes}>
                        Ghi chú: {daySymptoms.notes}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text variant="bodyMedium">Chưa có thông tin cho ngày này</Text>
                );
              })()}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        customSize={56}
        onPress={() => setShowAddPeriodModal(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
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
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});
