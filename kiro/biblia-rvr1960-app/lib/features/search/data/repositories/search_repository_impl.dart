import 'package:hive/hive.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/bible_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../../../core/utils/text_normalizer.dart';
import '../../../../shared/entities/verse_reference.dart';
import '../../domain/entities/search_result.dart';
import '../../domain/entities/search_results.dart';
import '../../domain/repositories/search_repository.dart';
import '../models/search_index_entry.dart';

/// Concrete implementation of [SearchRepository].
///
/// Uses a Hive [LazyBox] containing the pre-built inverted index to perform
/// ultra-fast lookups. Supports multi-word queries via posting list intersection,
/// accent-insensitive search via text normalization, and returns results sorted
/// by canonical book order.
class SearchRepositoryImpl implements SearchRepository {
  final LazyBox<SearchIndexEntry> _searchIndexBox;

  SearchRepositoryImpl(this._searchIndexBox);

  /// Regular expression to split normalized query into tokens.
  static final RegExp _tokenSplitPattern = RegExp(r'[^a-z0-9]+');

  @override
  Future<Result<SearchResults>> search(String query) async {
    // Trim whitespace before validation.
    final trimmedQuery = query.trim();

    // Validate query length (3-100 chars).
    if (trimmedQuery.length < AppConstants.minSearchLength) {
      return Result.failure(
        AppError.validation(
          'La búsqueda debe tener al menos ${AppConstants.minSearchLength} caracteres.',
        ),
      );
    }

    if (trimmedQuery.length > AppConstants.maxSearchQueryLength) {
      return Result.failure(
        AppError.validation(
          'La búsqueda no puede exceder ${AppConstants.maxSearchQueryLength} caracteres.',
        ),
      );
    }

    try {
      // Normalize query: lowercase + strip accents.
      final normalizedQuery = TextNormalizer.normalize(trimmedQuery);

      // Tokenize the normalized query.
      final tokens = normalizedQuery
          .split(_tokenSplitPattern)
          .where((token) => token.length >= AppConstants.minSearchLength)
          .toList();

      if (tokens.isEmpty) {
        return Result.success(SearchResults.empty());
      }

      // Look up posting lists for each token.
      final List<Set<_VerseKey>> postingLists = [];

      for (final token in tokens) {
        final entry = await _searchIndexBox.get(token);
        if (entry == null) {
          // Token not found — no results possible for multi-word AND search.
          return Result.success(SearchResults.empty());
        }

        final Set<_VerseKey> verseSet = {};
        for (int i = 0; i < entry.bookIds.length; i++) {
          verseSet.add(_VerseKey(
            bookId: entry.bookIds[i],
            chapter: entry.chapters[i],
            verse: entry.verses[i],
          ));
        }
        postingLists.add(verseSet);
      }

      // Intersect posting lists for multi-word queries.
      Set<_VerseKey> matchingVerses = postingLists.first;
      for (int i = 1; i < postingLists.length; i++) {
        matchingVerses = matchingVerses.intersection(postingLists[i]);
        if (matchingVerses.isEmpty) {
          return Result.success(SearchResults.empty());
        }
      }

      // Sort by canonical book order (bookId, then chapter, then verse).
      final sortedVerses = matchingVerses.toList()
        ..sort((a, b) {
          final bookCompare = a.bookId.compareTo(b.bookId);
          if (bookCompare != 0) return bookCompare;
          final chapterCompare = a.chapter.compareTo(b.chapter);
          if (chapterCompare != 0) return chapterCompare;
          return a.verse.compareTo(b.verse);
        });

      // Report total count before limiting.
      final totalCount = sortedVerses.length;

      // Limit to max results.
      final limitedVerses = sortedVerses.length > AppConstants.maxSearchResults
          ? sortedVerses.sublist(0, AppConstants.maxSearchResults)
          : sortedVerses;

      // Build SearchResult objects.
      final results = limitedVerses.map((verseKey) {
        final bookName =
            BibleConstants.getBookName(verseKey.bookId) ?? 'Desconocido';
        final reference = VerseReference(
          bookId: verseKey.bookId,
          chapter: verseKey.chapter,
          verse: verseKey.verse,
        );

        // Build a reference string as context text.
        final verseRef = '$bookName ${verseKey.chapter}:${verseKey.verse}';

        return SearchResult(
          reference: reference,
          verseText: verseRef,
          bookName: bookName,
          highlightedSnippet: '',
          matchStart: 0,
          matchEnd: 0,
        );
      }).toList();

      return Result.success(SearchResults(
        results: results,
        totalCount: totalCount,
      ));
    } catch (e) {
      return Result.failure(
        AppError.storage('Error al buscar: ${e.toString()}'),
      );
    }
  }

  @override
  Future<bool> isIndexReady() async {
    try {
      return _searchIndexBox.isOpen && _searchIndexBox.length > 0;
    } catch (_) {
      return false;
    }
  }
}

/// Internal key for identifying a unique verse in the posting list intersection.
class _VerseKey {
  final int bookId;
  final int chapter;
  final int verse;

  const _VerseKey({
    required this.bookId,
    required this.chapter,
    required this.verse,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _VerseKey &&
          bookId == other.bookId &&
          chapter == other.chapter &&
          verse == other.verse;

  @override
  int get hashCode => Object.hash(bookId, chapter, verse);
}
