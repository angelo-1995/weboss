import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../../../core/router/routes.dart';
import '../../domain/entities/note.dart';
import '../providers/notes_providers.dart';
import '../widgets/note_editor_dialog.dart';

/// Screen displaying all user notes sorted by last modified date (most recent first).
///
/// Features:
/// - List view with book name, chapter:verse, note preview, and date
/// - Tap to navigate to Reader at the associated verse
/// - Long press or swipe to delete with confirmation
/// - Empty state with icon and instructional text
///
/// Validates: Requirements 5.5, 5.6, 5.10
class NotesScreen extends ConsumerWidget {
  const NotesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notesAsync = ref.watch(notesStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notas',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
      ),
      body: notesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator.adaptive(),
        ),
        error: (error, stack) => _ErrorState(error: error),
        data: (notes) {
          if (notes.isEmpty) {
            return const _EmptyState();
          }
          return _NotesList(notes: notes);
        },
      ),
    );
  }
}

/// List of notes with dismissible items for delete.
class _NotesList extends ConsumerWidget {
  final List<Note> notes;

  const _NotesList({required this.notes});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        final note = notes[index];
        return _NoteListItem(
          note: note,
          onTap: () => _navigateToReader(context, note),
          onDelete: () => _confirmDelete(context, ref, note),
          onEdit: () => _editNote(context, ref, note),
        );
      },
    );
  }

  /// Navigates to the Reader screen at the note's verse location.
  void _navigateToReader(BuildContext context, Note note) {
    // Navigate to reader at the note's book/chapter using GoRouter.
    context.go(AppRoutes.readerPath(note.bookId, note.chapter));
  }

  /// Shows delete confirmation dialog.
  Future<void> _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    Note note,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => _DeleteConfirmationDialog(note: note),
    );

    if (confirmed == true && context.mounted) {
      final useCase = ref.read(manageNotesUseCaseProvider);
      final id = '${note.bookId}_${note.chapter}_${note.verse}';
      await useCase.deleteNote(id);
    }
  }

  /// Opens the note editor for editing an existing note.
  Future<void> _editNote(
    BuildContext context,
    WidgetRef ref,
    Note note,
  ) async {
    final updatedText = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteEditorDialog(initialText: note.text),
    );

    if (updatedText != null && context.mounted) {
      final useCase = ref.read(manageNotesUseCaseProvider);
      final id = '${note.bookId}_${note.chapter}_${note.verse}';
      await useCase.updateNote(id: id, text: updatedText);
    }
  }
}

/// Individual note list item with book reference, preview, and date.
class _NoteListItem extends StatelessWidget {
  final Note note;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onEdit;

  const _NoteListItem({
    required this.note,
    required this.onTap,
    required this.onDelete,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bookName = BibleConstants.getBookName(note.bookId) ?? 'Libro ${note.bookId}';
    final reference = '$bookName ${note.chapter}:${note.verse}';
    final preview = _truncateText(note.text, 80);
    final dateText = _formatDate(note.modifiedAt);

    return Dismissible(
      key: ValueKey('${note.bookId}_${note.chapter}_${note.verse}'),
      direction: DismissDirection.endToStart,
      confirmDismiss: (_) async {
        onDelete();
        return false; // We handle deletion in the confirmation dialog.
      },
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: theme.colorScheme.error,
        child: Icon(
          Icons.delete_outline,
          color: theme.colorScheme.onError,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
        onTap: onTap,
        onLongPress: onDelete,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.note_outlined,
            color: theme.colorScheme.onPrimaryContainer,
            size: 20,
          ),
        ),
        title: Text(
          reference,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              preview,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              dateText,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
          ],
        ),
        trailing: IconButton(
          icon: Icon(
            Icons.edit_outlined,
            size: 20,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
          onPressed: onEdit,
        ),
      ),
    );
  }

  /// Truncates text to [maxLength] characters with ellipsis.
  String _truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}…';
  }

  /// Formats a DateTime to a user-friendly relative or absolute date string.
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return 'Ahora';
    } else if (difference.inHours < 1) {
      final minutes = difference.inMinutes;
      return 'Hace $minutes min';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return 'Hace $hours h';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return 'Hace $days d';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}

/// Empty state shown when no notes exist.
class _EmptyState extends StatelessWidget {
  const _EmptyState();

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
              Icons.note_add_outlined,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No tienes notas',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Toca un versículo mientras lees y selecciona "Nota" para agregar tus reflexiones.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Error state shown when notes fail to load.
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
              'Error al cargar las notas',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Delete confirmation dialog.
///
/// Validates: Requirements 5.10
class _DeleteConfirmationDialog extends StatelessWidget {
  final Note note;

  const _DeleteConfirmationDialog({required this.note});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bookName = BibleConstants.getBookName(note.bookId) ?? 'Libro ${note.bookId}';
    final reference = '$bookName ${note.chapter}:${note.verse}';

    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: const Text('Eliminar nota'),
      content: Text(
        '¿Estás seguro de que deseas eliminar la nota de $reference? Esta acción no se puede deshacer.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text(
            'Cancelar',
            style: TextStyle(color: theme.colorScheme.onSurface),
          ),
        ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(true),
          style: FilledButton.styleFrom(
            backgroundColor: theme.colorScheme.error,
          ),
          child: Text(
            'Eliminar',
            style: TextStyle(color: theme.colorScheme.onError),
          ),
        ),
      ],
    );
  }
}


