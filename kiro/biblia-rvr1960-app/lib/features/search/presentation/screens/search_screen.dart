import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/bible_constants.dart';
import '../../../../core/router/routes.dart';
import '../../domain/entities/search_result.dart';
import '../../domain/entities/search_results.dart';
import '../providers/search_providers.dart';

/// The search screen for finding Bible verses by text query.
///
/// Features:
/// - TextField with clear button for search input
/// - 150ms debounced search via [searchResultsProvider]
/// - Results grouped by book in canonical order
/// - ±40 chars context around match with highlighted terms
/// - Minimum query length message for < 3 chars
/// - Empty state with spelling suggestions for zero results
/// - Total count badge when results exceed display limit
/// - Navigation to Reader on result tap
///
/// Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.7, 3.10
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    // Sync controller with existing query state (e.g., on return to screen).
    final currentQuery = ref.read(searchQueryProvider);
    if (currentQuery.isNotEmpty) {
      _searchController.text = currentQuery;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onQueryChanged(String value) {
    ref.read(searchQueryProvider.notifier).state = value;
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchQueryProvider.notifier).state = '';
    _focusNode.requestFocus();
  }

  void _navigateToReader(SearchResult result) {
    context.go(AppRoutes.readerPath(result.reference.bookId, result.reference.chapter));
  }

  @override
  Widget build(BuildContext context) {
    final query = ref.watch(searchQueryProvider);
    final searchAsync = ref.watch(searchResultsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buscar'),
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
      ),
      body: Column(
        children: [
          // Search input field.
          _SearchInputField(
            controller: _searchController,
            focusNode: _focusNode,
            onChanged: _onQueryChanged,
            onClear: _clearSearch,
          ),

          // Results area.
          Expanded(
            child: _buildResultsBody(query, searchAsync),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsBody(String query, AsyncValue<SearchResults?> searchAsync) {
    final trimmedQuery = query.trim();

    // Show minimum length message when query is too short.
    if (trimmedQuery.isEmpty) {
      return const _InitialState();
    }

    if (trimmedQuery.length < AppConstants.minSearchLength) {
      return const _MinQueryLengthMessage();
    }

    // Show search results or loading/error states.
    return searchAsync.when(
      loading: () => const Center(
        child: CircularProgressIndicator.adaptive(),
      ),
      error: (error, stack) => _ErrorState(error: error),
      data: (results) {
        if (results == null) {
          return const _MinQueryLengthMessage();
        }

        if (results.results.isEmpty) {
          return _EmptyResultsState(query: trimmedQuery);
        }

        return _SearchResultsList(
          results: results,
          query: trimmedQuery,
          onResultTap: _navigateToReader,
        );
      },
    );
  }
}

// =============================================================================
// Search Input Field
// =============================================================================

class _SearchInputField extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;

  const _SearchInputField({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        onChanged: onChanged,
        maxLength: AppConstants.maxSearchQueryLength,
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: 'Buscar en la Biblia...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: onClear,
                  tooltip: 'Limpiar búsqueda',
                )
              : null,
          filled: true,
          fillColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: theme.colorScheme.primary,
              width: 1.5,
            ),
          ),
          counterText: '', // Hide the character counter.
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// State Widgets
// =============================================================================

/// Initial state shown when the search field is empty.
class _InitialState extends StatelessWidget {
  const _InitialState();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'Busca palabras o frases en la Biblia',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Message shown when query has fewer than 3 characters.
class _MinQueryLengthMessage extends StatelessWidget {
  const _MinQueryLengthMessage();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.text_fields,
              size: 48,
              color: theme.colorScheme.onSurface.withOpacity(0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Ingresa al menos 3 caracteres',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Empty state shown when search returns zero results.
class _EmptyResultsState extends StatelessWidget {
  final String query;

  const _EmptyResultsState({required this.query});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No se encontraron resultados',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.8),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Revisa la ortografía o intenta con menos palabras',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              'Búsqueda: "$query"',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.4),
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Error state shown when search fails.
class _ErrorState extends StatelessWidget {
  final Object error;

  const _ErrorState({required this.error});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error al buscar',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// Search Results List (grouped by book)
// =============================================================================

/// Displays search results grouped by book in canonical order.
///
/// Shows a total count badge at the top when totalCount > results.length.
class _SearchResultsList extends StatelessWidget {
  final SearchResults results;
  final String query;
  final ValueChanged<SearchResult> onResultTap;

  const _SearchResultsList({
    required this.results,
    required this.query,
    required this.onResultTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final groupedResults = _groupByBook(results.results);

    return CustomScrollView(
      slivers: [
        // Results count header.
        SliverToBoxAdapter(
          child: _ResultsCountBadge(
            displayedCount: results.results.length,
            totalCount: results.totalCount,
          ),
        ),

        // Grouped results by book.
        ...groupedResults.entries.map((entry) {
          final bookId = entry.key;
          final bookResults = entry.value;
          final bookName = BibleConstants.getBookName(bookId) ?? 'Libro $bookId';

          return SliverMainAxisGroup(
            slivers: [
              // Book header.
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                  child: Row(
                    children: [
                      Text(
                        bookName,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${bookResults.length}',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Results for this book.
              SliverList.builder(
                itemCount: bookResults.length,
                itemBuilder: (context, index) {
                  final result = bookResults[index];
                  return _SearchResultTile(
                    result: result,
                    query: query,
                    onTap: () => onResultTap(result),
                  );
                },
              ),
            ],
          );
        }),

        // Bottom padding.
        const SliverPadding(padding: EdgeInsets.only(bottom: 16)),
      ],
    );
  }

  /// Groups results by bookId maintaining canonical order.
  Map<int, List<SearchResult>> _groupByBook(List<SearchResult> results) {
    final grouped = <int, List<SearchResult>>{};
    for (final result in results) {
      grouped.putIfAbsent(result.reference.bookId, () => []).add(result);
    }
    // Results are already sorted by canonical order from the repository,
    // so the LinkedHashMap insertion order preserves canonical ordering.
    return grouped;
  }
}

// =============================================================================
// Results Count Badge
// =============================================================================

class _ResultsCountBadge extends StatelessWidget {
  final int displayedCount;
  final int totalCount;

  const _ResultsCountBadge({
    required this.displayedCount,
    required this.totalCount,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final text = totalCount > displayedCount
        ? '$totalCount resultados, mostrando $displayedCount'
        : '$totalCount ${totalCount == 1 ? 'resultado' : 'resultados'}';

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Text(
        text,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurface.withOpacity(0.6),
        ),
      ),
    );
  }
}

// =============================================================================
// Individual Search Result Tile
// =============================================================================

/// A single search result tile showing verse reference and context snippet
/// with highlighted matching terms.
class _SearchResultTile extends StatelessWidget {
  final SearchResult result;
  final String query;
  final VoidCallback onTap;

  const _SearchResultTile({
    required this.result,
    required this.query,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final reference =
        '${result.bookName} ${result.reference.chapter}:${result.reference.verse}';

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Verse reference.
            Text(
              reference,
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 4),
            // Context snippet with highlighted match.
            _HighlightedSnippet(
              verseText: result.verseText,
              matchStart: result.matchStart,
              matchEnd: result.matchEnd,
              query: query,
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// Highlighted Snippet Widget
// =============================================================================

/// Displays ±40 characters of context around the match with the matching
/// terms highlighted in the primary color.
class _HighlightedSnippet extends StatelessWidget {
  final String verseText;
  final int matchStart;
  final int matchEnd;
  final String query;

  const _HighlightedSnippet({
    required this.verseText,
    required this.matchStart,
    required this.matchEnd,
    required this.query,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spans = _buildHighlightedSpans(theme);

    return RichText(
      text: TextSpan(
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurface.withOpacity(0.7),
          height: 1.4,
        ),
        children: spans,
      ),
      maxLines: 3,
      overflow: TextOverflow.ellipsis,
    );
  }

  List<TextSpan> _buildHighlightedSpans(ThemeData theme) {
    const contextChars = AppConstants.searchContextChars;

    // Calculate context window around the match.
    final snippetStart = (matchStart - contextChars).clamp(0, verseText.length);
    final snippetEnd = (matchEnd + contextChars).clamp(0, verseText.length);

    final prefix = snippetStart > 0 ? '...' : '';
    final suffix = snippetEnd < verseText.length ? '...' : '';

    final beforeMatch = verseText.substring(snippetStart, matchStart);
    final matchText = verseText.substring(matchStart, matchEnd);
    final afterMatch = verseText.substring(matchEnd, snippetEnd);

    return [
      if (prefix.isNotEmpty)
        TextSpan(text: prefix),
      TextSpan(text: beforeMatch),
      TextSpan(
        text: matchText,
        style: TextStyle(
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.primary,
          backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.3),
        ),
      ),
      TextSpan(text: afterMatch),
      if (suffix.isNotEmpty)
        TextSpan(text: suffix),
    ];
  }
}