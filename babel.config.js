module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // 👇 must always be the LAST plugin
      "react-native-reanimated/plugin",
    ],
  };
};
