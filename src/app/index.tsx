import { StyleSheet, View } from 'react-native';

// 카메라 화면 자리. 문구는 i18n 기반(M0) 이후 추가한다.
export default function Index() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
