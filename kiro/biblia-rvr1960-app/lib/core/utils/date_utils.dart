/// Utility class for date-based calculations.
///
/// Provides a deterministic verse-of-the-day seed algorithm
/// that produces the same result for the same date and different
/// results for different dates within a 365-day cycle.
class AppDateUtils {
  AppDateUtils._();

  /// Calculates the day of the year (1-366) for a given [date].
  static int dayOfYear(DateTime date) {
    final startOfYear = DateTime(date.year, 1, 1);
    return date.difference(startOfYear).inDays + 1;
  }

  /// Returns a deterministic index for the verse of the day based on [date].
  ///
  /// The algorithm uses `(year * 366 + dayOfYear) % poolSize` to ensure:
  /// - Same date always produces the same index (deterministic)
  /// - Different dates within a 365-day cycle produce different indices
  /// - The cycle repeats after [poolSize] days
  ///
  /// [poolSize] must be >= 365 to guarantee no repeats within a year.
  static int verseOfDayIndex(DateTime date, {required int poolSize}) {
    assert(poolSize >= 365, 'Pool size must be at least 365');
    final day = dayOfYear(date);
    return (date.year * 366 + day) % poolSize;
  }

  /// Returns the date portion only (year, month, day) with time set to midnight.
  static DateTime dateOnly(DateTime dateTime) {
    return DateTime(dateTime.year, dateTime.month, dateTime.day);
  }

  /// Checks if two dates represent the same calendar day.
  static bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
