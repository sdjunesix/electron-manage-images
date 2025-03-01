import { useState, useCallback, SetStateAction, Dispatch } from 'react';

import { debounce } from 'lodash';

export const useDebounce = (fnToDebounce: Dispatch<SetStateAction<string | null>>, durationInMs = 1000) => {
  if (isNaN(durationInMs)) throw new TypeError('Time for debounce should be a number.');
  if (fnToDebounce == null) throw new TypeError('fnToDebounce cannot be null.');
  if (typeof fnToDebounce !== 'function') throw new TypeError('fnToDebounce should be a function.');

  return useCallback(debounce(fnToDebounce, durationInMs), [fnToDebounce, durationInMs]);
};

export const useDebouncedState = (initialState: string, durationInMs = 1000) => {
  const [internalState, setInternalState] = useState(initialState);
  const debouncedFunction = useDebounce(setInternalState, durationInMs);
  return [internalState, debouncedFunction];
};
