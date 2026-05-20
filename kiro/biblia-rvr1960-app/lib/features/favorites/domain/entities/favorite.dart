/// An immutable representation of a favorited verse.
class Favorite {
  const Favorite({
    required this.bookId,
    required this.chapter,
    required this.verse,
    required this.addedAt,
  });

  /// The ID of the book containing the favorited verse.
  final int bookId;

  /// The chapter number of the favorited verse.
  final int chapter;

  /// The verse number that was favorited.
  final int verse;

  /// When this verse was added to favorites.
  final DateTime addedAt;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Favorite &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          verse == other.verse &&
          addedAt == other.addedAt;

  @override
  int get hashCode => Object.hash(bookId, chapter, verse, addedAt);

  @override
  String toString() =>
      'Favorite(bookId: $bookId, chapter: $chapter, verse: $verse, '
      'addedAt: $addedAt)';
}
