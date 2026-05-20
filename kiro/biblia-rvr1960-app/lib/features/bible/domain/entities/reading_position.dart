/// An immutable representation of the user's reading position.
class ReadingPosition {
  const ReadingPosition({
    required this.bookId,
    required this.chapter,
    this.scrollOffset = 0.0,
  });

  /// The ID of the book being read.
  final int bookId;

  /// The chapter number being read.
  final int chapter;

  /// The scroll offset within the chapter view.
  final double scrollOffset;

  /// Creates a copy of this position with the given fields replaced.
  ReadingPosition copyWith({
    int? bookId,
    int? chapter,
    double? scrollOffset,
  }) {
    return ReadingPosition(
      bookId: bookId ?? this.bookId,
      chapter: chapter ?? this.chapter,
      scrollOffset: scrollOffset ?? this.scrollOffset,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ReadingPosition &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          scrollOffset == other.scrollOffset;

  @override
  int get hashCode => Object.hash(bookId, chapter, scrollOffset);

  @override
  String toString() =>
      'ReadingPosition(bookId: $bookId, chapter: $chapter, '
      'scrollOffset: $scrollOffset)';
}
