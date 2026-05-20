import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/book.dart';
import '../providers/bible_providers.dart';
import '../providers/reading_position_provider.dart';
import '../widgets/chapter_grid.dart';

/// Screen that displays all 66 books of the Bible organized by
/// Old Testament and New Testament tabs.
///
/// On book tap, navigates to the [ChapterGridScreen] for that book.
/// Highlights the currently reading book based on [readingPositionProvider].
///
/// Validates: Requirements 2.1, 2.2
class BookSelectorScreen extends ConsumerWidget {
  const BookSelectorScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(bibleProvider);
    final currentPosition = ref.watch(readingPositionProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Biblia'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Antiguo Testamento'),
              Tab(text: 'Nuevo Testamento'),
            ],
          ),
        ),
        body: booksAsync.when(
          data: (books) => TabBarView(
            children: [
              _BookListView(
                books: books.oldTestament,
                currentBookId: currentPosition.bookId,
              ),
              _BookListView(
                books: books.newTestament,
                currentBookId: currentPosition.bookId,
              ),
            ],
          ),
          loading: () => const Center(
            child: CircularProgressIndicator(),
          ),
          error: (error, stack) => Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 48,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error al cargar los libros',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    error.toString(),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Internal widget that renders a scrollable list of books.
///
/// Highlights the [currentBookId] to indicate the user's current reading book.
class _BookListView extends StatelessWidget {
  final List<Book> books;
  final int currentBookId;

  const _BookListView({
    required this.books,
    required this.currentBookId,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      itemCount: books.length,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
      itemBuilder: (context, index) {
        final book = books[index];
        final isCurrentBook = book.id == currentBookId;

        return _BookListTile(
          book: book,
          isCurrentBook: isCurrentBook,
        );
      },
    );
  }
}

/// A single book tile in the book list.
///
/// Shows the book name, chapter count, and a highlight if it's the
/// currently reading book. Tapping navigates to the chapter grid.
class _BookListTile extends StatelessWidget {
  final Book book;
  final bool isCurrentBook;

  const _BookListTile({
    required this.book,
    required this.isCurrentBook,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: isCurrentBook
            ? colorScheme.primary
            : colorScheme.surfaceContainerHighest,
        child: Text(
          book.abbreviation,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isCurrentBook
                ? colorScheme.onPrimary
                : colorScheme.onSurfaceVariant,
          ),
        ),
      ),
      title: Text(
        book.name,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: isCurrentBook ? FontWeight.w700 : FontWeight.w400,
          color: isCurrentBook ? colorScheme.primary : null,
        ),
      ),
      subtitle: Text(
        '${book.chapterCount} capítulo${book.chapterCount > 1 ? 's' : ''}',
        style: theme.textTheme.bodySmall?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
      ),
      trailing: isCurrentBook
          ? Icon(
              Icons.bookmark,
              color: colorScheme.primary,
              size: 20,
            )
          : const Icon(
              Icons.chevron_right,
              size: 20,
            ),
      tileColor: isCurrentBook
          ? colorScheme.primaryContainer.withOpacity(0.3)
          : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16.0,
        vertical: 4.0,
      ),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ChapterGridScreen(
              bookId: book.id,
              bookName: book.name,
              chapterCount: book.chapterCount,
            ),
          ),
        );
      },
    );
  }
}
