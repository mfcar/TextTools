import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';

const lightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: '#cf222e' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#6e7781', fontStyle: 'italic' },
  { tag: [t.string, t.special(t.string), t.regexp], color: '#0a3069' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#0550ae' },
  { tag: [t.propertyName, t.attributeName], color: '#0550ae' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#8250df' },
  { tag: [t.typeName, t.className, t.namespace], color: '#953800' },
  { tag: [t.variableName], color: '#24292f' },
  { tag: [t.operator, t.punctuation], color: '#24292f' },
  { tag: [t.tagName], color: '#116329' },
  { tag: [t.heading], color: '#0550ae', fontWeight: 'bold' },
  { tag: [t.link, t.url], color: '#0a3069', textDecoration: 'underline' },
  { tag: [t.meta], color: '#6e7781' },
  { tag: [t.invalid], color: '#cf222e' },
]);

const darkStyle = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: '#c678dd' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#7d8799', fontStyle: 'italic' },
  { tag: [t.string, t.special(t.string), t.regexp], color: '#98c379' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#d19a66' },
  { tag: [t.propertyName, t.attributeName], color: '#61afef' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#61afef' },
  { tag: [t.typeName, t.className, t.namespace], color: '#e5c07b' },
  { tag: [t.variableName], color: '#e06c75' },
  { tag: [t.operator, t.punctuation], color: '#abb2bf' },
  { tag: [t.tagName], color: '#e06c75' },
  { tag: [t.heading], color: '#61afef', fontWeight: 'bold' },
  { tag: [t.link, t.url], color: '#98c379', textDecoration: 'underline' },
  { tag: [t.meta], color: '#7d8799' },
  { tag: [t.invalid], color: '#e06c75' },
]);

export const lightHighlight: Extension = syntaxHighlighting(lightStyle);
export const darkHighlight: Extension = syntaxHighlighting(darkStyle);
