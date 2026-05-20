import '../../../../core/error/app_error.dart';
import '../entities/search_results.dart';
import '../repositories/search_repository.dart';

/// Use case that searches Bible verses by a text query.
///
/// Delegates to [SearchRepository] after verifying the index is ready.
/// The repository handles query validation, normalization, and result limiting.
///
/// Validates: Requirements 3.1, 3.2, 3.5, 3.6, 3.8, 3.9, 3.11
class SearchVersesUseCase {
  final SearchRepository _repository;

  const SearchVersesUseCase(this._repository);

  /// Executes a search for [query] across all Bible verses.
  ///
  /// Returns [Result.failure] with a [ValidationError] if the query is invalid.
  /// Returns [Result.failure] with a [StorageError] if the index is not ready.
  /// Returns [Result.success] with [SearchResults] containing the matched
  /// verses (max 100) and total match count on success.
  Future<Result<SearchResults>> call(String query) async {
    // Verify the search index is ready before searching.
    final indexReady = await _repository.isIndexReady();
    if (!indexReady) {
      return Result.failure(
        AppError.initialization(
          'El índice de búsqueda no está listo. Por favor espere a que se complete la inicialización.',
        ),
      );
    }

    return _repository.search(query);
  }
}
