import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, List, Switch, Text } from "react-native-paper";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [reminderPeriod, setReminderPeriod] = useState(true);
  const [reminderOvulation, setReminderOvulation] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      "Xuất dữ liệu",
      "Tính năng xuất dữ liệu sẽ được phát triển trong phiên bản tiếp theo.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Xóa tất cả dữ liệu",
      "Bạn có chắc chắn muốn xóa tất cả dữ liệu đã theo dõi? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => console.log("Delete data"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cycle Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cài đặt chu kỳ
            </Text>
          </Card.Content>
          <List.Item
            title="Độ dài chu kỳ trung bình"
            description="28 ngày"
            left={(props) => <List.Icon {...props} icon="calendar-range" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Edit cycle length")}
          />
          <List.Item
            title="Độ dài kinh nguyệt"
            description="5 ngày"
            left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Edit period length")}
          />
          <List.Item
            title="Ngày bắt đầu chu kỳ gần nhất"
            description="15/01/2024"
            left={(props) => <List.Icon {...props} icon="calendar-start" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Edit last period")}
          />
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông báo
            </Text>
          </Card.Content>
          <List.Item
            title="Bật thông báo"
            description="Nhận nhắc nhở về chu kỳ"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#e91e63"
              />
            )}
          />
          <List.Item
            title="Nhắc nhở ngày kinh"
            description="Thông báo trước 2 ngày"
            left={(props) => <List.Icon {...props} icon="bell-ring" />}
            right={() => (
              <Switch
                value={reminderPeriod}
                onValueChange={setReminderPeriod}
                disabled={!notifications}
                color="#e91e63"
              />
            )}
          />
          <List.Item
            title="Nhắc nhở ngày rụng trứng"
            description="Thông báo vào ngày rụng trứng"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={reminderOvulation}
                onValueChange={setReminderOvulation}
                disabled={!notifications}
                color="#e91e63"
              />
            )}
          />
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cài đặt ứng dụng
            </Text>
          </Card.Content>
          <List.Item
            title="Chế độ tối"
            description="Giao diện tối cho mắt"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color="#e91e63"
              />
            )}
          />
          <List.Item
            title="Ngôn ngữ"
            description="Tiếng Việt"
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Change language")}
          />
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quản lý dữ liệu
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Sao lưu và quản lý dữ liệu theo dõi của bạn
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                icon="export"
                onPress={handleExportData}
                style={styles.dataButton}
                textColor="#2196f3"
              >
                Xuất dữ liệu
              </Button>
              <Button
                mode="outlined"
                icon="delete"
                onPress={handleDeleteData}
                style={styles.dataButton}
                textColor="#f44336"
              >
                Xóa tất cả dữ liệu
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Về ứng dụng
            </Text>
          </Card.Content>
          <List.Item
            title="Phiên bản"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Điều khoản sử dụng"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Terms of service")}
          />
          <List.Item
            title="Chính sách bảo mật"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Privacy policy")}
          />
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
    marginBottom: 8,
    fontWeight: "bold",
    color: "#2d4150",
  },
  description: {
    marginBottom: 16,
    color: "#666",
  },
  buttonContainer: {
    gap: 8,
  },
  dataButton: {
    marginVertical: 4,
  },
});
