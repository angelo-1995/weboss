import 'search_result.dart';

/// Holds the search results along with the total match count.
///
/// The [results] list is limited to [AppConstants.maxSearchResults] (100),
/// while [totalCount] reports the actual number of matches found in the index.
class SearchResults {
  /// The limited list of search results (max 100).
  final List<SearchResult> results;

  /// The total number of matches found before limiting.
  final int totalCount;

  const SearchResults({
    required this.results,
    required this.totalCount,
  });

  /// Creates an empty [SearchResults] instance.
  const SearchResults.empty()
      : results = const [],
        totalCount = 0;
}
