const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withNotifeeForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest.$['xmlns:tools']) {
      manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    mainApplication.service = (mainApplication.service || []).filter(
      (s) => s.$['android:name'] !== 'app.notifee.core.ForegroundService'
    );
    mainApplication.service.push({
      $: {
        'android:name': 'app.notifee.core.ForegroundService',
        'android:foregroundServiceType': 'specialUse',
        'tools:replace': 'android:foregroundServiceType',
      },
      property: [
        {
          $: {
            'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
            'android:value': 'workout timer status display',
          },
        },
      ],
    });
    return config;
  });
};
