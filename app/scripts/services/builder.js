'use strict';

PhonicsApp.service('Builder', ['Resolver', 'Validator', Builder]);

function Builder(Resolver, Validator) {
  var load = _.memoize(jsyaml.load);

  function buildDocs(stringValue) {

    var json;

    if (!stringValue) {
      return;
    }

    try {
      json = load(stringValue);
    } catch (e) {
      return {
        error: { yamlError: e },
        specs: null
      };
    }
    return buildDocsWithObject(json);
  }

  function buildDocsWithObject(json) {
    json = Resolver.resolve(json);
    var result = { specs: json };
    var error = Validator.validateSwagger(json);

    if (error && error.swaggerError) {
      result.error = error;
    }

    return result;
  }

  /*
   * Gets a path JSON object and Specs, finds the path in the
   * specs JSON and updates it
  */
  function updatePath(path, pathName, specs) {
    var json;
    var error = null;

    try {
      json = load(path);
    } catch (e) {
      error = { yamlError: e };
    }

    if (!error) {
      specs.paths[pathName] = json[pathName];
    }

    return {
      specs: specs,
      error: error
    };
  }

  /*
   * Returns one path that matches pathName
   * Returns error object if there is schema incomparability issues
  */
  function getPath(specs, path) {
    return _.pick(specs.paths, path);
  }

  this.buildDocs = buildDocs;
  this.buildDocsWithObject = buildDocsWithObject;
  this.updatePath = updatePath;
  this.getPath = getPath;
}
