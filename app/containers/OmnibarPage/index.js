/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import Omnibar from '../../components/Omnibar';

import '../../styles/client.scss';

export default function OmnibarPage() {
  return (
    <div id="container">
      <h1>Omnibar Test</h1>
      <Omnibar />
    </div>
  );
}
