import 'dart:async';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../domain/entities/favorite.dart';
import '../../domain/repositories/favorites_repository.dart';
import '../datasources/favorites_local_datasource.dart';
import '../models/favorite_model.dart';

/// Concrete implementation of [FavoritesRepository].
///
/// Delegates storage operations to [FavoritesLocalDatasource] and wraps
/// results in [Result] types for uniform error handling.
/// Handles HiveError gracefully, preserving previous state on failure.
class FavoritesRepositoryImpl implements FavoritesRepository {
  final FavoritesLocalDatasource _datasource;

  FavoritesRepositoryImpl(this._datasource);

  @override
  Future<Result<bool>> toggleFavorite(
    int bookId,
    int chapter,
    int verse,
    String verseText,
  ) async {
    try {
      final key = FavoritesLocalDatasource.compositeKey(bookId, chapter, verse);

      if (_datasource.containsKey(key)) {
        // Already a favorite — remove it (toggle off)
        await _datasource.delete(key);
        return Result.success(false);
      } else {
        // Not a favorite — add it (toggle on)
        final model = FavoriteModel.create(
          bookId: bookId,
          chapter: chapter,
          verse: verse,
          addedAtMillis: DateTime.now().millisecondsSinceEpoch,
        );
        await _datasource.put(key, model);
        return Result.success(true);
      }
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to toggle favorite: $e'),
      );
    }
  }

  @override
  Future<bool> isFavorite(int bookId, int chapter, int verse) async {
    try {
      final key = FavoritesLocalDatasource.compositeKey(bookId, chapter, verse);
      return _datasource.containsKey(key);
    } catch (_) {
      // On error, assume not a favorite to avoid blocking UI
      return false;
    }
  }

  @override
  Future<Result<List<Favorite>>> getAllFavorites() async {
    try {
      final models = _datasource.getAll();

      // Sort by addedAt descending (most recent first)
      models.sort((a, b) => b.addedAtMillis.compareTo(a.addedAtMillis));

      // Limit to max favorites
      final limited = models.length > AppConstants.maxFavorites
          ? models.sublist(0, AppConstants.maxFavorites)
          : models;

      final favorites = limited.map(_modelToEntity).toList();
      return Result.success(favorites);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to load favorites: $e'),
      );
    }
  }

  @override
  Future<Result<void>> removeFavorite(String id) async {
    try {
      await _datasource.delete(id);
      return Result.success(null);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to remove favorite: $e'),
      );
    }
  }

  @override
  Stream<List<Favorite>> watchFavorites() {
    // Create a stream controller that emits the current list on each box change
    late StreamController<List<Favorite>> controller;
    StreamSubscription? subscription;

    controller = StreamController<List<Favorite>>(
      onListen: () {
        // Emit current state immediately
        controller.add(_getCurrentFavoritesSorted());

        // Listen for box changes and re-emit the full sorted list
        subscription = _datasource.watch().listen((_) {
          if (!controller.isClosed) {
            controller.add(_getCurrentFavoritesSorted());
          }
        });
      },
      onCancel: () {
        subscription?.cancel();
        controller.close();
      },
    );

    return controller.stream;
  }

  /// Returns the current favorites list sorted by addedAt descending,
  /// limited to [AppConstants.maxFavorites].
  List<Favorite> _getCurrentFavoritesSorted() {
    try {
      final models = _datasource.getAll();
      models.sort((a, b) => b.addedAtMillis.compareTo(a.addedAtMillis));

      final limited = models.length > AppConstants.maxFavorites
          ? models.sublist(0, AppConstants.maxFavorites)
          : models;

      return limited.map(_modelToEntity).toList();
    } catch (_) {
      // On error, return empty list to avoid breaking the stream
      return [];
    }
  }

  /// Converts a [FavoriteModel] to a [Favorite] domain entity.
  Favorite _modelToEntity(FavoriteModel model) {
    return Favorite(
      bookId: model.bookId,
      chapter: model.chapter,
      verse: model.verse,
      addedAt: DateTime.fromMillisecondsSinceEpoch(model.addedAtMillis),
    );
  }
}
