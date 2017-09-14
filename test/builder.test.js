const oc = require('../');

test('host, username and password can be set via constructor', () => {
  const server = oc('http://localhost/oc', 'user', 'password');
  expect(server.username(), 'user');
  expect(server.password(), 'password');
  expect(server.host(), 'http://localhost/oc');
});

test('username and password can be set via builder chain', () => {
  const server = oc('http://localhost/oc')
    .username('user')
    .password('password');

  expect(server.username(), 'user');
  expect(server.password(), 'password');
  expect(server.host(), 'http://localhost/oc');
});

test('debug logging off', () => {
  const server = oc('http://localhost/oc', 'user', 'password');
  expect(server.verbose(), false);
});

test('debug logging on', () => {
  const server = oc('http://localhost/oc', 'user', 'password', true);
  expect(server.verbose(), true);
});