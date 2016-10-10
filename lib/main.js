'use babel';

import AutocompleteLodashProvider from './autocomplete-lodash-provider';

/**
 * Activates the package.
 * @return {AutocompleteLodashProvider} The package Autocomplete provider.
 */
export function activate() {
  return AutocompleteLodashProvider.loadMethods();
}

/**
 * Returns the package Autocomplete provider.
 * @return {AutocompleteLodashProvider} The package Autocomplete provider.
 */
export function getProvider() {
  return AutocompleteLodashProvider;
}
