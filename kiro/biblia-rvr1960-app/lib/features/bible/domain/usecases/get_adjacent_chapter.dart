import '../../../../core/constants/bible_constants.dart';
import '../../../../core/error/app_error.dart';
import '../entities/chapter.dart';
import '../repositories/bible_repository.dart';

/// Result of adjacent chapter resolution, indicating the previous
/// and next chapters relative to the current reading position.
///
/// Either value may be `null` when at Bible boundaries:
/// - Genesis 1 has no previous chapter.
/// - Revelation 22 has no next chapter.
class AdjacentChapters {
  final Chapter? previous;
  final Chapter? next;

  /// Whether the current position is at the very beginning of the Bible.
  bool get isAtStart => previous == null;

  /// Whether the current position is at the very end of the Bible.
  bool get isAtEnd => next == null;

  const AdjacentChapters({
    required this.previous,
    required this.next,
  });
}

/// Use case that resolves the adjacent (previous and next) chapters
/// for a given reading position, including cross-book transitions
/// and boundary detection.
///
/// Used for:
/// - Pre-fetching adjacent chapters for smooth swipe navigation.
/// - Determining if boundary indicators should be shown.
///
/// Validates: Requirements 2.5, 2.6, 2.7
class GetAdjacentChapterUseCase {
  final BibleRepository _repository;

  const GetAdjacentChapterUseCase(this._repository);

  /// Resolves adjacent chapters for the position [bookId]:[chapterNum].
  ///
  /// Navigation rules:
  /// - Previous: chapterNum - 1 in same book, or last chapter of previous book.
  /// - Next: chapterNum + 1 in same book, or chapter 1 of next book.
  /// - Genesis 1 → previous is null (start boundary).
  /// - Revelation 22 → next is null (end boundary).
  ///
  /// Returns [Result.failure] with a [ValidationError] if the position
  /// is invalid, or [StorageError] if an unexpected exception occurs.
  Future<Result<AdjacentChapters>> call(int bookId, int chapterNum) async {
    // Validate book ID range (1-66).
    if (!BibleConstants.isValidBookId(bookId)) {
      return Result.failure(
        AppError.validation(
          'Invalid book ID: $bookId. Must be between 1 and 66.',
        ),
      );
    }

    // Validate chapter number for the given book.
    if (!BibleConstants.isValidChapter(bookId, chapterNum)) {
      final maxChapters = BibleConstants.getChapterCount(bookId) ?? 0;
      return Result.failure(
        AppError.validation(
          'Invalid chapter $chapterNum for book $bookId. '
          'Must be between 1 and $maxChapters.',
        ),
      );
    }

    try {
      final result = await _repository.getAdjacentChapters(bookId, chapterNum);

      return switch (result) {
        Success(:final data) => Result.success(
            AdjacentChapters(
              previous: data.$1,
              next: data.$2,
            ),
          ),
        Failure(:final error) => Result.failure(error),
      };
    } catch (e) {
      return Result.failure(
        AppError.storage(
          'Failed to resolve adjacent chapters for book $bookId, '
          'chapter $chapterNum: ${e.toString()}',
        ),
      );
    }
  }
}
