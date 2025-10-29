// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");
const defaultResolve = require("metro-resolver").resolve;

// Build the config eagerly (no exported function)
const config = getDefaultConfig(__dirname);

// Verbose resolver (safe to keep while debugging)
function verboseResolveRequest(context, moduleName, platform) {
  const from = context.originModulePath || "<root>";
  const shouldLog =
    (from && from.endsWith("/index.js")) ||
    moduleName === "./App" ||
    moduleName.endsWith("index.js") ||
    moduleName.includes("sentinel.entry");

  if (shouldLog) {
    console.log(
      `[METRO-RESOLVE] platform=${platform} from=${from} -> ${moduleName}`
    );
  }
  return defaultResolve(context, moduleName, platform);
}

config.resolver = config.resolver || {};
config.resolver.resolveRequest = verboseResolveRequest;

module.exports = config;
