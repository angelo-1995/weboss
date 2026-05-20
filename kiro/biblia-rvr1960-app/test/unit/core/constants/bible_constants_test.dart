import 'package:biblia_rvr1960/core/constants/bible_constants.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('BibleConstants', () {
    test('has exactly 66 book names', () {
      expect(BibleConstants.bookNames.length, equals(66));
    });

    test('has exactly 66 chapter counts', () {
      expect(BibleConstants.chapterCounts.length, equals(66));
    });

    test('has exactly 66 abbreviations', () {
      expect(BibleConstants.bookAbbreviations.length, equals(66));
    });

    test('chapter counts sum to 1189', () {
      final total = BibleConstants.chapterCounts.values.reduce((a, b) => a + b);
      expect(total, equals(1189));
    });

    test('canonical order has 66 entries', () {
      expect(BibleConstants.canonicalOrder.length, equals(66));
    });

    test('OT has 39 books and NT has 27 books', () {
      expect(BibleConstants.oldTestamentBookIds.length, equals(39));
      expect(BibleConstants.newTestamentBookIds.length, equals(27));
    });

    test('book IDs are sequential 1-66', () {
      for (int i = 1; i <= 66; i++) {
        expect(BibleConstants.bookNames.containsKey(i), isTrue,
            reason: 'Missing book name for ID $i');
        expect(BibleConstants.chapterCounts.containsKey(i), isTrue,
            reason: 'Missing chapter count for ID $i');
        expect(BibleConstants.bookAbbreviations.containsKey(i), isTrue,
            reason: 'Missing abbreviation for ID $i');
      }
    });

    test('first book is Génesis with 50 chapters', () {
      expect(BibleConstants.bookNames[1], equals('Génesis'));
      expect(BibleConstants.chapterCounts[1], equals(50));
    });

    test('last book is Apocalipsis with 22 chapters', () {
      expect(BibleConstants.bookNames[66], equals('Apocalipsis'));
      expect(BibleConstants.chapterCounts[66], equals(22));
    });

    test('Salmos has 150 chapters', () {
      expect(BibleConstants.chapterCounts[19], equals(150));
    });

    group('helper methods', () {
      test('getBookName returns correct name', () {
        expect(BibleConstants.getBookName(1), equals('Génesis'));
        expect(BibleConstants.getBookName(66), equals('Apocalipsis'));
        expect(BibleConstants.getBookName(0), isNull);
        expect(BibleConstants.getBookName(67), isNull);
      });

      test('getChapterCount returns correct count', () {
        expect(BibleConstants.getChapterCount(1), equals(50));
        expect(BibleConstants.getChapterCount(19), equals(150));
        expect(BibleConstants.getChapterCount(0), isNull);
      });

      test('isOldTestament correctly identifies OT books', () {
        expect(BibleConstants.isOldTestament(1), isTrue);
        expect(BibleConstants.isOldTestament(39), isTrue);
        expect(BibleConstants.isOldTestament(40), isFalse);
      });

      test('isNewTestament correctly identifies NT books', () {
        expect(BibleConstants.isNewTestament(40), isTrue);
        expect(BibleConstants.isNewTestament(66), isTrue);
        expect(BibleConstants.isNewTestament(39), isFalse);
      });

      test('isValidBookId validates correctly', () {
        expect(BibleConstants.isValidBookId(1), isTrue);
        expect(BibleConstants.isValidBookId(66), isTrue);
        expect(BibleConstants.isValidBookId(0), isFalse);
        expect(BibleConstants.isValidBookId(67), isFalse);
      });

      test('isValidChapter validates correctly', () {
        expect(BibleConstants.isValidChapter(1, 1), isTrue);
        expect(BibleConstants.isValidChapter(1, 50), isTrue);
        expect(BibleConstants.isValidChapter(1, 51), isFalse);
        expect(BibleConstants.isValidChapter(1, 0), isFalse);
        expect(BibleConstants.isValidChapter(0, 1), isFalse);
      });
    });
  });
}
