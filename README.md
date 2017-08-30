oc-client-js
============

Installation
----------------------

oc-client-js supports Node.js v6.11.2 and later. Most operations will return a promise.

Install it into your project:

    npm install oc-client-js

Examples
--------

### Fetch an object

    const oc = require('oc-client-js');

    const server = oc('http://examplehost', 'example-user', 'example-password');

    server.objects('dasaaa3-f1db-58dc-a928-50ea104e5c45'); // handle returned promise


### Upload an object with thumbnail

    const oc = require('oc-client-js');

    const server = oc('http://examplehost', 'example-user', 'example-password');

    server.upload('example-generated-uuid', {
        filename: 'sample.xml',
        thumb: 'sample.jpg',
        'sample.xml': fs.createReadStream('./test/resources/sample.xml'),
        'sample.jpg': fs.createReadStream('./test/resources/sample.jpg')
    }); // handle returned promise

### Remove an object

    const oc = require('oc-client-js');

    const server = oc('http://examplehost', 'example-user', 'example-password');

    server.remove('example-uuid'); // handle returned promise

### Search

    const oc = require('oc-client-js');

    const server = oc('http://examplehost', 'example-user', 'example-password');

    server.search('field:"my query"');

### Search with additional options

    const oc = require('oc-client-js');

    const server = oc('http://examplehost', 'example-user', 'example-password');

    server.search('field:"my query"', { limit: 5 }); // limit our pagination to only 5 hits per page