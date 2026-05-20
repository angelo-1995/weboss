import '../../../../core/error/app_error.dart';
import '../entities/note.dart';
import '../repositories/notes_repository.dart';

/// Use case for managing verse notes (create, update, delete, list).
///
/// Encapsulates business logic and delegates persistence to [NotesRepository].
class ManageNotes {
  final NotesRepository _repository;

  ManageNotes(this._repository);

  /// Creates a new note for the specified verse.
  ///
  /// Validates text length (1-2000 chars) via the repository.
  Future<Result<Note>> saveNote({
    required int bookId,
    required int chapter,
    required int verse,
    required String text,
  }) {
    return _repository.saveNote(bookId, chapter, verse, text);
  }

  /// Updates an existing note's text.
  ///
  /// The [id] is the composite key "{bookId}_{chapter}_{verse}".
  Future<Result<Note>> updateNote({
    required String id,
    required String text,
  }) {
    return _repository.updateNote(id, text);
  }

  /// Deletes a note by its composite key.
  ///
  /// The presentation layer should prompt for confirmation before calling this.
  Future<Result<void>> deleteNote(String id) {
    return _repository.deleteNote(id);
  }

  /// Retrieves the note for a specific verse, or null if none exists.
  Future<Note?> getNote({
    required int bookId,
    required int chapter,
    required int verse,
  }) {
    return _repository.getNote(bookId, chapter, verse);
  }

  /// Returns all notes sorted by modifiedAt descending.
  Future<Result<List<Note>>> getAllNotes() {
    return _repository.getAllNotes();
  }

  /// Reactive stream of all notes, sorted by modifiedAt descending.
  Stream<List<Note>> watchNotes() {
    return _repository.watchNotes();
  }
}
