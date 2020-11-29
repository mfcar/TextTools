import {CamelCaseService} from './scripts/camel-case.service';
import {DeburrService} from './scripts/deburr.service';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';
import {UrlDecodeService} from './scripts/url-decode.service';
import {UrlEncodeService} from './scripts/url-encode.service';
import {TrimService} from './scripts/trim.service';
import {Base64EncodeService} from './scripts/base64-encode.service';
import {Base64DecodeService} from './scripts/base64-decode.service';

export class ScriptList {
  static scripts =
    [
      {
        name: 'Base64 Encode',
        icon: 'security',
        description: 'Creates a base-64 encoded from string',
        class: Base64EncodeService
      },
      {
        name: 'Base64 Decode',
        icon: 'security',
        description: 'Decodes a base64 encoded string',
        class: Base64DecodeService
      },
      {
        name: 'CamelCase',
        icon: 'text_format',
        description: 'Convert all text to CamelCase',
        class: CamelCaseService
      },
      {
        name: 'Deburr',
        icon: 'text_format',
        description: 'Remove special characters',
        class: DeburrService
      },
      {
        name: 'Lowercase',
        icon: 'text_format',
        description: 'Convert all text to Lowercase',
        class: LowercaseService
      },
      {
        name: 'Uppercase',
        icon: 'text_format',
        description: 'Convert all text to Uppercase',
        class: UppercaseService
      },
      {
        name: 'URLDecode',
        icon: 'insert_link',
        description: 'Encode special characters',
        class: UrlDecodeService
      },
      {
        name: 'URLEncode',
        icon: 'insert_link',
        description: 'Decode special characters',
        class: UrlEncodeService
      },
      {
        name: 'Trim',
        icon: 'content_cut',
        description: 'Remove whitespace from both sides',
        class: TrimService
      }
    ];
}
