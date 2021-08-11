import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import spacetime from 'spacetime';
import * as chrono from 'chrono-node';
import {
  applyAllPatterns,
  COMMIT,
  PROMISE,
  today,
  TEMP_LABELS,
  findLabels,
} from '../data/patterns';
import '../styles/omnibar.scss';
import Emoji from './Emoji';

export default function Omnibar() {
  const [suggestions, setSuggestion] = useState([]);
  const [value, setValue] = useState('');

  // getSuggestion = text => {

  // }

  const renderSuggestion = (suggestion, { isHighlighted }) => (
    <div className={`suggestion ${isHighlighted ? 'highlighted' : ''}`}>
      {suggestion.type === COMMIT && (
        <div className="tag tag-commit">
          <Emoji symbol="✅" />
          Done!
        </div>
      )}
      {suggestion.type === PROMISE && (
        <div className="tag tag-promise">
          <Emoji symbol="🔮" />
          Todo
        </div>
      )}
      {suggestion.start && (
        <div className="tag tag-time">
          <Emoji symbol="⌚" />
          {formatDate(suggestion)}
        </div>
      )}
      {formatLabels(suggestion)}
      {/* {suggestion.start && } */}
      <p className="description">{suggestion.description}</p>
    </div>
  );

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  const onSuggestionsFetchRequested = data => {
    setSuggestion(applyAllPatterns(data.value));
    // console.log(suggestions);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestion([]);
  };

  const onSuggestionSelected = () => {
    setValue('');
  };

  const formatDate = data => {
    const start = spacetime(data.start);
    const end = spacetime(data.end);
    if (data.start) {
      const timestamp = spacetime(data.timestamp);
      const isSameTime =
        timestamp.second() === start.second() &&
        timestamp.minute() === start.minute() &&
        timestamp.hour() === start.hour();
      let startFormat = start.isBetween(
        spacetime(chrono.parseDate('last week')),
        spacetime(chrono.parseDate('next week')),
      )
        ? `{day} the {date-ordinal} ${isSameTime ? '' : `{time}`}`
        : `{day-short}. {month} {date} ${isSameTime ? '' : `{time}`}`;

      if (start.diff(spacetime(today()), 'year'))
        startFormat = `{numeric-us} ${isSameTime ? '' : `{time}`}`;

      const endFormat = `{time}`;
      return `${start.format(startFormat)}${
        data.end !== undefined ? ` to ${end.format(endFormat)}` : ''
      }`;
    }
    throw new Error('Start date undefined!');
  };

  const formatLabels = () => {
    const result = [];

    findLabels(value).forEach(label => {
      result.push(
        <div
          className="tag"
          style={{ backgroundColor: TEMP_LABELS[label].color }}
          key={label}
        >
          {TEMP_LABELS[label].emoji && (
            <Emoji symbol={TEMP_LABELS[label].emoji} />
          )}
          {label}
        </div>,
      );
    });

    return result;
  };

  return (
    <div className="omnibar-container">
      {/* <input
        className="omnibar"
        placeholder="What's happening?"
        onChange={event => {
          setSuggestion(applyAllPatterns(event.target.value));
        }}
      /> */}
      <Autosuggest
        suggestions={suggestions}
        getSuggestionValue={suggestion => suggestion.description}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        highlightFirstSuggestion
        inputProps={{
          placeholder: "What's happening?",
          value,
          onChange: (event, { newValue }) => setValue(newValue),
        }}
      />
    </div>
  );
}
