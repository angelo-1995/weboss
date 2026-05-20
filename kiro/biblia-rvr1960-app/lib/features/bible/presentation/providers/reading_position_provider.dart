import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/reading_position_datasource.dart';
import '../../domain/entities/reading_position.dart';

/// Default reading position: Genesis chapter 1, scroll offset 0.
const _defaultPosition = ReadingPosition(
  bookId: 1,
  chapter: 1,
  scrollOffset: 0.0,
);

/// Provider for the [ReadingPositionDataSource] instance.
///
/// Must be overridden at the ProviderScope level with a concrete
/// [ReadingPositionDataSourceImpl] once the preferences_box is opened.
final readingPositionDataSourceProvider =
    Provider<ReadingPositionDataSource>((ref) {
  throw UnimplementedError(
    'readingPositionDataSourceProvider must be overridden with a concrete '
    'ReadingPositionDataSourceImpl instance.',
  );
});

/// StateNotifier that manages the current reading position.
///
/// Responsibilities:
/// - Loads saved position on initialization (defaults to Genesis 1 if none).
/// - Exposes [updatePosition] to change the current position.
/// - Auto-saves to local storage whenever the position changes.
class ReadingPositionNotifier extends StateNotifier<ReadingPosition> {
  final ReadingPositionDataSource _dataSource;

  ReadingPositionNotifier(this._dataSource) : super(_defaultPosition) {
    _loadSavedPosition();
  }

  /// Loads the previously saved reading position from local storage.
  ///
  /// If no position exists, keeps the default (Genesis 1, chapter 1, offset 0).
  Future<void> _loadSavedPosition() async {
    final saved = await _dataSource.loadPosition();
    if (saved != null) {
      state = saved;
    }
  }

  /// Updates the reading position and persists it to local storage.
  ///
  /// Call this when the user navigates to a different chapter or when
  /// the scroll offset changes significantly.
  Future<void> updatePosition({
    required int bookId,
    required int chapter,
    double scrollOffset = 0.0,
  }) async {
    final newPosition = ReadingPosition(
      bookId: bookId,
      chapter: chapter,
      scrollOffset: scrollOffset,
    );

    // Only save if the position actually changed.
    if (state != newPosition) {
      state = newPosition;
      await _dataSource.savePosition(newPosition);
    }
  }

  /// Persists the current position to local storage.
  ///
  /// Useful for saving on app background events where the position
  /// may have been updated via scroll but not yet persisted.
  Future<void> savePosition() async {
    await _dataSource.savePosition(state);
  }

  /// Updates only the scroll offset for the current book/chapter.
  ///
  /// This avoids unnecessary writes when only the scroll position changes.
  Future<void> updateScrollOffset(double scrollOffset) async {
    final newPosition = ReadingPosition(
      bookId: state.bookId,
      chapter: state.chapter,
      scrollOffset: scrollOffset,
    );

    if (state != newPosition) {
      state = newPosition;
      await _dataSource.savePosition(newPosition);
    }
  }
}

/// Riverpod StateNotifierProvider for the reading position.
///
/// Provides the current [ReadingPosition] and exposes methods to update it.
/// The position is auto-saved to local storage on every change.
///
/// Usage:
/// ```dart
/// // Read current position
/// final position = ref.watch(readingPositionProvider);
///
/// // Update position (e.g., on chapter change)
/// ref.read(readingPositionProvider.notifier).updatePosition(
///   bookId: 1,
///   chapter: 5,
///   scrollOffset: 120.0,
/// );
///
/// // Save on app background
/// ref.read(readingPositionProvider.notifier).savePosition();
/// ```
final readingPositionProvider =
    StateNotifierProvider<ReadingPositionNotifier, ReadingPosition>((ref) {
  final dataSource = ref.watch(readingPositionDataSourceProvider);
  return ReadingPositionNotifier(dataSource);
});
