import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import * as timerService from './timerService';

// 기준 화면 폭(대부분의 최신 폰). 이 값 대비 비율로 크기를 조절한다.
const BASE_WIDTH = 400;

function useScaledSizes() {
  const { width, height } = useWindowDimensions();
  // 화면 폭 기준 배율. 너무 작거나 크지 않게 상하한을 둔다.
  const scale = Math.min(Math.max(width / BASE_WIDTH, 0.75), 1.4);
  // 버튼 3개가 가로로 들어가야 하므로 폭 기준으로도 한 번 더 제한
  const maxPillWidth = (width - 48) / 3;
  const pillWidth = Math.min(97 * scale, maxPillWidth);

  return {
    pillWidth,
    pillHeight: pillWidth * (70 / 97),
    doneSize: Math.min(135 * scale, width * 0.38),
    characterWidth: Math.min(220 * scale, width * 0.62),
    characterHeight: Math.min(220 * scale, width * 0.62) * (148 / 220),
    timerFont: 48 * scale,
    setLabelWidth: 140 * scale,
    setLabelHeight: 56 * scale,
    setNumberFont: 22 * scale,
    // 세로로 짧은 화면에서는 여백을 줄인다
    compact: height < 700,
  };
}

function TimerScreen() {
  const insets = useSafeAreaInsets();
  const s = useScaledSizes();
  const [state, setState] = useState(timerService.getSnapshot());

  useEffect(() => {
    const unsubscribe = timerService.subscribe(setState);
    timerService.ensureNotificationSetup();
    const unsubscribeForeground = notifee.onForegroundEvent(
      timerService.handleNotificationEvent
    );
    return () => {
      unsubscribe();
      unsubscribeForeground();
    };
  }, []);

  const { displayTime, isRunning, setCount } = state;

  const handleStartStopToggle = () => {
    if (isRunning) {
      timerService.stop();
    } else {
      timerService.start();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.topArea}>
        <Text style={[styles.timerText, { fontSize: s.timerFont }]}>
          {displayTime.minutes}:{displayTime.seconds}
        </Text>

        <Image
          source={require('./assets/character.png')}
          style={{ width: s.characterWidth, height: s.characterHeight, marginBottom: 8 }}
          resizeMode="contain"
        />

        <View style={[styles.setWrap, { width: s.setLabelWidth, height: s.setLabelHeight }]}>
          <Image
            source={require('./assets/set_label.png')}
            style={{ width: s.setLabelWidth, height: s.setLabelHeight }}
            resizeMode="contain"
          />
          <Text style={[styles.setNumber, { fontSize: s.setNumberFont }]}>{setCount}</Text>
        </View>
      </View>

      <View style={[styles.buttonRow, { marginBottom: s.compact ? 10 : 20 }]}>
        <TouchableOpacity onPress={handleStartStopToggle}>
          <Image
            source={
              isRunning
                ? require('./assets/stop_btn.png')
                : require('./assets/start_btn.png')
            }
            style={[styles.pillBtnImg, { width: s.pillWidth, height: s.pillHeight }]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => timerService.reset()}>
          <Image
            source={require('./assets/reset_btn.png')}
            style={[styles.pillBtnImg, { width: s.pillWidth, height: s.pillHeight }]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => timerService.addSet()}>
          <Image
            source={require('./assets/set_btn.png')}
            style={[styles.pillBtnImg, { width: s.pillWidth, height: s.pillHeight }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => timerService.done()}>
        <Image
          source={require('./assets/done_btn.png')}
          style={[styles.doneBtnImg, { width: s.doneSize, height: s.doneSize }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TimerScreen />
    </SafeAreaProvider>
  );
}

const COLOR_BG = '#FFF7E8';
const COLOR_TEXT = '#3a2b1c';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: COLOR_TEXT,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    marginBottom: 8,
  },
  setWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    color: COLOR_TEXT,
    fontWeight: '800',
    position: 'absolute',
    top: '14%',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pillBtnImg: {
    marginHorizontal: 4,
  },
  doneBtnImg: {
    marginBottom: 20,
  },
});
