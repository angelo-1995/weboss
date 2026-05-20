/// An immutable representation of a Bible verse.
class Verse {
  const Verse({
    required this.bookId,
    required this.chapter,
    required this.number,
    required this.text,
  });

  /// The ID of the book this verse belongs to.
  final int bookId;

  /// The chapter number this verse belongs to.
  final int chapter;

  /// The verse number within the chapter.
  final int number;

  /// The text content of the verse.
  final String text;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Verse &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          number == other.number &&
          text == other.text;

  @override
  int get hashCode => Object.hash(bookId, chapter, number, text);

  @override
  String toString() =>
      'Verse(bookId: $bookId, chapter: $chapter, number: $number)';
}
