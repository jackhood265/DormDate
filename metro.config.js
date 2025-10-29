// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Make 100% sure Metro never crawls your build/tools scripts
  config.resolver.blockList = exclusionList([
    /.*\/scripts\/.*/,         // block scripts folder
    /.*\/build\/.*/,           // block build artifacts
  ]);

  // Log every resolve; flag anything suspicious
  const prev = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (!moduleName || typeof moduleName !== 'string') {
      console.warn('⚠️ resolveRequest got bad moduleName:', moduleName, 'from', context.originModulePath);
    } else if (/^\.{0,2}\/?$/.test(moduleName)) {
      console.warn('⚠️ resolveRequest got empty-ish path:', JSON.stringify(moduleName), 'from', context.originModulePath);
    } else if (/\/$/.test(moduleName)) {
      console.warn('⚠️ Trailing slash import:', JSON.stringify(moduleName), 'from', context.originModulePath);
    }
    try {
      return (prev ?? context.resolveRequest)(context, moduleName, platform);
    } catch (e) {
      console.warn('❌ Failed to resolve', JSON.stringify(moduleName), 'from', context.originModulePath);
      throw e;
    }
  };

  return config;
})();
