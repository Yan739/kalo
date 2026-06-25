const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web relies on the wa-sqlite WASM module. Metro must treat
// .wasm as an asset, and the dev server must send cross-origin isolation
// headers so the SharedArrayBuffer-backed worker can run.
config.resolver.assetExts.push('wasm');

config.server = config.server ?? {};
const previousEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  const wrapped = (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    middleware(req, res, next);
  };
  return previousEnhanceMiddleware
    ? previousEnhanceMiddleware(wrapped, server)
    : wrapped;
};

module.exports = config;
