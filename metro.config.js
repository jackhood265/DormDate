// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");
const defaultResolve = require("metro-resolver").resolve;

const config = getDefaultConfig(__dirname);

// Log both successful resolves (selected) and *failing* resolves
function verboseResolveRequest(context, moduleName, platform) {
  const from = context.originModulePath || "<root>";

  // You can keep this filter, but for now we'll log a bit more
  const shouldLogSuccess =
    from.endsWith("/index.js") ||
    moduleName === "./App" ||
    moduleName.endsWith("index.js") ||
    moduleName.includes("sentinel.entry");

  try {
    const res = defaultResolve(context, moduleName, platform);
    if (shouldLogSuccess) {
      console.log(
        `[METRO-RESOLVE][OK] platform=${platform} from=${from} -> ${moduleName} => ${res.filePath || res.type}`
      );
    }
    return res;
  } catch (e) {
    // THIS is what we need: the exact failing edge
    console.log(
      `[METRO-RESOLVE][FAIL] platform=${platform} from=${from} -> ${moduleName}\n` +
      `  ${e && e.message ? e.message : e}`
    );
    throw e;
  }
}

config.resolver = config.resolver || {};
config.resolver.resolveRequest = verboseResolveRequest;

// (Optional) Be explicit about extensions, just in case
config.resolver.sourceExts = Array.from(
  new Set([
    ...(config.resolver.sourceExts || []),
    "ts","tsx","js","jsx","mjs","cjs","json"
  ])
);

module.exports = config;
