import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useApp } from '../src/contexts/AppContext';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { login, register, isLoading, authError } = useApp();
  const router = useRouter();
  
  // Form state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!isLoginMode) {
      if (!formData.name.trim()) {
        newErrors.name = 'Vui lòng nhập họ tên';
      }

      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result;

      if (isLoginMode) {
        result = await login(formData.email, formData.password, formData.rememberMe);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          rememberMe: formData.rememberMe
        });
      }

      if (!result.success) {
        Alert.alert('Lỗi', result.error);
      } else {
        Toast.show({
          type: 'success',
          text1: isLoginMode ? 'Đăng nhập thành công!' : 'Đăng ký thành công!',
          text2: isLoginMode
            ? 'Chào mừng bạn quay lại ứng dụng 🎉'
            : 'Bạn đã đăng ký thành công, vui lòng đăng nhập!'
        });
        if (isLoginMode) {
          router.replace('/(tabs)');
        } else {
          setIsLoginMode(true); // Chuyển về chế độ đăng nhập
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            age: '',
            rememberMe: false
          });
          setErrors({});
          // Không chuyển hướng, chỉ chuyển form về login
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: '',
      rememberMe: false
    });
    setErrors({});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            MindCare
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Theo dõi chu kỳ kinh nguyệt
          </Text>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.formTitle}>
              {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
            </Text>

            {/* Email Input */}
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              error={!!errors.email}
              disabled={isSubmitting}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Name Input (Register only) */}
            {!isLoginMode && (
              <>
                <TextInput
                  label="Họ và tên"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.name}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                <TextInput
                  label="Tuổi"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </>
            )}

            {/* Password Input */}
            <TextInput
              label="Mật khẩu"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!errors.password}
              disabled={isSubmitting}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password Input (Register only) */}
            {!isLoginMode && (
              <>
                <TextInput
                  label="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  error={!!errors.confirmPassword}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </>
            )}

            {/* Remember Me Switch */}
            <View style={styles.switchContainer}>
              <Text variant="bodyMedium">Ghi nhớ đăng nhập</Text>
              <Switch
                value={formData.rememberMe}
                onValueChange={(value) => handleInputChange('rememberMe', value)}
                color="#e91e63"
                disabled={isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              buttonColor="#e91e63"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
            </Button>

            {/* Auth Error */}
            {authError && (
              <Text style={styles.authErrorText}>{authError}</Text>
            )}

            {/* Divider */}
            <Divider style={styles.divider} />

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text variant="bodyMedium" style={styles.toggleText}>
                {isLoginMode
                  ? 'Chưa có tài khoản? '
                  : 'Đã có tài khoản? '}
              </Text>
              <Button
                mode="text"
                onPress={toggleMode}
                textColor="#e91e63"
                disabled={isSubmitting}
                compact
              >
                {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản sử dụng</Text>
            {' '}và{' '}
            <Text style={styles.linkText}>Chính sách bảo mật</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#e91e63',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#2d4150',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 12,
  },
  authErrorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#e91e63',
    textDecorationLine: 'underline',
  },
});
