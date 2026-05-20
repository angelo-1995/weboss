import 'package:hive/hive.dart';

import '../models/favorite_model.dart';

/// Local data source for favorites using a non-lazy Hive box.
///
/// Uses composite key "{bookId}_{chapter}_{verse}" for O(1) lookups.
/// The box is opened at app startup and remains open for the app lifecycle.
class FavoritesLocalDatasource {
  final Box<FavoriteModel> _box;

  FavoritesLocalDatasource(this._box);

  /// Generates the composite key for a verse reference.
  static String compositeKey(int bookId, int chapter, int verse) =>
      '${bookId}_${chapter}_$verse';

  /// Checks whether a favorite exists for the given verse.
  bool containsKey(String key) => _box.containsKey(key);

  /// Retrieves a favorite by its composite key, or `null` if not found.
  FavoriteModel? get(String key) => _box.get(key);

  /// Adds or updates a favorite in the box.
  Future<void> put(String key, FavoriteModel model) => _box.put(key, model);

  /// Deletes a favorite by its composite key.
  Future<void> delete(String key) => _box.delete(key);

  /// Returns all favorite models currently stored in the box.
  List<FavoriteModel> getAll() => _box.values.toList();

  /// Returns a stream that emits an event whenever the box changes.
  ///
  /// Each event is a [BoxEvent] containing the key, value, and whether
  /// it was a deletion. Consumers should re-read the full list on change.
  Stream<BoxEvent> watch() => _box.watch();

  /// Returns the number of favorites currently stored.
  int get length => _box.length;
}
