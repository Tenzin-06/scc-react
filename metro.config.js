const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const rootModules = {
  'react-native-safe-area-context': path.resolve(
    __dirname,
    'node_modules/react-native-safe-area-context',
  ),
  'react-native-screens': path.resolve(__dirname, 'node_modules/react-native-screens'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const rootModulePath = rootModules[moduleName];

  if (rootModulePath) {
    return context.resolveRequest(context, rootModulePath, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
