import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/favorite.dart';
import '../../domain/repositories/favorites_repository.dart';
import '../../domain/usecases/toggle_favorite.dart';

// -----------------------------------------------------------------------------
// Repository Provider
// -----------------------------------------------------------------------------

/// Provider for the [FavoritesRepository] instance.
///
/// Must be overridden at the ProviderScope level with a concrete
/// [FavoritesRepositoryImpl] once the database is initialized.
///
/// Example:
/// ```dart
/// ProviderScope(
///   overrides: [
///     favoritesRepositoryProvider.overrideWithValue(FavoritesRepositoryImpl(dataSource)),
///   ],
///   child: MyApp(),
/// )
/// ```
final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  throw UnimplementedError(
    'favoritesRepositoryProvider must be overridden with a concrete '
    'FavoritesRepositoryImpl instance.',
  );
});

// -----------------------------------------------------------------------------
// Use Case Providers
// -----------------------------------------------------------------------------

/// Provider for [ToggleFavorite] use case.
///
/// Toggles the favorite status of a verse — adds if not present, removes if present.
final toggleFavoriteUseCaseProvider = Provider<ToggleFavorite>((ref) {
  final repository = ref.watch(favoritesRepositoryProvider);
  return ToggleFavorite(repository);
});

// -----------------------------------------------------------------------------
// Data Providers
// -----------------------------------------------------------------------------

/// StreamProvider that reactively watches all favorites from the repository.
///
/// Emits a new sorted list (most recent first) whenever the underlying
/// data changes. Used by the favorites screen to display a live list.
///
/// Validates: Requirements 4.4
final favoritesStreamProvider = StreamProvider<List<Favorite>>((ref) {
  final repository = ref.watch(favoritesRepositoryProvider);
  return repository.watchFavorites();
});

/// Parameter class for the [isFavoriteProvider] family.
///
/// Identifies a specific verse by its book, chapter, and verse number.
class FavoriteParams {
  final int bookId;
  final int chapter;
  final int verse;

  const FavoriteParams({
    required this.bookId,
    required this.chapter,
    required this.verse,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FavoriteParams &&
          other.bookId == bookId &&
          other.chapter == chapter &&
          other.verse == verse;

  @override
  int get hashCode => Object.hash(bookId, chapter, verse);

  @override
  String toString() =>
      'FavoriteParams(bookId: $bookId, chapter: $chapter, verse: $verse)';
}

/// FutureProvider.family that checks whether a specific verse is favorited.
///
/// Used by the Reader to display a filled/unfilled heart icon on each verse.
///
/// Validates: Requirements 4.5
final isFavoriteProvider =
    FutureProvider.family<bool, FavoriteParams>((ref, params) async {
  final repository = ref.watch(favoritesRepositoryProvider);
  return repository.isFavorite(params.bookId, params.chapter, params.verse);
});
