import 'package:biblia_rvr1960/shared/extensions/string_extensions.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('StringExtensions', () {
    group('capitalize', () {
      test('capitalizes first letter', () {
        expect('hello'.capitalize, equals('Hello'));
      });

      test('handles empty string', () {
        expect(''.capitalize, equals(''));
      });

      test('handles single character', () {
        expect('a'.capitalize, equals('A'));
      });

      test('preserves rest of string', () {
        expect('hELLO'.capitalize, equals('HELLO'));
      });
    });

    group('capitalizeWords', () {
      test('capitalizes each word', () {
        expect('hello world'.capitalizeWords, equals('Hello World'));
      });

      test('handles single word', () {
        expect('hello'.capitalizeWords, equals('Hello'));
      });

      test('handles empty string', () {
        expect(''.capitalizeWords, equals(''));
      });
    });

    group('truncateWithEllipsis', () {
      test('truncates long strings', () {
        expect('Hello World'.truncateWithEllipsis(5), equals('Hello...'));
      });

      test('does not truncate short strings', () {
        expect('Hi'.truncateWithEllipsis(5), equals('Hi'));
      });

      test('does not truncate exact length strings', () {
        expect('Hello'.truncateWithEllipsis(5), equals('Hello'));
      });
    });

    group('collapseWhitespace', () {
      test('collapses multiple spaces', () {
        expect('hello   world'.collapseWhitespace, equals('hello world'));
      });

      test('trims leading and trailing whitespace', () {
        expect('  hello  '.collapseWhitespace, equals('hello'));
      });

      test('handles tabs and newlines', () {
        expect('hello\t\nworld'.collapseWhitespace, equals('hello world'));
      });
    });

    group('normalized', () {
      test('normalizes Spanish text', () {
        expect('Génesis'.normalized, equals('genesis'));
      });
    });

    group('withoutAccents', () {
      test('removes accents preserving case', () {
        expect('Génesis'.withoutAccents, equals('Genesis'));
      });
    });

    group('isBlank / isNotBlank', () {
      test('empty string is blank', () {
        expect(''.isBlank, isTrue);
        expect(''.isNotBlank, isFalse);
      });

      test('whitespace-only string is blank', () {
        expect('   '.isBlank, isTrue);
        expect('   '.isNotBlank, isFalse);
      });

      test('non-empty string is not blank', () {
        expect('hello'.isBlank, isFalse);
        expect('hello'.isNotBlank, isTrue);
      });
    });

    group('nullIfBlank', () {
      test('returns null for blank strings', () {
        expect(''.nullIfBlank, isNull);
        expect('   '.nullIfBlank, isNull);
      });

      test('returns string for non-blank strings', () {
        expect('hello'.nullIfBlank, equals('hello'));
      });
    });

    group('toHiveKey', () {
      test('converts to lowercase and replaces special chars', () {
        expect('Génesis 1:1'.toHiveKey, equals('genesis_1_1'));
      });

      test('collapses multiple underscores', () {
        expect('hello---world'.toHiveKey, equals('hello_world'));
      });
    });
  });
}
