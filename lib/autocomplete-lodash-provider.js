'use babel';

import fs from 'fs';
import path from 'path';

/**
 * Pattern defining a Lodash method call.
 * @type {RegExp}
 */
const lodashPrefixPattern = /_\.(\w*)$/;

/**
 * The Autocomplete provider.
 */
export default class AutocompleteLodashProvider {

  /**
   * Selectors where the package is enabled.
   * @type {string}
   */
  static selector = '.source.js, .source.jsx, .source.js.jsx, source.js.embedded.html, source.ts, source.tsx';

  /**
   * Selectors where the package is disabled.
   * @type {string}
   */
  static disableForSelector = '.source.js .comment, .source.jsx .comment, .source.js.jsx .comment, source.js.embedded.html .comment, , source.ts .comment, source.tsx .comment';

  /**
   * Defines if Autocomplete should automatically filter suggestions.
   * @type {Boolean}
   */
  static filterSuggestions = true;

  /**
   * Loads Lodash methods from a JSON representation saved in a `lodash.json` file.
   *
   * Note: The `lodash.json` file is included in the package instead of generating it on the fly so all the content of
   *   the package is static.
   * @return {AutocompleteLodashProvider} The package Autocomplete provider.
   */
  static loadMethods() {
    return fs.readFile(path.resolve(__dirname, '..', 'lodash.json'), (self => {
      return (error, content) => {
        if (error === null) {
          const json = JSON.parse(content);

          self.methods = [];

          for (const method of json) {
            self.methods.push(this.buildMethodCompletion(method));
          }
        }
      }
    })(this));
  }

  /**
   * Parses a Lodash method from the JSON representation and returns a suggestion directly usable by the Provider API.
   * @see https://github.com/atom/autocomplete-plus/wiki/Provider-API#suggestions
   * @param  {Object} method  The method to parse.
   * @return {Object}         A suggestion ready to dispatch to the Provider API.
   */
  static buildMethodCompletion(method) {
    const { name, description, url, returns, args } = method;

    return {
      name,
      snippet: `_.${name}(${args.map((arg, i) => `\$\{${i+1}:${arg}\}`).join(', ')})`,
      type: 'function',
      description,
      descriptionMoreURL: url,
      leftLabel: returns,
    };
  }

  /**
   * Triggered automatically when the provider is being destroyed.
   * @return {AutocompleteLodashProvider} The package Autocomplete provider.
   */
  static dispose() {
    return this.methods = null;
  }

  /**
   * Returns the Lodash methods matching the current request.
   * @see https://github.com/atom/autocomplete-plus/wiki/Provider-API#the-suggestion-requests-options-object
   * @param  {Object} request The suggestion requests options.
   * @return {Promise}        A promise resolved when the suggestions for the current request are found.
   */
  static getSuggestions(request) {
    let completions = null;

    return new Promise(resolve => {
      const lodashPrefix = this.getLodashMethod(request);

      if (lodashPrefix !== null) {
        completions = this.getLodashMethodsCompletions(lodashPrefix);
      }

      resolve(completions);
    });
  }

  /**
   * Returns the Lodash method already typed if available.
   * @see https://github.com/atom/autocomplete-plus/wiki/Provider-API#the-suggestion-requests-options-object
   * @param  {Object}       request The suggestion requests options.
   * @return {string|null}          The Lodash method already typed or null if none detected.
   */
  static getLodashMethod(request) {
    const { editor, bufferPosition } = request;

    const line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

    const matches = lodashPrefixPattern.exec(line);

    if (matches === null) {
      return null;
    }

    return matches[1];
  }

  /**
   * Returns the Lodash methods matching the current request.
   * @param  {string} prefix  The Lodash method already typed.
   * @return {Array}          Lodash methods matching the current request.
   */
  static getLodashMethodsCompletions(prefix) {
    let completions;

    if (prefix.length === 0) {
      completions = this.methods;
    } else {
      completions = this.methods.filter(method => method.name.toLowerCase().startsWith(prefix.toLowerCase()));
    }

    return completions.map(method => {
      method.replacementPrefix = `_.${prefix}`;

      return method;
    });
  }

}
