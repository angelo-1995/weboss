import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../domain/entities/search_results.dart';
import '../../domain/repositories/search_repository.dart';
import '../../domain/usecases/search_verses.dart';

// -----------------------------------------------------------------------------
// Repository Provider
// -----------------------------------------------------------------------------

/// Provider for the [SearchRepository] instance.
///
/// Must be overridden at the ProviderScope level with a concrete
/// [SearchRepositoryImpl] once the database and search index are initialized.
final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  throw UnimplementedError(
    'searchRepositoryProvider must be overridden with a concrete '
    'SearchRepositoryImpl instance.',
  );
});

// -----------------------------------------------------------------------------
// Use Case Provider
// -----------------------------------------------------------------------------

/// Provider for [SearchVersesUseCase].
///
/// Searches Bible verses by text query with validation and index readiness check.
final searchVersesUseCaseProvider = Provider<SearchVersesUseCase>((ref) {
  final repository = ref.watch(searchRepositoryProvider);
  return SearchVersesUseCase(repository);
});

// -----------------------------------------------------------------------------
// State Providers
// -----------------------------------------------------------------------------

/// Holds the current search query text entered by the user.
///
/// Updated by the search TextField on the search screen.
/// Watched by [searchResultsProvider] to trigger debounced searches.
final searchQueryProvider = StateProvider<String>((ref) => '');

// -----------------------------------------------------------------------------
// Search Results Provider (with debounce)
// -----------------------------------------------------------------------------

/// Provides search results with a 150ms debounce on query changes.
///
/// Behavior:
/// - Returns `null` if query is shorter than [AppConstants.minSearchLength] (3 chars)
/// - Waits 150ms after the last query change before executing the search
/// - Returns [SearchResults] on success or throws on failure
///
/// Usage:
/// ```dart
/// final searchAsync = ref.watch(searchResultsProvider);
/// searchAsync.when(
///   data: (results) => results == null ? showMinLengthMessage() : showResults(results),
///   loading: () => showLoading(),
///   error: (e, st) => showError(e),
/// );
/// ```
///
/// Validates: Requirements 3.1, 3.2
final searchResultsProvider = FutureProvider<SearchResults?>((ref) async {
  final query = ref.watch(searchQueryProvider);

  // Don't search if query is too short.
  if (query.trim().length < AppConstants.minSearchLength) {
    return null;
  }

  // Debounce: wait 150ms before executing the search.
  // If the provider is invalidated (query changes) during this wait,
  // the future is cancelled and a new one starts.
  await Future<void>.delayed(
    const Duration(milliseconds: AppConstants.searchDebounceMs),
  );

  // Check if still active after debounce (Riverpod handles cancellation).
  final useCase = ref.read(searchVersesUseCaseProvider);
  final result = await useCase(query.trim());

  return switch (result) {
    Success(:final data) => data,
    Failure(:final error) => throw Exception(error.toString()),
  };
});
