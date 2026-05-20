import 'package:biblia_rvr1960/core/utils/text_normalizer.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('TextNormalizer', () {
    group('normalize', () {
      test('converts to lowercase', () {
        expect(TextNormalizer.normalize('HELLO'), equals('hello'));
        expect(TextNormalizer.normalize('Hello World'), equals('hello world'));
      });

      test('removes Spanish accented vowels', () {
        expect(TextNormalizer.normalize('á'), equals('a'));
        expect(TextNormalizer.normalize('é'), equals('e'));
        expect(TextNormalizer.normalize('í'), equals('i'));
        expect(TextNormalizer.normalize('ó'), equals('o'));
        expect(TextNormalizer.normalize('ú'), equals('u'));
      });

      test('removes ñ and ü', () {
        expect(TextNormalizer.normalize('ñ'), equals('n'));
        expect(TextNormalizer.normalize('ü'), equals('u'));
      });

      test('handles uppercase accented characters', () {
        expect(TextNormalizer.normalize('Á'), equals('a'));
        expect(TextNormalizer.normalize('É'), equals('e'));
        expect(TextNormalizer.normalize('Í'), equals('i'));
        expect(TextNormalizer.normalize('Ó'), equals('o'));
        expect(TextNormalizer.normalize('Ú'), equals('u'));
        expect(TextNormalizer.normalize('Ñ'), equals('n'));
        expect(TextNormalizer.normalize('Ü'), equals('u'));
      });

      test('normalizes Spanish Bible book names', () {
        expect(TextNormalizer.normalize('Génesis'), equals('genesis'));
        expect(TextNormalizer.normalize('Éxodo'), equals('exodo'));
        expect(TextNormalizer.normalize('Levítico'), equals('levitico'));
        expect(TextNormalizer.normalize('Números'), equals('numeros'));
        expect(TextNormalizer.normalize('Deuteronomio'), equals('deuteronomio'));
      });

      test('normalizes common Spanish Bible words', () {
        expect(TextNormalizer.normalize('Jesús'), equals('jesus'));
        expect(TextNormalizer.normalize('señor'), equals('senor'));
        expect(TextNormalizer.normalize('bilingüe'), equals('bilingue'));
        expect(TextNormalizer.normalize('salvación'), equals('salvacion'));
      });

      test('is idempotent - normalizing already-normalized text returns same result', () {
        const normalized = 'genesis';
        expect(TextNormalizer.normalize(normalized), equals(normalized));

        const alreadyNormalized = 'jesus es el senor';
        expect(
          TextNormalizer.normalize(alreadyNormalized),
          equals(alreadyNormalized),
        );
      });

      test('handles empty string', () {
        expect(TextNormalizer.normalize(''), equals(''));
      });

      test('preserves non-accented characters', () {
        expect(TextNormalizer.normalize('hello world 123!'), equals('hello world 123!'));
      });
    });

    group('removeAccents', () {
      test('removes accents but preserves case', () {
        expect(TextNormalizer.removeAccents('Génesis'), equals('Genesis'));
        expect(TextNormalizer.removeAccents('JESÚS'), equals('JESUS'));
      });

      test('handles empty string', () {
        expect(TextNormalizer.removeAccents(''), equals(''));
      });
    });
  });
}
