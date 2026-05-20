import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../providers/reading_position_provider.dart';

/// Screen that displays chapters for a specific book as a tappable grid.
///
/// Accepts [bookId], [bookName], and [chapterCount] as parameters.
/// On chapter tap, updates the reading position and navigates to the Reader.
/// Highlights the current chapter if the user is viewing the same book.
///
/// Validates: Requirements 2.2
class ChapterGridScreen extends ConsumerWidget {
  final int bookId;
  final String bookName;
  final int chapterCount;

  const ChapterGridScreen({
    super.key,
    required this.bookId,
    required this.bookName,
    required this.chapterCount,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPosition = ref.watch(readingPositionProvider);
    final isCurrentBook = currentPosition.bookId == bookId;
    final currentChapter = isCurrentBook ? currentPosition.chapter : -1;

    return Scaffold(
      appBar: AppBar(
        title: Text(bookName),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ChapterGrid(
          bookId: bookId,
          chapterCount: chapterCount,
          currentChapter: currentChapter,
          onChapterSelected: (chapter) {
            _navigateToChapter(context, ref, chapter);
          },
        ),
      ),
    );
  }

  void _navigateToChapter(BuildContext context, WidgetRef ref, int chapter) {
    // Update reading position to the selected book/chapter.
    ref.read(readingPositionProvider.notifier).updatePosition(
          bookId: bookId,
          chapter: chapter,
        );

    // Navigate to the reader screen using GoRouter.
    context.go(AppRoutes.readerPath(bookId, chapter));
  }
}

/// A grid widget displaying chapter numbers (1, 2, 3, ..., N) as tappable tiles.
///
/// Highlights [currentChapter] if the user is viewing the same book.
/// Calls [onChapterSelected] when a chapter tile is tapped.
///
/// Can be used standalone (e.g., in the chapter selector overlay) or
/// within the [ChapterGridScreen].
class ChapterGrid extends StatelessWidget {
  final int bookId;
  final int chapterCount;
  final int currentChapter;
  final ValueChanged<int> onChapterSelected;

  const ChapterGrid({
    super.key,
    required this.bookId,
    required this.chapterCount,
    required this.currentChapter,
    required this.onChapterSelected,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const BouncingScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1.0,
      ),
      itemCount: chapterCount,
      itemBuilder: (context, index) {
        final chapter = index + 1;
        final isCurrentChapter = chapter == currentChapter;

        return _ChapterTile(
          chapter: chapter,
          isCurrentChapter: isCurrentChapter,
          onTap: () => onChapterSelected(chapter),
        );
      },
    );
  }
}

/// A single chapter tile in the grid.
///
/// Displays the chapter number with visual distinction for the current chapter.
class _ChapterTile extends StatelessWidget {
  final int chapter;
  final bool isCurrentChapter;
  final VoidCallback onTap;

  const _ChapterTile({
    required this.chapter,
    required this.isCurrentChapter,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Material(
      color: isCurrentChapter
          ? colorScheme.primary
          : colorScheme.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(12),
      elevation: isCurrentChapter ? 2 : 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Center(
          child: Text(
            '$chapter',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight:
                  isCurrentChapter ? FontWeight.w700 : FontWeight.w500,
              color: isCurrentChapter
                  ? colorScheme.onPrimary
                  : colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}
