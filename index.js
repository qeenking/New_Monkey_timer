import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';

import App from './App';
import { handleNotificationEvent, stop } from './timerService';

// 포그라운드 서비스(상태바 지속 알림)를 위한 필수 등록.
notifee.registerForegroundService(() => {
  return new Promise(() => {
    // stopForegroundService()가 호출될 때까지 계속 유지됨
  });
});

// 앱이 백그라운드에 있을 때 알림의 "Stop" 버튼 눌림을 처리
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (
    type === EventType.ACTION_PRESS &&
    detail &&
    detail.pressAction &&
    detail.pressAction.id === 'stop'
  ) {
    await stop();
  }
});

registerRootComponent(App);
