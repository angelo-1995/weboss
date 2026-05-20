import 'package:biblia_rvr1960/core/utils/date_utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AppDateUtils', () {
    group('dayOfYear', () {
      test('returns 1 for January 1st', () {
        expect(AppDateUtils.dayOfYear(DateTime(2024, 1, 1)), equals(1));
      });

      test('returns 32 for February 1st', () {
        expect(AppDateUtils.dayOfYear(DateTime(2024, 2, 1)), equals(32));
      });

      test('returns 366 for December 31st in a leap year', () {
        expect(AppDateUtils.dayOfYear(DateTime(2024, 12, 31)), equals(366));
      });

      test('returns 365 for December 31st in a non-leap year', () {
        expect(AppDateUtils.dayOfYear(DateTime(2023, 12, 31)), equals(365));
      });
    });

    group('verseOfDayIndex', () {
      test('is deterministic - same date produces same index', () {
        final date = DateTime(2024, 6, 15);
        final index1 = AppDateUtils.verseOfDayIndex(date, poolSize: 365);
        final index2 = AppDateUtils.verseOfDayIndex(date, poolSize: 365);
        expect(index1, equals(index2));
      });

      test('produces different indices for different dates', () {
        final date1 = DateTime(2024, 6, 15);
        final date2 = DateTime(2024, 6, 16);
        final index1 = AppDateUtils.verseOfDayIndex(date1, poolSize: 365);
        final index2 = AppDateUtils.verseOfDayIndex(date2, poolSize: 365);
        expect(index1, isNot(equals(index2)));
      });

      test('produces indices within valid range [0, poolSize)', () {
        const poolSize = 365;
        for (int day = 1; day <= 365; day++) {
          final date = DateTime(2024, 1, 1).add(Duration(days: day - 1));
          final index = AppDateUtils.verseOfDayIndex(date, poolSize: poolSize);
          expect(index, greaterThanOrEqualTo(0));
          expect(index, lessThan(poolSize));
        }
      });

      test('produces unique indices for all days in a year with poolSize >= 365', () {
        const poolSize = 400;
        final indices = <int>{};
        for (int day = 0; day < 365; day++) {
          final date = DateTime(2024, 1, 1).add(Duration(days: day));
          final index = AppDateUtils.verseOfDayIndex(date, poolSize: poolSize);
          indices.add(index);
        }
        // All 365 days should produce unique indices
        expect(indices.length, equals(365));
      });
    });

    group('dateOnly', () {
      test('strips time component', () {
        final dateTime = DateTime(2024, 6, 15, 14, 30, 45);
        final result = AppDateUtils.dateOnly(dateTime);
        expect(result, equals(DateTime(2024, 6, 15)));
        expect(result.hour, equals(0));
        expect(result.minute, equals(0));
        expect(result.second, equals(0));
      });
    });

    group('isSameDay', () {
      test('returns true for same day different times', () {
        final a = DateTime(2024, 6, 15, 10, 30);
        final b = DateTime(2024, 6, 15, 22, 45);
        expect(AppDateUtils.isSameDay(a, b), isTrue);
      });

      test('returns false for different days', () {
        final a = DateTime(2024, 6, 15);
        final b = DateTime(2024, 6, 16);
        expect(AppDateUtils.isSameDay(a, b), isFalse);
      });
    });
  });
}
