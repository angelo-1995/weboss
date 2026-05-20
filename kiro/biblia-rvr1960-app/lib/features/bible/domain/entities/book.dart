/// Represents the two divisions of the Bible.
enum Testament { oldTestament, newTestament }

/// An immutable representation of a Bible book.
class Book {
  const Book({
    required this.id,
    required this.name,
    required this.abbreviation,
    required this.testament,
    required this.chapterCount,
  });

  /// Unique identifier for the book (1-66).
  final int id;

  /// Full name of the book (e.g., "Génesis").
  final String name;

  /// Short abbreviation (e.g., "Gn").
  final String abbreviation;

  /// Whether this book belongs to the Old or New Testament.
  final Testament testament;

  /// Total number of chapters in this book.
  final int chapterCount;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Book &&
          id == other.id &&
          name == other.name &&
          abbreviation == other.abbreviation &&
          testament == other.testament &&
          chapterCount == other.chapterCount;

  @override
  int get hashCode =>
      Object.hash(id, name, abbreviation, testament, chapterCount);

  @override
  String toString() =>
      'Book(id: $id, name: $name, abbreviation: $abbreviation, '
      'testament: $testament, chapterCount: $chapterCount)';
}
