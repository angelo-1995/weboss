// Register hook: when Node requires a .ts file, load .js from same path instead
const Module = require('module');
const path = require('path');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  // If requiring a .ts file, try .js first
  if (request.endsWith('.ts')) {
    const jsPath = request.replace(/\.ts$/, '.js');
    try {
      return originalResolve.call(this, jsPath, parent, isMain, options);
    } catch (e) {
      // .js doesn't exist, try without extension
      const noExt = request.replace(/\.ts$/, '');
      try {
        return originalResolve.call(this, noExt, parent, isMain, options);
      } catch (e2) {
        // Fall through to original
      }
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
