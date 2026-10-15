const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/TopicSubscriptionModule.android.js',
);

const patchContent = `import { requireOptionalNativeModule } from 'expo-modules-core';

const fallbackModule = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

const nativeModule =
  typeof requireOptionalNativeModule === 'function'
    ? requireOptionalNativeModule('ExpoTopicSubscriptionModule')
    : null;

export default nativeModule || fallbackModule;
`;

if (fs.existsSync(targetFile)) {
  fs.writeFileSync(targetFile, patchContent, 'utf8');
  console.log('Successfully patched TopicSubscriptionModule.android.js for Expo Go compatibility.');
}
