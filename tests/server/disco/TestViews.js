/* eslint-disable no-loop-func */

import request from 'supertest-as-promised';
import { assert } from 'chai';

import { runServer } from 'core/server/base';
import Policy from 'csp-parse';

import { checkSRI } from '../helpers';

const defaultURL = '/en-US/firefox/discovery/pane/48.0/Darwin/normal';

describe('Discovery Pane GET requests', () => {
  let app;

  before(() => runServer({ listen: false, app: 'disco' })
    .then((server) => {
      app = server;
    }));

  after(() => {
    webpackIsomorphicTools.undo();
  });

  it('should have a CSP policy for / on the disco app', () => request(app)
    .get(defaultURL)
    .expect(200)
    .then((res) => {
      const policy = new Policy(res.header['content-security-policy']);
      assert.notInclude(policy.get('script-src'), "'self'");
      assert.include(policy.get('script-src'), 'https://addons-discovery.cdn.mozilla.net');
      assert.notInclude(policy.get('connect-src'), "'self'");
      assert.include(policy.get('connect-src'), 'https://addons.mozilla.org');
    }));

  it('should be using SRI for script and style in /', () => request(app)
    .get(defaultURL)
    .expect(200)
    .then((res) => checkSRI(res)));

  it('should be a 404 for requests to /', () => request(app)
    .get('/')
    .expect(404));

  it('should be a 404 for requests to /en-US/', () => request(app)
    .get('/en-US/')
    .expect(404));

  it('should redirect an invalid locale', () => request(app)
    .get('/whatevs/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/en-US/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should redirect an invalid locale which will be encoded', () => request(app)
    .get('/<script>/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/en-US/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should redirect an invalid locale which will be encoded', () => request(app)
    .get('/AC%2fDC/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/en-US/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should redirect an aliased lang', () => request(app)
    .get('/pt/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/pt-PT/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should redirect a missing lang to default', () => request(app)
    .get('/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/en-US/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should correct incorrect case', () => request(app)
    .get('/pt-br/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/pt-BR/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should not replace more than it should', () => request(app)
    .get('/48.0/firefox/discovery/pane/48.0/Darwin/normal')
    .expect(302)
    .then((res) => {
      assert.equal(res.header.location,
        '/en-US/firefox/discovery/pane/48.0/Darwin/normal');
    }));

  it('should set an HSTS header', () => request(app)
    .get('/en-US/firefox/discovery/pane/48.0/Darwin/normal')
    .then((res) => {
      assert.equal(res.header['strict-transport-security'], 'max-age=31536000');
    }));
});
