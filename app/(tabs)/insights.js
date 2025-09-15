import { ScrollView, StyleSheet, View } from "react-native";
import { Card, ProgressBar, Text, ActivityIndicator } from "react-native-paper";
import { useApp } from "../../src/contexts/AppContext";

export default function InsightsScreen() {
  const {
    cycleStats,
    predictions,
    symptoms,
    dataLoading
  } = useApp();

  if (dataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate symptom frequency
  const getSymptomFrequency = () => {
    if (!symptoms || symptoms.length === 0) return [];

    const symptomCounts = {};
    symptoms.forEach(symptom => {
      symptom.symptoms?.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const totalDays = symptoms.length;
    return Object.entries(symptomCounts)
      .map(([symptom, count]) => ({
        symptom,
        frequency: count / totalDays,
        percentage: Math.round((count / totalDays) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Top 5 symptoms
  };

  const symptomFrequencies = getSymptomFrequency();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cycle Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tổng quan chu kỳ
            </Text>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">Chu kỳ trung bình:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {cycleStats?.averageCycleLength || 28} ngày
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">Độ dài kinh nguyệt:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {cycleStats?.averagePeriodLength || 5} ngày
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">Chu kỳ đã theo dõi:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {cycleStats?.totalCycles || 0} chu kỳ
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Cycle Regularity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tính đều đặn của chu kỳ
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {cycleStats?.regularity > 80 
                ? "Chu kỳ của bạn rất đều đặn"
                : cycleStats?.regularity > 60
                ? "Chu kỳ của bạn khá đều đặn"
                : cycleStats?.regularity > 40
                ? "Chu kỳ của bạn có độ lệch vừa phải"
                : "Chu kỳ của bạn có độ lệch lớn"
              }
            </Text>
            <ProgressBar
              progress={(cycleStats?.regularity || 0) / 100}
              color={cycleStats?.regularity > 60 ? "#4caf50" : "#ff9800"}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {cycleStats?.regularity || 0}% độ đều đặn
            </Text>
          </Card.Content>
        </Card>

        {/* Symptoms Tracking */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Triệu chứng thường gặp
            </Text>
            {symptomFrequencies.length > 0 ? (
              symptomFrequencies.map((item, index) => (
                <View key={index} style={styles.symptomItem}>
                  <Text variant="bodyMedium">{item.symptom}</Text>
                  <ProgressBar
                    progress={item.frequency}
                    color="#ff9800"
                    style={styles.symptomBar}
                  />
                  <Text variant="bodySmall">{item.percentage}%</Text>
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.noDataText}>
                Chưa có dữ liệu triệu chứng
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Predictions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Dự đoán chu kỳ tiếp theo
            </Text>
            <View style={styles.predictionItem}>
              <Text variant="bodyMedium">Ngày bắt đầu dự kiến:</Text>
              <Text variant="bodyLarge" style={styles.predictionDate}>
                {formatDate(predictions?.nextPeriodStart)}
              </Text>
            </View>
            <View style={styles.predictionItem}>
              <Text variant="bodyMedium">Ngày rụng trứng dự kiến:</Text>
              <Text variant="bodyLarge" style={styles.predictionDate}>
                {formatDate(predictions?.nextOvulationDate)}
              </Text>
            </View>
            {predictions?.fertileWindow && (
              <View style={styles.predictionItem}>
                <Text variant="bodyMedium">Cửa sổ thụ thai:</Text>
                <Text variant="bodyLarge" style={styles.predictionDate}>
                  {formatDate(predictions.fertileWindow.start)} - {formatDate(predictions.fertileWindow.end)}
                </Text>
              </View>
            )}
            <Text variant="bodySmall" style={styles.disclaimer}>
              * Dự đoán dựa trên dữ liệu chu kỳ trước đây
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
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
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statValue: {
    fontWeight: "bold",
    color: "#e91e63",
  },
  description: {
    marginBottom: 12,
    color: "#666",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    textAlign: "right",
    color: "#4caf50",
    fontWeight: "bold",
  },
  symptomItem: {
    marginBottom: 12,
  },
  symptomBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 4,
  },
  noDataText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  predictionDate: {
    fontWeight: "bold",
    color: "#e91e63",
  },
  disclaimer: {
    marginTop: 8,
    color: "#999",
    fontStyle: "italic",
  },
});
