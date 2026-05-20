import 'package:hive/hive.dart';

part 'favorite_model.g.dart';

/// Hive model representing a favorited verse.
///
/// Stored in `favorites_box` with composite key "{bookId}_{chapter}_{verse}".
@HiveType(typeId: 3)
class FavoriteModel extends HiveObject {
  /// The book ID of the favorited verse (1-66).
  @HiveField(0)
  late int bookId;

  /// The chapter number of the favorited verse.
  @HiveField(1)
  late int chapter;

  /// The verse number of the favorited verse.
  @HiveField(2)
  late int verse;

  /// Timestamp when the favorite was added (milliseconds since epoch).
  @HiveField(3)
  late int addedAtMillis;

  FavoriteModel();

  FavoriteModel.create({
    required this.bookId,
    required this.chapter,
    required this.verse,
    required this.addedAtMillis,
  });
}
