import 'package:hive/hive.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../domain/entities/note.dart';
import '../../domain/repositories/notes_repository.dart';
import '../datasources/notes_local_datasource.dart';
import '../models/note_model.dart';

/// Concrete implementation of [NotesRepository] backed by Hive.
class NotesRepositoryImpl implements NotesRepository {
  final NotesLocalDatasource _datasource;

  NotesRepositoryImpl(this._datasource);

  /// Validates note text length (1-2000 characters).
  Result<void>? _validateText(String text) {
    if (text.isEmpty) {
      return Result.failure(
        AppError.validation(
          'La nota no puede estar vacía. Mínimo ${AppConstants.minNoteLength} carácter.',
        ),
      );
    }
    if (text.length > AppConstants.maxNoteLength) {
      return Result.failure(
        AppError.validation(
          'La nota no puede exceder ${AppConstants.maxNoteLength} caracteres.',
        ),
      );
    }
    return null;
  }

  /// Converts a [NoteModel] to a domain [Note] entity.
  Note _toEntity(NoteModel model) {
    return Note(
      bookId: model.bookId,
      chapter: model.chapter,
      verse: model.verse,
      text: model.text,
      createdAt: DateTime.fromMillisecondsSinceEpoch(model.createdAtMillis),
      modifiedAt: DateTime.fromMillisecondsSinceEpoch(model.modifiedAtMillis),
    );
  }

  @override
  Future<Result<Note>> saveNote(
    int bookId,
    int chapter,
    int verse,
    String text,
  ) async {
    final validationError = _validateText(text);
    if (validationError != null) {
      return Result.failure(
        (validationError as Failure<void>).error,
      );
    }

    try {
      final model = await _datasource.saveNote(
        bookId: bookId,
        chapter: chapter,
        verse: verse,
        text: text,
      );
      return Result.success(_toEntity(model));
    } on HiveError catch (e) {
      return Result.failure(
        AppError.storage('Error al guardar la nota: ${e.message}'),
      );
    } catch (e) {
      return Result.failure(
        AppError.storage('Error inesperado al guardar la nota: $e'),
      );
    }
  }

  @override
  Future<Result<Note>> updateNote(String id, String text) async {
    final validationError = _validateText(text);
    if (validationError != null) {
      return Result.failure(
        (validationError as Failure<void>).error,
      );
    }

    try {
      final model = await _datasource.updateNote(id, text);
      if (model == null) {
        return Result.failure(
          AppError.notFound('Nota no encontrada.'),
        );
      }
      return Result.success(_toEntity(model));
    } on HiveError catch (e) {
      return Result.failure(
        AppError.storage('Error al actualizar la nota: ${e.message}'),
      );
    } catch (e) {
      return Result.failure(
        AppError.storage('Error inesperado al actualizar la nota: $e'),
      );
    }
  }

  @override
  Future<Result<void>> deleteNote(String id) async {
    try {
      await _datasource.deleteNote(id);
      return Result.success(null);
    } on HiveError catch (e) {
      return Result.failure(
        AppError.storage('Error al eliminar la nota: ${e.message}'),
      );
    } catch (e) {
      return Result.failure(
        AppError.storage('Error inesperado al eliminar la nota: $e'),
      );
    }
  }

  @override
  Future<Note?> getNote(int bookId, int chapter, int verse) async {
    try {
      final model = _datasource.getNote(bookId, chapter, verse);
      if (model == null) return null;
      return _toEntity(model);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Result<List<Note>>> getAllNotes() async {
    try {
      final models = _datasource.getAllNotes();
      final notes = models.map(_toEntity).toList();
      // Sort by modifiedAt descending (most recent first)
      notes.sort((a, b) => b.modifiedAt.compareTo(a.modifiedAt));
      return Result.success(notes);
    } on HiveError catch (e) {
      return Result.failure(
        AppError.storage('Error al obtener las notas: ${e.message}'),
      );
    } catch (e) {
      return Result.failure(
        AppError.storage('Error inesperado al obtener las notas: $e'),
      );
    }
  }

  @override
  Stream<List<Note>> watchNotes() {
    return _datasource.watchNotes().map((models) {
      final notes = models.map(_toEntity).toList();
      // Sort by modifiedAt descending (most recent first)
      notes.sort((a, b) => b.modifiedAt.compareTo(a.modifiedAt));
      return notes;
    });
  }
}
