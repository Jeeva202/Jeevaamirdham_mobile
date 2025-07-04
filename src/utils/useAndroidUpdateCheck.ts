import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

export function useAndroidUpdateCheck() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion();
        const currentVersion = VersionCheck.getCurrentVersion();
        if (VersionCheck.needUpdate({ currentVersion, latestVersion }).isNeeded) {
          const storeUrl = await VersionCheck.getStoreUrl();
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Please update to get the latest features and fixes.',
            [
              {
                text: 'Update Now',
                onPress: () => {
                  Linking.openURL(storeUrl);
                },
              },
              { text: 'Later', style: 'cancel' },
            ],
            { cancelable: true }
          );
        }
      } catch (e) {
        // Optionally handle error
      }
    })();
  }, []);
}
