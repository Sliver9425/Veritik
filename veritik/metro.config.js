// Metro (el empaquetador de Expo) no debe vigilar la carpeta backend/ (Python, venv, etc.).
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const backendDir = escapeRegExp(path.resolve(__dirname, 'backend'));
const ignoreBackend = new RegExp(`^${backendDir}[\\\\/].*`);

// blockList puede ser una sola expresión o una LISTA de expresiones. Expo exige una lista PLANA,
// por eso se usa concat (que aplana la lista existente) en lugar de anidarla.
config.resolver.blockList = [].concat(config.resolver.blockList ?? [], ignoreBackend);

module.exports = config;