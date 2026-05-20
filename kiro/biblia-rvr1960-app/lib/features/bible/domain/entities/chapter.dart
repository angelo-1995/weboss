import 'verse.dart';

/// An immutable representation of a Bible chapter.
class Chapter {
  const Chapter({
    required this.bookId,
    required this.number,
    required this.verses,
  });

  /// The ID of the book this chapter belongs to.
  final int bookId;

  /// The chapter number within the book.
  final int number;

  /// The list of verses in this chapter.
  final List<Verse> verses;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Chapter &&
          bookId == other.bookId &&
          number == other.number &&
          _listEquals(verses, other.verses);

  @override
  int get hashCode => Object.hash(bookId, number, Object.hashAll(verses));

  @override
  String toString() =>
      'Chapter(bookId: $bookId, number: $number, verses: ${verses.length})';

  static bool _listEquals<T>(List<T> a, List<T> b) {
    if (identical(a, b)) return true;
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
}
