/// An immutable representation of a user note attached to a verse.
class Note {
  const Note({
    required this.bookId,
    required this.chapter,
    required this.verse,
    required this.text,
    required this.createdAt,
    required this.modifiedAt,
  });

  /// The ID of the book containing the annotated verse.
  final int bookId;

  /// The chapter number of the annotated verse.
  final int chapter;

  /// The verse number that was annotated.
  final int verse;

  /// The note text content.
  final String text;

  /// When this note was first created.
  final DateTime createdAt;

  /// When this note was last modified.
  final DateTime modifiedAt;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Note &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          verse == other.verse &&
          text == other.text &&
          createdAt == other.createdAt &&
          modifiedAt == other.modifiedAt;

  @override
  int get hashCode =>
      Object.hash(bookId, chapter, verse, text, createdAt, modifiedAt);

  @override
  String toString() =>
      'Note(bookId: $bookId, chapter: $chapter, verse: $verse, '
      'createdAt: $createdAt)';
}
