import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_error.dart';
import '../../../bible/presentation/providers/bible_providers.dart';
import '../../domain/entities/verse_of_day.dart';
import '../../domain/usecases/get_verse_of_day.dart';

// -----------------------------------------------------------------------------
// Use Case Provider
// -----------------------------------------------------------------------------

/// Provider for [GetVerseOfDay] use case.
///
/// Retrieves the verse of the day using a deterministic date-based algorithm
/// from the pre-bundled pool of curated verse references.
final getVerseOfDayUseCaseProvider = Provider<GetVerseOfDay>((ref) {
  final repository = ref.watch(bibleRepositoryProvider);
  return GetVerseOfDay(repository);
});

// -----------------------------------------------------------------------------
// Data Provider
// -----------------------------------------------------------------------------

/// Loads the verse of the day for the current date.
///
/// Returns `null` if the verse could not be loaded (e.g., database error).
/// The home screen should display a placeholder when this returns null.
///
/// The verse is deterministic per calendar day — same date always produces
/// the same verse. Different dates within a 365-day window produce different
/// verses.
///
/// Validates: Requirements 6.1, 6.2, 6.3, 9.1, 9.7
final verseOfDayProvider = FutureProvider<VerseOfDay?>((ref) async {
  final useCase = ref.watch(getVerseOfDayUseCaseProvider);
  final result = await useCase.call();

  return switch (result) {
    Success(:final data) => data,
    Failure() => null,
  };
});
