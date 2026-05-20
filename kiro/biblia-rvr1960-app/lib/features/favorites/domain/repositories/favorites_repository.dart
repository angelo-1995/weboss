import '../../../../core/error/app_error.dart';
import '../entities/favorite.dart';

/// Abstract repository interface for favorites management.
///
/// Defined in the domain layer — implementations live in the data layer.
/// Supports toggle behavior, reactive streams, and sorted retrieval.
abstract class FavoritesRepository {
  /// Toggles the favorite status of a verse.
  ///
  /// If the verse is not currently a favorite, it is added and returns `true`.
  /// If the verse is already a favorite, it is removed and returns `false`.
  Future<Result<bool>> toggleFavorite(
    int bookId,
    int chapter,
    int verse,
    String verseText,
  );

  /// Checks whether a specific verse is currently marked as a favorite.
  Future<bool> isFavorite(int bookId, int chapter, int verse);

  /// Returns all favorites sorted by [addedAt] descending (most recent first).
  ///
  /// Limited to a maximum of 1,000 entries as per [AppConstants.maxFavorites].
  Future<Result<List<Favorite>>> getAllFavorites();

  /// Removes a favorite by its composite key ID ("{bookId}_{chapter}_{verse}").
  Future<Result<void>> removeFavorite(String id);

  /// Returns a reactive stream of all favorites, emitting a new list
  /// whenever the underlying data changes.
  Stream<List<Favorite>> watchFavorites();
}
