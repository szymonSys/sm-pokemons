/** @type {import('react-native-worklets/plugin').PluginOptions} */
const workletsPluginOptions = {};

module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    ["react-native-worklets/plugin", workletsPluginOptions],
    ["react-native-worklets-core/plugin"],
  ],
};
