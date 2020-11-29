import {CamelCaseService} from './scripts/camel-case.service';
import {DeburrService} from './scripts/deburr.service';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';
import {UrlDecodeService} from './scripts/url-decode.service';
import {UrlEncodeService} from './scripts/url-encode.service';

export class ScriptList {
  static scripts =
    [
      {
        name: 'CamelCase',
        icon: 'title',
        description: 'Convert all text to CamelCase',
        class: CamelCaseService
      },
      {
        name: 'Deburr',
        icon: 'title',
        description: 'Remove special characters',
        class: DeburrService
      },
      {
        name: 'Lowercase',
        icon: 'title',
        description: 'Convert all text to Lowercase',
        class: LowercaseService
      },
      {
        name: 'Uppercase',
        icon: 'title',
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
      }
    ];
}
