module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '6.0.4',
      checkMD5: false,
    },
    autoStart: false,
    instance: {
      dbName: 'jest',
    },
  },
};
