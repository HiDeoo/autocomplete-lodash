'use babel';

import AutocompleteLodashProvider from '../lib/autocomplete-lodash-provider';
import lodash from '../lodash.json';

describe('Lodash autocompletions', () => {
  let editor, provider;

  const expectedNameLength = 2;
  const expectedDescriptionLength = 15;
  const expectedReturnsLength = 3;
  const expectedUrlPattern = /https:\/\/lodash\.com\/docs\/[0-9]+\.[0-9]+\.[0-9]+#\w+/

  const expectedForM = [
    'map',
    'mapKeys',
    'mapValues',
    'matches',
    'matchesProperty',
    'max',
    'maxBy',
    'mean',
    'meanBy',
    'memoize',
    'merge',
    'mergeWith',
    'method',
    'methodOf',
    'min',
    'minBy',
    'mixin',
    'multiply',
  ];

  getCompletions = () => {
    const cursor = editor.getLastCursor();

    const start = cursor.getBeginningOfCurrentWordBufferPosition();
    const end = cursor.getBufferPosition();

    const prefix = editor.getTextInRange([start, end]);

    const request = {
      editor,
      bufferPosition: end,
      scopeDescriptor: cursor.getScopeDescriptor(),
      prefix
    };

    return provider.getSuggestions(request);
  };

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage('autocomplete-lodash');
    });

    runs(() => {
      provider = atom.packages.getActivePackage('autocomplete-lodash').mainModule.getProvider();
    });

    waitsFor(() => {
      return 'methods' in provider && provider.methods.length > 0;
    });

    waitsForPromise(() => {
      return atom.workspace.open('test.js');
    });

    runs(() => {
      editor = atom.workspace.getActiveTextEditor();
    });
  });

  it('returns no completion when not using a prefix', () => {
    let suggestions;

    runs(() => {
      editor.setText('');
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeNull();
    });
  });

  it('returns no completion when not using a Lodash prefix', () => {
    let suggestions;

    runs(() => {
      editor.setText('con');
      editor.setCursorBufferPosition([0, 3]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeNull();
    });
  });

  it('returns no completion when using an incomplete Lodash prefix', () => {
    let suggestions;

    runs(() => {
      editor.setText('_');
      editor.setCursorBufferPosition([0, 1]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeNull();
      editor.setText('_');
      editor.setCursorBufferPosition([0, 1]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeNull();
    });
  });

  it('autocompletes when using only a Lodash prefix', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeDefined();
      expect(suggestions).toHaveLength(lodash.length);

      suggestions.forEach((suggestion, index) => {
        expect(suggestion.name).toBe(lodash[index].name);
      });
    });
  });

  it('autocompletes when using a Lodash prefix', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.m');
      editor.setCursorBufferPosition([0, 3]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeDefined();
      expect(suggestions).toHaveLength(expectedForM.length);

      for (suggestion of suggestions) {
        expect(expectedForM.indexOf(suggestion.name)).toNotBe(-1);
      }
    });
  });

  it('autocompletes when using a Lodash prefix and an incorrect case', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.M');
      editor.setCursorBufferPosition([0, 3]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      expect(suggestions).toBeDefined();
      expect(suggestions).toHaveLength(expectedForM.length);

      for (suggestion of suggestions) {
        expect(expectedForM.indexOf(suggestion.name)).toBeGreaterThan(-1);
      }
    });
  });

  it('should always returns suggestions with a valid name', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      for (suggestion of suggestions) {
        expect(suggestion.name).toBeDefined();
        expect(suggestion.name.length).not.toBeLessThan(expectedNameLength);
      }
    });
  });

  it('should always returns suggestions with a valid description', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      for (suggestion of suggestions) {
        expect(suggestion.description).toBeDefined();
        expect(suggestion.description.length).not.toBeLessThan(expectedDescriptionLength);
      }
    });
  });

  it('should always returns suggestions with a valid returns value', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      for (suggestion of suggestions) {
        expect(suggestion.leftLabel).toBeDefined();
        expect(suggestion.leftLabel.length).not.toBeLessThan(expectedReturnsLength);
      }
    });
  });

  it('should always returns suggestions with a valid url', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      for (suggestion of suggestions) {
        expect(suggestion.descriptionMoreURL).toBeDefined();
        expect(expectedUrlPattern.test(suggestion.descriptionMoreURL)).toBeTruthy();
      }
    });
  });

  it('should always returns suggestions with a snippet', () => {
    let suggestions;

    runs(() => {
      editor.setText('_.');
      editor.setCursorBufferPosition([0, 2]);
    });

    waitsForPromise(() => {
      return getCompletions().then((completions) => {
        suggestions = completions;
      });
    });

    runs(() => {
      for (suggestion of suggestions) {
        expect(suggestion.snippet).toBeDefined();
      }
    });
  });
});
