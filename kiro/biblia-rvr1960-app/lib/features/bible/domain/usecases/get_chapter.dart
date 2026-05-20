import '../../../../core/constants/bible_constants.dart';
import '../../../../core/error/app_error.dart';
import '../entities/chapter.dart';
import '../repositories/bible_repository.dart';

/// Use case that loads a specific chapter by book ID and chapter number.
///
/// Performs input validation before delegating to the repository.
///
/// Validates: Requirements 2.3
class GetChapterUseCase {
  final BibleRepository _repository;

  const GetChapterUseCase(this._repository);

  /// Loads the chapter identified by [bookId] and [chapterNum].
  ///
  /// Returns [Result.failure] with a [ValidationError] if the book ID
  /// or chapter number is invalid. Returns [Result.failure] with a
  /// [StorageError] if an unexpected exception occurs.
  Future<Result<Chapter>> call(int bookId, int chapterNum) async {
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
      return await _repository.getChapter(bookId, chapterNum);
    } catch (e) {
      return Result.failure(
        AppError.storage(
          'Failed to load chapter $chapterNum of book $bookId: ${e.toString()}',
        ),
      );
    }
  }
}
