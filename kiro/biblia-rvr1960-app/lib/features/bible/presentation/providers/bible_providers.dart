import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_error.dart';
import '../../domain/entities/chapter.dart';
import '../../domain/repositories/bible_repository.dart';
import '../../domain/usecases/get_adjacent_chapter.dart';
import '../../domain/usecases/get_books.dart';
import '../../domain/usecases/get_chapter.dart';

// -----------------------------------------------------------------------------
// Repository Provider
// -----------------------------------------------------------------------------

/// Provider for the [BibleRepository] instance.
///
/// Must be overridden at the ProviderScope level with a concrete
/// [BibleRepositoryImpl] once the database is initialized.
///
/// Example:
/// ```dart
/// ProviderScope(
///   overrides: [
///     bibleRepositoryProvider.overrideWithValue(BibleRepositoryImpl(dataSource)),
///   ],
///   child: MyApp(),
/// )
/// ```
final bibleRepositoryProvider = Provider<BibleRepository>((ref) {
  throw UnimplementedError(
    'bibleRepositoryProvider must be overridden with a concrete '
    'BibleRepositoryImpl instance.',
  );
});

// -----------------------------------------------------------------------------
// Use Case Providers
// -----------------------------------------------------------------------------

/// Provider for [GetBooksUseCase].
///
/// Retrieves all 66 books organized by Old/New Testament.
final getBooksUseCaseProvider = Provider<GetBooksUseCase>((ref) {
  final repository = ref.watch(bibleRepositoryProvider);
  return GetBooksUseCase(repository);
});

/// Provider for [GetChapterUseCase].
///
/// Loads a specific chapter by book ID and chapter number with validation.
final getChapterUseCaseProvider = Provider<GetChapterUseCase>((ref) {
  final repository = ref.watch(bibleRepositoryProvider);
  return GetChapterUseCase(repository);
});

/// Provider for [GetAdjacentChapterUseCase].
///
/// Resolves previous/next chapters for navigation including cross-book
/// transitions and boundary detection.
final getAdjacentChapterUseCaseProvider =
    Provider<GetAdjacentChapterUseCase>((ref) {
  final repository = ref.watch(bibleRepositoryProvider);
  return GetAdjacentChapterUseCase(repository);
});

// -----------------------------------------------------------------------------
// Data Providers
// -----------------------------------------------------------------------------

/// Loads all 66 books of the RVR1960 Bible grouped by testament.
///
/// Returns a [BooksGroupedByTestament] with oldTestament (39) and
/// newTestament (27) lists.
///
/// Usage:
/// ```dart
/// final booksAsync = ref.watch(bibleProvider);
/// booksAsync.when(
///   data: (books) => ...,
///   loading: () => ...,
///   error: (e, st) => ...,
/// );
/// ```
///
/// Validates: Requirements 12.2
final bibleProvider = FutureProvider<BooksGroupedByTestament>((ref) async {
  final useCase = ref.watch(getBooksUseCaseProvider);
  final result = await useCase();

  return switch (result) {
    Success(:final data) => data,
    Failure(:final error) => throw Exception(error.toString()),
  };
});

/// Parameter class for chapter-based provider families.
///
/// Uses value equality so that Riverpod can correctly cache and deduplicate
/// provider instances for the same (bookId, chapterNum) combination.
class ChapterParams {
  final int bookId;
  final int chapterNum;

  const ChapterParams({required this.bookId, required this.chapterNum});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChapterParams &&
          other.bookId == bookId &&
          other.chapterNum == chapterNum;

  @override
  int get hashCode => Object.hash(bookId, chapterNum);

  @override
  String toString() => 'ChapterParams(bookId: $bookId, chapterNum: $chapterNum)';
}

/// Loads a specific chapter by book ID and chapter number.
///
/// Also triggers pre-fetching of adjacent chapters (N-1 and N+1) for
/// smooth swipe navigation, satisfying the performance requirement
/// that only the active chapter and immediately adjacent chapters are loaded.
///
/// Usage:
/// ```dart
/// final chapterAsync = ref.watch(
///   chapterProvider(ChapterParams(bookId: 1, chapterNum: 1)),
/// );
/// ```
///
/// Validates: Requirements 12.2, 10.4
final chapterProvider =
    FutureProvider.family<Chapter, ChapterParams>((ref, params) async {
  final useCase = ref.watch(getChapterUseCaseProvider);
  final result = await useCase(params.bookId, params.chapterNum);

  // Trigger pre-fetch of adjacent chapters (fire and forget).
  // This warms the Riverpod cache so swipe navigation is instant.
  ref.read(adjacentChaptersProvider(params).future).ignore();

  return switch (result) {
    Success(:final data) => data,
    Failure(:final error) => throw Exception(error.toString()),
  };
});

/// Pre-fetches adjacent chapters (previous and next) for the given position.
///
/// Returns [AdjacentChapters] with nullable previous/next fields:
/// - Genesis 1 → previous is null (start boundary)
/// - Revelation 22 → next is null (end boundary)
///
/// Used by [chapterProvider] to ensure smooth swipe navigation.
/// When the user views chapter N, chapters N-1 and N+1 are loaded
/// into memory so transitions are instant.
///
/// Validates: Requirements 10.4
final adjacentChaptersProvider =
    FutureProvider.family<AdjacentChapters, ChapterParams>((ref, params) async {
  final useCase = ref.watch(getAdjacentChapterUseCaseProvider);
  final result = await useCase(params.bookId, params.chapterNum);

  return switch (result) {
    Success(:final data) => data,
    Failure(:final error) => throw Exception(error.toString()),
  };
});
