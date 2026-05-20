import '../../../../core/error/app_error.dart';
import '../entities/search_results.dart';

/// Abstract repository interface for search operations.
///
/// Defined in the domain layer — implementations live in the data layer.
/// All methods return [Result<T>] to handle success/failure uniformly.
abstract class SearchRepository {
  /// Searches the Bible text for verses matching [query].
  ///
  /// Returns a [SearchResults] containing the limited result list (max 100)
  /// and the total match count. Results are sorted by canonical book order.
  ///
  /// Returns [Result.failure] with a [ValidationError] if the query
  /// is shorter than 3 characters or longer than 100 characters.
  Future<Result<SearchResults>> search(String query);

  /// Checks whether the search index has been built and is ready for queries.
  Future<bool> isIndexReady();
}
