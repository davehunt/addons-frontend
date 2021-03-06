// Config specific to local development

const webpackServerHost = '127.0.0.1';
const webpackServerPort = 3001;
const webpackHost = `${webpackServerHost}:${webpackServerPort}`;
const apiHost = 'https://addons-dev.allizom.org';
const amoCDN = 'https://addons-dev-cdn.allizom.org';


module.exports = {
  apiHost,
  amoCDN,

  // Statics will be served by node.
  staticHost: undefined,

  isDeployed: false,
  isDevelopment: true,

  cookieSecure: false,

  enableClientConsole: true,

  serverPort: 3000,
  webpackServerHost,
  webpackServerPort,
  webpackHost,

  CSP: {
    directives: {
      connectSrc: [
        "'self'",
        amoCDN,
        webpackHost,
      ],
      imgSrc: [
        "'self'",
        webpackHost,
      ],
      scriptSrc: [
        "'self'",
        amoCDN,
        webpackHost,
      ],
      styleSrc: [
        "'self'",
        'blob:',
      ],
    },
    reportOnly: true,
  },
};
