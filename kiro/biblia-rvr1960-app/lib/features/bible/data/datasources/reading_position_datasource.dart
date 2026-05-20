import 'package:hive/hive.dart';

import '../../domain/entities/reading_position.dart';

/// Data source for persisting and retrieving the user's reading position.
///
/// Uses the `preferences_box` Hive box to store reading position as
/// individual key-value pairs:
/// - `last_book_id` (int): The book ID (1-66)
/// - `last_chapter` (int): The chapter number
/// - `last_scroll_offset` (double): The vertical scroll offset
abstract class ReadingPositionDataSource {
  /// Saves the current reading position to local storage.
  Future<void> savePosition(ReadingPosition position);

  /// Loads the last saved reading position.
  ///
  /// Returns `null` if no position has been saved yet.
  Future<ReadingPosition?> loadPosition();

  /// Clears the saved reading position.
  Future<void> clearPosition();
}

/// Concrete implementation of [ReadingPositionDataSource] using Hive.
///
/// Stores reading position in the `preferences_box` as individual keys
/// for efficient partial reads and writes.
class ReadingPositionDataSourceImpl implements ReadingPositionDataSource {
  static const String preferencesBoxName = 'preferences_box';

  // Storage keys
  static const String _keyBookId = 'last_book_id';
  static const String _keyChapter = 'last_chapter';
  static const String _keyScrollOffset = 'last_scroll_offset';

  final Box<dynamic> _preferencesBox;

  ReadingPositionDataSourceImpl({
    required Box<dynamic> preferencesBox,
  }) : _preferencesBox = preferencesBox;

  @override
  Future<void> savePosition(ReadingPosition position) async {
    await _preferencesBox.put(_keyBookId, position.bookId);
    await _preferencesBox.put(_keyChapter, position.chapter);
    await _preferencesBox.put(_keyScrollOffset, position.scrollOffset);
  }

  @override
  Future<ReadingPosition?> loadPosition() async {
    final bookId = _preferencesBox.get(_keyBookId) as int?;
    final chapter = _preferencesBox.get(_keyChapter) as int?;
    final scrollOffset = _preferencesBox.get(_keyScrollOffset) as double?;

    // If any required field is missing, no valid position exists.
    if (bookId == null || chapter == null) {
      return null;
    }

    return ReadingPosition(
      bookId: bookId,
      chapter: chapter,
      scrollOffset: scrollOffset ?? 0.0,
    );
  }

  @override
  Future<void> clearPosition() async {
    await _preferencesBox.delete(_keyBookId);
    await _preferencesBox.delete(_keyChapter);
    await _preferencesBox.delete(_keyScrollOffset);
  }
}
