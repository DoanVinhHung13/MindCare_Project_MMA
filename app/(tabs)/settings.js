import { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, List, Switch, Text, ActivityIndicator } from "react-native-paper";
import { useApp } from "../../src/contexts/AppContext";

export default function SettingsScreen() {
  const {
    user,
    settings,
    updateSettings,
    logout,
    exportData,
    clearAllData,
    dataLoading
  } = useApp();

  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    reminderPeriod: true,
    reminderOvulation: true,
    darkMode: false,
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStart: null
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        notifications: settings.notifications?.enabled || true,
        reminderPeriod: settings.notifications?.periodReminder || true,
        reminderOvulation: settings.notifications?.ovulationReminder || true,
        darkMode: settings.darkMode || false,
        averageCycleLength: settings.averageCycleLength || 28,
        averagePeriodLength: settings.averagePeriodLength || 5,
        lastPeriodStart: settings.lastPeriodStart
      });
    }
  }, [settings]);

  const handleSettingChange = async (key, value) => {
    const newLocalSettings = { ...localSettings, [key]: value };
    setLocalSettings(newLocalSettings);

    // Update settings in context
    const newSettings = {
      ...settings,
      notifications: {
        ...settings?.notifications,
        enabled: key === 'notifications' ? value : localSettings.notifications,
        periodReminder: key === 'reminderPeriod' ? value : localSettings.reminderPeriod,
        ovulationReminder: key === 'reminderOvulation' ? value : localSettings.reminderOvulation,
      },
      darkMode: key === 'darkMode' ? value : localSettings.darkMode,
      averageCycleLength: key === 'averageCycleLength' ? value : localSettings.averageCycleLength,
      averagePeriodLength: key === 'averagePeriodLength' ? value : localSettings.averagePeriodLength,
      lastPeriodStart: key === 'lastPeriodStart' ? value : localSettings.lastPeriodStart,
    };

    try {
      await updateSettings(newSettings);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật cài đặt");
      // Revert local state on error
      setLocalSettings(localSettings);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await exportData();
      if (result.success) {
        Alert.alert(
          "Xuất dữ liệu",
          "Dữ liệu đã được chuẩn bị để xuất. Tính năng lưu file sẽ được phát triển trong phiên bản tiếp theo.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất dữ liệu");
    }
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
          onPress: async () => {
            try {
              const result = await clearAllData();
              if (result.success) {
                Alert.alert("Thành công", "Đã xóa tất cả dữ liệu");
              } else {
                Alert.alert("Lỗi", result.error);
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa dữ liệu");
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login'); // Chuyển hướng về trang login
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
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
        {/* User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin tài khoản
            </Text>
          </Card.Content>
          <List.Item
            title="Tên"
            description={user?.name || "Chưa có"}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
          <List.Item
            title="Email"
            description={user?.email || "Chưa có"}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Tuổi"
            description={user?.age ? `${user.age} tuổi` : "Chưa có"}
            left={(props) => <List.Icon {...props} icon="cake" />}
          />
        </Card>

        {/* Cycle Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cài đặt chu kỳ
            </Text>
          </Card.Content>
          <List.Item
            title="Độ dài chu kỳ trung bình"
            description={`${localSettings.averageCycleLength} ngày`}
            left={(props) => <List.Icon {...props} icon="calendar-range" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Edit cycle length")}
          />
          <List.Item
            title="Độ dài kinh nguyệt"
            description={`${localSettings.averagePeriodLength} ngày`}
            left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Edit period length")}
          />
          <List.Item
            title="Ngày bắt đầu chu kỳ gần nhất"
            description={formatDate(localSettings.lastPeriodStart)}
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
                value={localSettings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
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
                value={localSettings.reminderPeriod}
                onValueChange={(value) => handleSettingChange('reminderPeriod', value)}
                disabled={!localSettings.notifications}
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
                value={localSettings.reminderOvulation}
                onValueChange={(value) => handleSettingChange('reminderOvulation', value)}
                disabled={!localSettings.notifications}
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
                value={localSettings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
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

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tài khoản
            </Text>
          </Card.Content>
          <List.Item
            title="Đăng xuất"
            left={(props) => <List.Icon {...props} icon="logout" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleLogout}
          />
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
