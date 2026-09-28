import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

// 카메라 화면 자리. i18n 실기기 확인용으로 앱 이름을 표시하며, 카메라 화면이 생기면 제거한다.
export default function Index() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.name')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
