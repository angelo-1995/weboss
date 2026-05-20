import '../../../../core/utils/text_normalizer.dart';
import '../../../bible/data/models/chapter_model.dart';
import '../models/search_index_entry.dart';

/// Intermediate structure used during index building to collect verse references.
class _PostingListBuilder {
  final List<int> bookIds = [];
  final List<int> chapters = [];
  final List<int> verses = [];

  void addReference(int bookId, int chapter, int verse) {
    bookIds.add(bookId);
    chapters.add(chapter);
    verses.add(verse);
  }

  SearchIndexEntry toEntry() {
    return SearchIndexEntry.create(
      bookIds: List<int>.from(bookIds),
      chapters: List<int>.from(chapters),
      verses: List<int>.from(verses),
    );
  }
}

/// Builds an inverted search index from Bible chapter data.
///
/// The index maps normalized tokens to lists of verse references (bookId, chapter, verse)
/// where that token appears. This enables O(1) lookup per token for ultra-fast search.
///
/// The build process:
/// 1. Iterates all verses in all chapters
/// 2. Normalizes verse text (lowercase, strip accents)
/// 3. Tokenizes on whitespace/punctuation, keeping tokens ≥ 3 characters
/// 4. Generates prefix tokens for partial matching (prefixes of length ≥ 4 for words ≥ 4 chars)
/// 5. Stores each token → list of verse references
///
/// Designed to run in an Isolate via `compute()` to avoid blocking the UI thread.
class SearchIndexBuilder {
  SearchIndexBuilder._();

  /// Regular expression to split text on non-alphanumeric characters.
  static final RegExp _tokenSplitPattern = RegExp(r'[^a-z0-9]+');

  /// Minimum token length to include in the index.
  static const int _minTokenLength = 3;

  /// Minimum word length to generate prefix tokens for partial matching.
  static const int _minPrefixWordLength = 4;

  /// Minimum prefix length to generate for partial matching.
  static const int _minPrefixLength = 4;

  /// Builds the inverted index from a list of chapters.
  ///
  /// This is a top-level-compatible static method that can be used with
  /// `compute()` for Isolate execution.
  ///
  /// [chapters] is a map of composite keys ("{bookId}_{chapterNum}") to ChapterModel.
  ///
  /// Returns a Map where:
  /// - Key: normalized token string
  /// - Value: SearchIndexEntry containing parallel lists of verse references
  static Map<String, SearchIndexEntry> buildIndex(
    Map<String, ChapterModel> chapters,
  ) {
    final Map<String, _PostingListBuilder> index = {};

    for (final chapter in chapters.values) {
      final int bookId = chapter.bookId;
      final int chapterNum = chapter.number;

      for (final verse in chapter.verses) {
        final int verseNum = verse.number;
        final String normalizedText = TextNormalizer.normalize(verse.text);

        // Tokenize on non-alphanumeric characters
        final List<String> tokens = normalizedText
            .split(_tokenSplitPattern)
            .where((token) => token.length >= _minTokenLength)
            .toList();

        // Use a set to avoid adding duplicate references for the same token
        // within the same verse
        final Set<String> processedTokens = {};

        for (final token in tokens) {
          // Add the full token
          if (processedTokens.add(token)) {
            _addToIndex(index, token, bookId, chapterNum, verseNum);
          }

          // Generate prefix tokens for partial matching
          // For words ≥ 4 chars, generate prefixes of length 4, 5, ..., len-1
          if (token.length >= _minPrefixWordLength) {
            for (int prefixLen = _minPrefixLength;
                prefixLen < token.length;
                prefixLen++) {
              final String prefix = token.substring(0, prefixLen);
              if (processedTokens.add(prefix)) {
                _addToIndex(index, prefix, bookId, chapterNum, verseNum);
              }
            }
          }
        }
      }
    }

    // Convert builders to final SearchIndexEntry objects
    final Map<String, SearchIndexEntry> result = {};
    for (final entry in index.entries) {
      result[entry.key] = entry.value.toEntry();
    }

    return result;
  }

  /// Adds a verse reference to the posting list for the given token.
  static void _addToIndex(
    Map<String, _PostingListBuilder> index,
    String token,
    int bookId,
    int chapter,
    int verse,
  ) {
    final builder = index.putIfAbsent(token, () => _PostingListBuilder());
    builder.addReference(bookId, chapter, verse);
  }
}
