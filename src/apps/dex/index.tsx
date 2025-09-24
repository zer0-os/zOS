import { Component } from 'react';
import { ExternalApp } from '../external-app';
import { DexManifest } from './manifest';

export class DexApp extends Component {
  render() {
    return <ExternalApp manifest={DexManifest} />;
  }
}
