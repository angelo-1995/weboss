/// An immutable representation of a reference to a specific verse.
class VerseReference {
  const VerseReference({
    required this.bookId,
    required this.chapter,
    required this.verse,
  });

  /// The ID of the book.
  final int bookId;

  /// The chapter number.
  final int chapter;

  /// The verse number.
  final int verse;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VerseReference &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          verse == other.verse;

  @override
  int get hashCode => Object.hash(bookId, chapter, verse);

  @override
  String toString() =>
      'VerseReference(bookId: $bookId, chapter: $chapter, verse: $verse)';
}
