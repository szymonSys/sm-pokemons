/** @type {import('react-native-worklets/plugin').PluginOptions} */
const workletsPluginOptions = {};

module.exports = {
  plugins: [
    ["react-native-worklets/plugin", workletsPluginOptions],
    ["react-native-worklets-core/plugin"],
  ],
};
