import 'package:hive/hive.dart';

part 'book_model.g.dart';

/// Hive model representing a Bible book.
///
/// Stored in `books_box` with key = bookId (1-66).
@HiveType(typeId: 0)
class BookModel extends HiveObject {
  /// Unique book identifier (1-66, canonical order).
  @HiveField(0)
  late int id;

  /// Full name of the book (e.g., "Génesis", "Apocalipsis").
  @HiveField(1)
  late String name;

  /// Short abbreviation (e.g., "Gn", "Ap").
  @HiveField(2)
  late String abbreviation;

  /// Testament: 0 = Old Testament, 1 = New Testament.
  @HiveField(3)
  late int testament;

  /// Total number of chapters in this book.
  @HiveField(4)
  late int chapterCount;

  BookModel();

  BookModel.create({
    required this.id,
    required this.name,
    required this.abbreviation,
    required this.testament,
    required this.chapterCount,
  });
}
