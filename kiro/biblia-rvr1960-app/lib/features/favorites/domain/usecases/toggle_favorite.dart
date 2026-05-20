import '../../../../core/error/app_error.dart';
import '../repositories/favorites_repository.dart';

/// Use case for toggling the favorite status of a verse.
///
/// Encapsulates the business logic of marking/unmarking a verse as favorite.
/// Returns `true` if the verse was added to favorites, `false` if removed.
class ToggleFavorite {
  final FavoritesRepository _repository;

  ToggleFavorite(this._repository);

  /// Executes the toggle operation for the given verse.
  ///
  /// [bookId] — the book ID (1-66)
  /// [chapter] — the chapter number
  /// [verse] — the verse number
  /// [verseText] — the verse text content (for potential future use)
  ///
  /// Returns [Result<bool>] where `true` means added, `false` means removed.
  Future<Result<bool>> call(
    int bookId,
    int chapter,
    int verse,
    String verseText,
  ) {
    return _repository.toggleFavorite(bookId, chapter, verse, verseText);
  }
}
