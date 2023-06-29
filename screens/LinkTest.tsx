import { A } from '@expo/html-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LinkTest() {
  return (
    <SafeAreaView>
    <A style={{ marginTop: 50, marginLeft: 40}} href="https://google.com">Go to Google</A>
    </SafeAreaView>
  )
}