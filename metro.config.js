const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.includes('TopicSubscriptionModule') ||
    moduleName.endsWith('./TopicSubscriptionModule')
  ) {
    if (
      context.originModulePath &&
      context.originModulePath.includes('expo-notifications')
    ) {
      const shimPath =
        platform === 'android'
          ? path.resolve(__dirname, 'src/shims/TopicSubscriptionModule.android.js')
          : path.resolve(__dirname, 'src/shims/TopicSubscriptionModule.js');
      return {
        filePath: shimPath,
        type: 'sourceFile',
      };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
