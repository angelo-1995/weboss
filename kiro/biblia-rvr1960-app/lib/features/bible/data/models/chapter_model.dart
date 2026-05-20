import 'package:hive/hive.dart';

import 'verse_model.dart';

part 'chapter_model.g.dart';

/// Hive model representing a Bible chapter.
///
/// Stored in `chapters_box` with composite key "{bookId}_{chapterNum}".
@HiveType(typeId: 1)
class ChapterModel extends HiveObject {
  /// The book ID this chapter belongs to (1-66).
  @HiveField(0)
  late int bookId;

  /// The chapter number within the book (1-based).
  @HiveField(1)
  late int number;

  /// List of verses in this chapter, ordered by verse number.
  @HiveField(2)
  late List<VerseModel> verses;

  ChapterModel();

  ChapterModel.create({
    required this.bookId,
    required this.number,
    required this.verses,
  });
}
