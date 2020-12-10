import {Command, CommandParameter, ParameterType} from './models';
import {Base64EncodeService} from '../scripts/base64-encode.service';
import {UrlEncodeService} from '../scripts/url-encode.service';
import {Base64DecodeService} from '../scripts/base64-decode.service';
import {LowercaseService} from '../scripts/lowercase.service';
import {UrlDecodeService} from '../scripts/url-decode.service';
import {UppercaseService} from '../scripts/uppercase.service';
import {CamelCaseService} from '../scripts/camel-case.service';
import {DeburrService} from '../scripts/deburr.service';
import {TrimService} from '../scripts/trim.service';
import {SplitService} from '../scripts/split.service';
import {MinifyJSONService} from '../scripts/minify-json.service';
import {EscapeService} from '../scripts/escape.service';
import {KebabCaseService} from '../scripts/kebab-case.service';
import {SnakeCaseService} from '../scripts/snake-case.service';
import {RepeatService} from '../scripts/repeat.service';
import {UTF8DecodeService} from '../scripts/utf8-decode.service';
import {UTF8EncodeService} from '../scripts/utf8-encode.service';
import {SortLinesAscService} from '../scripts/sort-lines-asc.service';
import {SortLinesDescService} from '../scripts/sort-lines-desc.service';
import {TextReverseService} from '../scripts/text-reverse.service';
import {HexadecimalEncodeService} from '../scripts/hexadecimal-encode.service';
import {HexadecimalDecodeService} from '../scripts/hexadecimal-decode.service';
import {BinaryEncodeService} from '../scripts/binary-encode.service';
import {BinaryDecodeService} from '../scripts/binary-decode.service';

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
        name: 'Binary Encode',
        icon: 'security',
        description: 'Creates a binary encoded from string',
        class: BinaryEncodeService
      },
      {
        name: 'Binary Decode',
        icon: 'security',
        description: 'Decodes a binary encoded string',
        class: BinaryDecodeService
      },
      {
        name: 'Camel Case',
        icon: 'text_format',
        description: 'Convert all text to Camel Case',
        class: CamelCaseService
      },
      {
        name: 'Deburr',
        icon: 'text_format',
        description: 'Remove special characters',
        class: DeburrService
      },
      {
        name: 'Escape',
        icon: 'text_format',
        description: 'Converts characters in string to their corresponding HTML entities.',
        class: EscapeService
      },
      {
        name: 'Hexadecimal Encode',
        icon: 'security',
        description: 'Creates a hexadecimal encoded from string.',
        class: HexadecimalEncodeService
      },
      {
        name: 'Hexadecimal Decode',
        icon: 'security',
        description: 'Decodes a hexadecimal encoded string.',
        class: HexadecimalDecodeService
      },
      {
        name: 'Lowercase',
        icon: 'text_format',
        description: 'Convert all text to Lowercase',
        class: LowercaseService
      },
      {
        name: 'Kebab Case',
        icon: 'text_format',
        description: 'Convert all text to Kebab Case',
        class: KebabCaseService
      },
      {
        name: 'Minify JSON',
        icon: 'cleaning_services',
        description: 'Minify JSON document',
        class: MinifyJSONService
      },
      {
        name: 'Repeat',
        icon: 'repeat',
        description: 'Repeat the string n times',
        class: RepeatService,
        parameters: [
          {index: 1, name: 'n', type: ParameterType.number, defaultValue: '3'},
        ] as CommandParameter[]
      },
      {
        name: 'Split',
        icon: 'call_split',
        description: 'Divide a string',
        class: SplitService,
        parameters: [
          {index: 1, name: 'separator', type: ParameterType.text, defaultValue: '-'},
          {index: 2, name: 'limit', type: ParameterType.number, defaultValue: 2}
        ] as CommandParameter[]
      },
      {
        name: 'Snake Case',
        icon: 'text_format',
        description: 'Convert all text to Snake Case',
        class: SnakeCaseService
      },
      {
        name: 'Sort Lines Asc',
        icon: 'sort_by_alpha',
        description: 'Sort Lines Asc',
        class: SortLinesAscService
      },
      {
        name: 'Sort Lines Desc',
        icon: 'sort_by_alpha',
        description: 'Sort Lines Desc',
        class: SortLinesDescService
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
        name: 'Text Reverser',
        icon: 'reorder',
        description: 'Reverse a text',
        class: TextReverseService
      },
      {
        name: 'Trim',
        icon: 'content_cut',
        description: 'Remove whitespace from both sides',
        class: TrimService
      },
      {
        name: 'UTF8 Encode',
        icon: 'sync_alt',
        description: 'Encode to UTF-8',
        class: UTF8EncodeService
      },
      {
        name: 'UTF8 Decode',
        icon: 'sync_alt',
        description: 'Decode UTF-8',
        class: UTF8DecodeService
      }
    ] as Command[];
}
