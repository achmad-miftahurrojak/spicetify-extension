
declare const Spicetify: any;

import type * as ReactTypes from "react";
import type * as ReactDOMTypes from "react-dom";

export const React = new Proxy({}, {
  get(_, prop) {
    return (Spicetify as any).React[prop];
  }
}) as typeof ReactTypes;

export const ReactDOM = new Proxy({}, {
  get(_, prop) {
    return (Spicetify as any).ReactDOM[prop];
  }
}) as typeof ReactDOMTypes;
