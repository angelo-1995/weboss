import '../../../../shared/entities/verse_reference.dart';

/// An immutable representation of a search result.
class SearchResult {
  const SearchResult({
    required this.reference,
    required this.verseText,
    required this.bookName,
    required this.highlightedSnippet,
    required this.matchStart,
    required this.matchEnd,
  });

  /// The verse reference (book, chapter, verse) for this result.
  final VerseReference reference;

  /// The full text of the matched verse.
  final String verseText;

  /// The display name of the book.
  final String bookName;

  /// A snippet of text with the match highlighted.
  final String highlightedSnippet;

  /// The start index of the match within the verse text.
  final int matchStart;

  /// The end index of the match within the verse text.
  final int matchEnd;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SearchResult &&
          reference == other.reference &&
          verseText == other.verseText &&
          bookName == other.bookName &&
          highlightedSnippet == other.highlightedSnippet &&
          matchStart == other.matchStart &&
          matchEnd == other.matchEnd;

  @override
  int get hashCode => Object.hash(
        reference,
        verseText,
        bookName,
        highlightedSnippet,
        matchStart,
        matchEnd,
      );

  @override
  String toString() =>
      'SearchResult(reference: $reference, bookName: $bookName, '
      'matchStart: $matchStart, matchEnd: $matchEnd)';
}
