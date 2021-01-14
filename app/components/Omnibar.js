import React, { useState } from 'react';
import '../styles/omnibar.scss';

export default function Omnibar() {
  const [suggestion] = useState(undefined);

  // getSuggestion = text => {

  // }

  return (
    <div className="omnibar-container">
      <input
        className="omnibar"
        placeholder="What's happening?"
        // onChange={event => {}}
      />
      {suggestion && <div className="omnibar-suggest" />}
    </div>
  );
}
