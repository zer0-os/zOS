module.exports = function () {
  const appId = environmentalize('Fact0ry.Zer0', '.');
  const productName = environmentalize('Zer0', '-');

  return {
    appId,
    productName,
    copyright: 'Copyright © Fact0ry',
    directories: {
      output: 'public',
    },
    publish: {
      provider: 'github',
      releaseType: 'release',
    },
    mac: {
      icon: 'electron/assets/images/zero-white-icon.icns',
      target: ['dmg', 'zip'],
    },
    win: {
      icon: 'electron/assets/images/zero-white-icon.ico',
    },
  };
};

function environmentalize(prefix, separator) {
  const nodeEnv = import.meta.env.NODE_ENV;
  return `${prefix}${separator}${nodeEnv}`;
}
