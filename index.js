const fetch = require('node-fetch'),
  _ = require('lodash'),
  forge = require('node-forge'),
  querystring = require('querystring'),
  FormData = require('form-data');

function authorizationHeaders(username, password) {
  const encoded = forge.util.encode64(`${username}:${password}`);
  return {
    'Authorization': `Basic ${encoded}`
  };
}

function guessMimeType(filename) {
  const knownTypes = [
    { extension: '.xml', type: 'application/xml' },
    { extension: '.jpg', type: 'image/jpeg'},
    { extension: '.jpeg', type: 'image/jpeg'}
  ];
  return knownTypes.find(({extension}) => filename.endsWith(extension)).type;
}

module.exports = function(host, username, password, verbose) {

  let state = {
    username,
    password,
    host,
    verbose
  };

  return {
    /**
     * This method is used to set the username property.
     *
     * @param {string} username The username.
     * @returns {Object} Returns itself so one can continue build on to it.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc().username('example-user')
     */
    username: function(username) {
      state.username = username;
      return this;
    },

    /**
     * This method is used to set the password property.
     *
     * @param {string} password The password.
     * @returns {Object} Returns itself so one can continue build on to it.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc().password('example-password')
     */
    password: function(password) {
      state.password = password;
      return this;
    },

    /**
     * This method is used to set the host property.
     *
     * @param {string} host The host.
     * @returns {Object} Returns itself so one can continue build on to it.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc().host('example-host')
     */
    host: function(host) {
      state.host = host;
      return this;
    },

    /**
     * This method is used to set the verbose property.
     *
     * @param {string} verbose Should we have verbose output.
     * @returns {Object} Returns itself so one can continue build on to it.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc().verbose('example-host')
     */
    verbose: function(verbose) {
      state.verbose = verbose;
      return this;
    },

    /**
     * This method is used to fetch an object by id.
     *
     * @param {string} uuid The identifier for the object we want to fetch.
     * @returns {Promise} Returns a promise for the request.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc('example-host', 'user', 'password').objects('example-uuid');
     */
    objects: function(uuid) {
      return fetch(`${state.host}/objects/${uuid}`, {
        headers: authorizationHeaders(state.username, state.password)
      });
    },

    /**
     * This method is used to upload an object by id.
     *
     * @param {string} uuid The identifier for the object we want to upload.
     * @param {Object} fields The fields.
     * @returns {Promise} Returns a promise for the request.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc('example-host', 'user', 'password').upload('example-uuid', {
     *   filename: 'sample.xml', // need to specify a name
     *   'sample.xml': fs.createReadStream('sample.xml'), // need to pass in a link to the actual file
     * });
     */
    upload: function(uuid, fields) {

      if(!uuid) {
        throw Error('No uuid given.');
      }

      if(!fields || !fields.filename) {
        throw Error('No filename given.');
      }

      const { filename, 
        fileMimeType, 
        metadata, 
        metadataMimeType, 
        thumb,
        thumbMimeType } = fields;

      let form = new FormData();
      form.append('id', uuid);
      form.append('file', filename);
      form.append('file-mimetype', fileMimeType || guessMimeType(filename));
      form.append('metadata', metadata || filename);
      form.append('metadata-mimetype', metadataMimeType || guessMimeType(metadata || filename));

      let addedFields = ['id', 'filename', 'file-mimetype', 'metadata', 'metadata-mimetype'];

      if(thumb) {
        form.append('thumb', thumb);
        form.append('thumb-mimetype', thumbMimeType || guessMimeType(thumb));

        addedFields.push('thumb');
        addedFields.push('thumb-mimetype');
      }

      _.difference(Object.keys(fields), addedFields).forEach(field => {
        form.append(field, fields[field]);
      });

      const request = new fetch.Request(`${state.host}/objectupload`, {
        method: 'POST',
        headers: authorizationHeaders(state.username, state.password),
        body: form
      });

      return fetch(request);
    },

    /**
     * This method is used to remove an object by id.
     *
     * @param {string} uuid The identifier for the object we want to remove.
     * @returns {Promise} Returns a promise for the request.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc('example-host', 'user', 'password').remove('example-uuid');
     */
    remove: function(uuid) {
      return fetch(`${state.host}/objects/${uuid}`, {
        method: 'DELETE',
        headers: authorizationHeaders(state.username, state.password)
      });
    },

    /**
     * This method is used to search for objects
     *
     * @param {string} query The query we want to search for (Solr syntax).
     * @param {Object} options Any additional properties that gets added to the query.
     * @returns {Promise} Returns a promise for the request.
     * @example
     *
     * const oc = require('oc-client-js');
     *
     * oc('example-host', 'user', 'password').search('myproperty:Hello');
     *
     * @example
     * const oc = require('oc-client-js');
     *
     * // set the page size limit to 5 instead of the default of 15
     * oc('example-host', 'user', 'password').search('myproperty:Hello', { limit: 5 });
     */
    search: function(query, options) {
      let defaultOptions = {
        start: 0,
        limit: 15,
        deleted: false
      };

      if(query) {
        defaultOptions.q = query;
      }

      const parameters = _.merge(defaultOptions, options);

      const url = `${state.host}/search?${querystring.stringify(parameters)}`;

      if(state.verbose) {
        console.log('Current state:', state);
        console.log('Searching with url:', url);
      }

      return fetch(url, {
        headers: authorizationHeaders(state.username, state.password)
      });
    }
  };
};