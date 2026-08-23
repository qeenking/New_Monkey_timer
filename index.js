import { registerRootComponent } from 'expo';
import notifee from '@notifee/react-native';

import App from './App';

// 포그라운드 서비스(상태바 지속 알림)를 위한 필수 등록.
// React 컴포넌트 바깥, 앱 진입 시점에 가능한 한 일찍 등록해야 함.
notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    // 아무 작업도 하지 않고 계속 살아있기만 함.
    // stopForegroundService()를 호출할 때까지 서비스가 유지됨.
  });
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
