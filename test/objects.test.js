const oc = require('../');

test('upload should fail if we do not have required fields', () => {

  const server = oc('http://sample-host', 'user', 'password');
  
  // no uuid
  expect(() => server.upload()).toThrowError('No uuid given.');

  // uuid but no file
  expect(() => server.upload('some-uuid')).toThrowError('No filename given.'); 
});