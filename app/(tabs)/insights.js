import { ScrollView, StyleSheet, View } from "react-native";
import { Card, ProgressBar, Text } from "react-native-paper";

export default function InsightsScreen() {
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
                28 ngày
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">Độ dài kinh nguyệt:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                5 ngày
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyMedium">Chu kỳ đã theo dõi:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                6 chu kỳ
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
              Chu kỳ của bạn khá đều đặn với độ lệch trung bình ±2 ngày
            </Text>
            <ProgressBar
              progress={0.85}
              color="#4caf50"
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              85% độ đều đặn
            </Text>
          </Card.Content>
        </Card>

        {/* Symptoms Tracking */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Triệu chứng thường gặp
            </Text>
            <View style={styles.symptomItem}>
              <Text variant="bodyMedium">Đau bụng kinh</Text>
              <ProgressBar
                progress={0.7}
                color="#ff9800"
                style={styles.symptomBar}
              />
              <Text variant="bodySmall">70%</Text>
            </View>
            <View style={styles.symptomItem}>
              <Text variant="bodyMedium">Thay đổi tâm trạng</Text>
              <ProgressBar
                progress={0.6}
                color="#ff9800"
                style={styles.symptomBar}
              />
              <Text variant="bodySmall">60%</Text>
            </View>
            <View style={styles.symptomItem}>
              <Text variant="bodyMedium">Mệt mỏi</Text>
              <ProgressBar
                progress={0.5}
                color="#ff9800"
                style={styles.symptomBar}
              />
              <Text variant="bodySmall">50%</Text>
            </View>
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
                12/02/2024
              </Text>
            </View>
            <View style={styles.predictionItem}>
              <Text variant="bodyMedium">Ngày rụng trứng dự kiến:</Text>
              <Text variant="bodyLarge" style={styles.predictionDate}>
                26/02/2024
              </Text>
            </View>
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
