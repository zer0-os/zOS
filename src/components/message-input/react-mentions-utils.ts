/* tslint:disable */
import invariant from 'invariant';

// The following is lifted from react-mentions utils functions because they're not public.
// Follow: https://github.com/signavio/react-mentions/issues/193
// Once we can programatically insert mentions, none of this should be needed

export const mapPlainTextIndex = (value, config, indexInPlainText, inMarkupCorrection = 'START') => {
  if (typeof indexInPlainText !== 'number') {
    return indexInPlainText;
  }

  let result;
  let textIteratee = (substr, index, substrPlainTextIndex) => {
    if (result !== undefined) return;

    if (substrPlainTextIndex + substr.length >= indexInPlainText) {
      // found the corresponding position in the current plain text range
      result = index + indexInPlainText - substrPlainTextIndex;
    }
  };
  let markupIteratee = (
    markup,
    index,
    mentionPlainTextIndex,
    id,
    display
    // childIndex,
    // lastMentionEndIndex
  ) => {
    if (result !== undefined) return;

    if (mentionPlainTextIndex + display.length > indexInPlainText) {
      // found the corresponding position inside current match,
      // return the index of the first or after the last char of the matching markup
      // depending on whether the `inMarkupCorrection`
      if (inMarkupCorrection === 'NULL') {
        result = null;
      } else {
        result = index + (inMarkupCorrection === 'END' ? markup.length : 0);
      }
    }
  };

  iterateMentionsMarkup(value, config, markupIteratee, textIteratee);

  // when a mention is at the end of the value and we want to get the caret position
  // at the end of the string, result is undefined
  return result === undefined ? value.length : result;
};

const emptyFn: any = () => {};

const countPlaceholders = (markup) => {
  let count = 0;
  if (markup.indexOf('__id__') >= 0) count++;
  if (markup.indexOf('__display__') >= 0) count++;
  return count;
};

// Finds all occurrences of the markup in the value and calls the `markupIteratee` callback for each of them.
// The optional `textIteratee` callback is called for each plain text ranges in between these markup occurrences.
const iterateMentionsMarkup = (value, config, markupIteratee, textIteratee = emptyFn) => {
  const regex = combineRegExps(config.map((c) => c.regex));

  let accOffset = 2; // first is whole match, second is the for the capturing group of first regexp component
  const captureGroupOffsets = config.map(({ markup }) => {
    const result = accOffset;
    // + 1 is for the capturing group we add around each regexp component in combineRegExps
    accOffset += countPlaceholders(markup) + 1;
    return result;
  });

  let match;
  let start = 0;
  let currentPlainTextIndex = 0;

  // detect all mention markup occurrences in the value and iterate the matches
  while ((match = regex.exec(value)) !== null) {
    const offset = captureGroupOffsets.find((o) => !!match[o]); // eslint-disable-line no-loop-func
    const mentionChildIndex = captureGroupOffsets.indexOf(offset);
    const { markup, displayTransform } = config[mentionChildIndex];
    const idPos = offset + findPositionOfCapturingGroup(markup, 'id');
    const displayPos = offset + findPositionOfCapturingGroup(markup, 'display');

    const id = match[idPos];
    const display = displayTransform(id, match[displayPos]);

    let substr = value.substring(start, match.index);
    textIteratee(substr, start, currentPlainTextIndex);
    currentPlainTextIndex += substr.length;

    markupIteratee(match[0], match.index, currentPlainTextIndex, id, display, mentionChildIndex, start);
    currentPlainTextIndex += display.length;
    start = regex.lastIndex;
  }

  if (start < value.length) {
    textIteratee(value.substring(start), start, currentPlainTextIndex);
  }
};

const combineRegExps = (regExps) => {
  const serializedRegexParser = /^\/(.+)\/(\w+)?$/;
  return new RegExp(
    regExps
      .map((regex) => {
        const [
          ,
          regexString,
          regexFlags,
        ] = serializedRegexParser.exec(regex.toString());

        invariant(
          !regexFlags,
          `RegExp flags are not supported. Change /${regexString}/${regexFlags} into /${regexString}/`
        );

        return `(${regexString})`;
      })
      .join('|'),
    'g'
  );
};

const PLACEHOLDERS = {
  id: '__id__',
  display: '__display__',
};

const findPositionOfCapturingGroup = (markup, parameterName) => {
  invariant(
    parameterName === 'id' || parameterName === 'display',
    `Second arg must be either "id" or "display", got: "${parameterName}"`
  );

  // find positions of placeholders in the markup
  let indexDisplay = markup.indexOf(PLACEHOLDERS.display);
  let indexId = markup.indexOf(PLACEHOLDERS.id);

  // set indices to null if not found
  if (indexDisplay < 0) indexDisplay = null;
  if (indexId < 0) indexId = null;

  // markup must contain one of the mandatory placeholders
  invariant(
    indexDisplay !== null || indexId !== null,
    `The markup '${markup}' does not contain either of the placeholders '__id__' or '__display__'`
  );

  if (indexDisplay !== null && indexId !== null) {
    // both placeholders are used, return 0 or 1 depending on the position of the requested parameter
    return (parameterName === 'id' && indexId <= indexDisplay) ||
      (parameterName === 'display' && indexDisplay <= indexId)
      ? 0
      : 1;
  }

  // just one placeholder is being used, we'll use the captured string for both parameters
  return 0;
};
