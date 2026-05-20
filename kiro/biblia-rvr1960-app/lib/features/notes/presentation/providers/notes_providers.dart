import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/note.dart';
import '../../domain/repositories/notes_repository.dart';
import '../../domain/usecases/manage_notes.dart';

// -----------------------------------------------------------------------------
// Repository Provider
// -----------------------------------------------------------------------------

/// Provider for the [NotesRepository] instance.
///
/// Must be overridden at the ProviderScope level with a concrete
/// implementation once the database is initialized.
///
/// Example:
/// ```dart
/// ProviderScope(
///   overrides: [
///     notesRepositoryProvider.overrideWithValue(NotesRepositoryImpl(dataSource)),
///   ],
///   child: MyApp(),
/// )
/// ```
final notesRepositoryProvider = Provider<NotesRepository>((ref) {
  throw UnimplementedError(
    'notesRepositoryProvider must be overridden with a concrete '
    'NotesRepository implementation.',
  );
});

// -----------------------------------------------------------------------------
// Use Case Provider
// -----------------------------------------------------------------------------

/// Provider for [ManageNotes] use case.
///
/// Encapsulates all note CRUD operations with validation.
final manageNotesUseCaseProvider = Provider<ManageNotes>((ref) {
  final repository = ref.watch(notesRepositoryProvider);
  return ManageNotes(repository);
});

// -----------------------------------------------------------------------------
// Data Providers
// -----------------------------------------------------------------------------

/// Reactive stream of all notes sorted by modifiedAt descending.
///
/// Emits a new list whenever notes are created, updated, or deleted.
///
/// Usage:
/// ```dart
/// final notesAsync = ref.watch(notesStreamProvider);
/// notesAsync.when(
///   data: (notes) => ...,
///   loading: () => ...,
///   error: (e, st) => ...,
/// );
/// ```
///
/// Validates: Requirements 5.5
final notesStreamProvider = StreamProvider<List<Note>>((ref) {
  final repository = ref.watch(notesRepositoryProvider);
  return repository.watchNotes();
});

/// Parameter class for verse-specific note lookup.
///
/// Uses value equality so Riverpod can correctly cache and deduplicate
/// provider instances for the same (bookId, chapter, verse) combination.
class NoteVerseParams {
  final int bookId;
  final int chapter;
  final int verse;

  const NoteVerseParams({
    required this.bookId,
    required this.chapter,
    required this.verse,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NoteVerseParams &&
          other.bookId == bookId &&
          other.chapter == chapter &&
          other.verse == verse;

  @override
  int get hashCode => Object.hash(bookId, chapter, verse);

  @override
  String toString() =>
      'NoteVerseParams(bookId: $bookId, chapter: $chapter, verse: $verse)';
}

/// Retrieves the note for a specific verse, or null if none exists.
///
/// Usage:
/// ```dart
/// final noteAsync = ref.watch(
///   noteForVerseProvider(NoteVerseParams(bookId: 1, chapter: 1, verse: 1)),
/// );
/// ```
///
/// Validates: Requirements 5.4
final noteForVerseProvider =
    FutureProvider.family<Note?, NoteVerseParams>((ref, params) async {
  final useCase = ref.watch(manageNotesUseCaseProvider);
  return useCase.getNote(
    bookId: params.bookId,
    chapter: params.chapter,
    verse: params.verse,
  );
});
