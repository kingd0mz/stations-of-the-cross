const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const privateDirectory = path.join(__dirname, 'private-booklet');

// Authorized text lives in src/content. Keep source scans and private editorial
// working files out of release bundles; never substitute an ignored local copy.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const result = context.resolveRequest(context, moduleName, platform);
  const files = result.type === 'sourceFile' ? [result.filePath]
    : result.type === 'assetFiles' ? result.filePaths : [];
  if (files.some(file => /(?:stations-of-the-cross|bagong-daan-ng-krus)\.pdf$/i.test(file))) {
    throw new Error('Source booklet scans must not be bundled.');
  }
  if (context.dev !== true && result.type === 'sourceFile') {
    const relative = path.relative(privateDirectory, result.filePath);
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
      throw new Error('Local booklet drafts cannot be included in release bundles.');
    }
  }
  return result;
};

module.exports = config;
