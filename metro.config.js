// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

// Use Metro's built-in resolver for the actual work
const defaultResolve = require("metro-resolver").resolve;

// A tiny wrapper that logs interesting resolutions.
function verboseResolveRequest(context, moduleName, platform) {
  const from = context.originModulePath || "<root>";

  // Log only the most relevant traffic so logs stay readable
  const shouldLog =
    from.endsWith("/index.js") ||
    moduleName === "./App" ||
    moduleName.endsWith("index.js") ||
    moduleName.includes("sentinel.entry");

  if (shouldLog) {
    console.log(
      `[METRO-RESOLVE] platform=${platform} from=${from} -> ${moduleName}`
    );
  }

  // Defer to the default resolver
  return defaultResolve(context, moduleName, platform);
}

module.exports = (projectRoot) => {
  const config = getDefaultConfig(projectRoot);
  // Attach our wrapper
  config.resolver = config.resolver || {};
  config.resolver.resolveRequest = verboseResolveRequest;
  return config;
};
