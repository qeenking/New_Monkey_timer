import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import * as timerService from './timerService';

function TimerScreen() {
  const insets = useSafeAreaInsets();
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
        <Text style={styles.timerText}>
          {displayTime.minutes}:{displayTime.seconds}
        </Text>

        <Image
          source={require('./assets/character.png')}
          style={styles.character}
          resizeMode="contain"
        />

        <View style={styles.setWrap}>
          <Image
            source={require('./assets/set_label.png')}
            style={styles.setLabelImg}
            resizeMode="contain"
          />
          <Text style={styles.setNumber}>{setCount}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleStartStopToggle}>
          <Image
            source={
              isRunning
                ? require('./assets/stop_btn.png')
                : require('./assets/start_btn.png')
            }
            style={styles.pillBtnImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => timerService.reset()}>
          <Image
            source={require('./assets/reset_btn.png')}
            style={styles.pillBtnImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => timerService.addSet()}>
          <Image
            source={require('./assets/set_btn.png')}
            style={styles.pillBtnImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => timerService.done()}>
        <Image
          source={require('./assets/done_btn.png')}
          style={styles.doneBtnImg}
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
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    marginBottom: 8,
  },
  character: {
    width: 220,
    height: 148,
    marginBottom: 8,
  },
  setWrap: {
    width: 140,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    color: COLOR_TEXT,
    fontSize: 22,
    fontWeight: '800',
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  setLabelImg: {
    width: 140,
    height: 56,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pillBtnImg: {
    width: 97,
    height: 70,
    marginHorizontal: 4,
  },
  doneBtnImg: {
    width: 135,
    height: 135,
    marginBottom: 20,
  },
});
