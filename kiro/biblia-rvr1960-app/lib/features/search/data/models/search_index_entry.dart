import 'package:hive/hive.dart';

part 'search_index_entry.g.dart';

/// Hive model representing a search index posting list entry.
///
/// Stored in `search_index_box` with key = normalized token string.
/// Each entry contains parallel lists of verse references where the token appears.
/// The lists are aligned by index: bookIds[i], chapters[i], verses[i] form one reference.
@HiveType(typeId: 5)
class SearchIndexEntry extends HiveObject {
  /// List of book IDs where the token appears.
  @HiveField(0)
  late List<int> bookIds;

  /// List of chapter numbers (parallel to [bookIds]).
  @HiveField(1)
  late List<int> chapters;

  /// List of verse numbers (parallel to [bookIds] and [chapters]).
  @HiveField(2)
  late List<int> verses;

  SearchIndexEntry();

  SearchIndexEntry.create({
    required this.bookIds,
    required this.chapters,
    required this.verses,
  });
}
