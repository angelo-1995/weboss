import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../../favorites/presentation/providers/favorites_providers.dart';
import '../../../notes/presentation/providers/notes_providers.dart';
import '../../../notes/presentation/widgets/note_editor_dialog.dart';
import '../../../settings/presentation/providers/theme_provider.dart';
import '../../../share/presentation/widgets/share_style_sheet.dart';
import '../../domain/entities/chapter.dart';
import '../../domain/entities/verse.dart';
import '../../domain/usecases/get_adjacent_chapter.dart';
import '../providers/bible_providers.dart';
import '../providers/reading_position_provider.dart';
import '../widgets/verse_tile.dart';

/// The main Bible reader screen with horizontal swipe navigation between chapters.
///
/// Features:
/// - PageView for smooth left/right swipe between chapters
/// - Virtualized ListView.builder for efficient verse rendering (max 3 screens)
/// - Boundary detection at Genesis 1 and Revelation 22
/// - Auto-saves reading position on chapter change
/// - AppBar showing current book name and chapter number
///
/// Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 10.1, 10.5
class ReaderScreen extends ConsumerStatefulWidget {
  final int initialBookId;
  final int initialChapter;

  const ReaderScreen({
    super.key,
    required this.initialBookId,
    required this.initialChapter,
  });

  @override
  ConsumerState<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends ConsumerState<ReaderScreen> {
  late PageController _pageController;

  /// Current book ID being displayed.
  late int _currentBookId;

  /// Current chapter number being displayed.
  late int _currentChapter;

  /// Tracks the page index: 0 = previous, 1 = current, 2 = next.
  /// We always keep the current chapter at page index 1.
  static const int _currentPageIndex = 1;

  /// Adjacent chapters data for boundary detection.
  AdjacentChapters? _adjacentChapters;

  /// Whether we are currently animating a page transition.
  bool _isTransitioning = false;

  @override
  void initState() {
    super.initState();
    _currentBookId = widget.initialBookId;
    _currentChapter = widget.initialChapter;
    _pageController = PageController(initialPage: _currentPageIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  /// Resolves the book ID and chapter number for a given page offset
  /// relative to the current position.
  ///
  /// offset: -1 for previous, 0 for current, +1 for next.
  ChapterParams? _resolveChapterForOffset(int offset) {
    if (offset == 0) {
      return ChapterParams(bookId: _currentBookId, chapterNum: _currentChapter);
    }

    final adjacent = _adjacentChapters;
    if (adjacent == null) return null;

    if (offset == -1 && adjacent.previous != null) {
      return ChapterParams(
        bookId: adjacent.previous!.bookId,
        chapterNum: adjacent.previous!.number,
      );
    }

    if (offset == 1 && adjacent.next != null) {
      return ChapterParams(
        bookId: adjacent.next!.bookId,
        chapterNum: adjacent.next!.number,
      );
    }

    return null;
  }

  /// Handles page change from swipe gesture.
  void _onPageChanged(int pageIndex) {
    if (_isTransitioning) return;

    final offset = pageIndex - _currentPageIndex;
    if (offset == 0) return;

    final targetParams = _resolveChapterForOffset(offset);
    if (targetParams == null) {
      // At boundary — snap back to current page.
      _pageController.animateToPage(
        _currentPageIndex,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
      _showBoundaryIndicator(offset);
      return;
    }

    setState(() {
      _isTransitioning = true;
      _currentBookId = targetParams.bookId;
      _currentChapter = targetParams.chapterNum;
      _adjacentChapters = null; // Will be refreshed by provider.
    });

    // Update reading position.
    ref.read(readingPositionProvider.notifier).updatePosition(
          bookId: _currentBookId,
          chapter: _currentChapter,
        );

    // Reset page controller to center without animation.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _pageController.jumpToPage(_currentPageIndex);
        setState(() {
          _isTransitioning = false;
        });
      }
    });
  }

  /// Shows a visual indicator when the user tries to swipe past Bible boundaries.
  void _showBoundaryIndicator(int direction) {
    final message = direction < 0
        ? 'Inicio de la Biblia — Génesis 1'
        : 'Fin de la Biblia — Apocalipsis 22';

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  /// Determines the total page count based on boundary conditions.
  int get _pageCount {
    final adjacent = _adjacentChapters;
    if (adjacent == null) return 3; // Default: assume both sides available.

    int count = 1; // Current page always exists.
    if (!adjacent.isAtStart) count++; // Has previous.
    if (!adjacent.isAtEnd) count++; // Has next.
    return count;
  }

  /// Determines the initial page index based on boundary conditions.
  int get _initialPageForBoundary {
    final adjacent = _adjacentChapters;
    if (adjacent == null) return _currentPageIndex;
    if (adjacent.isAtStart) return 0; // No previous, current is at 0.
    return 1; // Normal case: previous at 0, current at 1.
  }

  @override
  Widget build(BuildContext context) {
    // Watch adjacent chapters for boundary detection.
    final adjacentAsync = ref.watch(
      adjacentChaptersProvider(
        ChapterParams(bookId: _currentBookId, chapterNum: _currentChapter),
      ),
    );

    // Update adjacent chapters when loaded.
    adjacentAsync.whenData((data) {
      if (_adjacentChapters != data) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() {
              _adjacentChapters = data;
            });
          }
        });
      }
    });

    final bookName =
        BibleConstants.getBookName(_currentBookId) ?? 'Libro $_currentBookId';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '$bookName $_currentChapter',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
      ),
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: _onPageChanged,
        physics: const _BoundaryAwarePageScrollPhysics(),
        itemCount: _pageCount,
        itemBuilder: (context, pageIndex) {
          final offset = pageIndex - _currentPageIndex;
          final params = _resolveChapterForOffset(offset);

          if (params == null) {
            // Boundary placeholder — should not normally be visible.
            return const _BoundaryPlaceholder();
          }

          return _ChapterPage(
            key: ValueKey('${params.bookId}_${params.chapterNum}'),
            bookId: params.bookId,
            chapterNum: params.chapterNum,
          );
        },
      ),
    );
  }
}

/// A single chapter page displaying verses in a virtualized list.
///
/// Uses ListView.builder for efficient rendering — only builds
/// visible verse widgets (max ~3 screens worth in the render tree).
class _ChapterPage extends ConsumerWidget {
  final int bookId;
  final int chapterNum;

  const _ChapterPage({
    super.key,
    required this.bookId,
    required this.chapterNum,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chapterAsync = ref.watch(
      chapterProvider(ChapterParams(bookId: bookId, chapterNum: chapterNum)),
    );

    return chapterAsync.when(
      loading: () => const Center(
        child: CircularProgressIndicator.adaptive(),
      ),
      error: (error, stack) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.error_outline,
                size: 48,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'Error al cargar el capítulo',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
      data: (chapter) => _ChapterContent(chapter: chapter),
    );
  }
}

/// Renders the chapter content with a header and virtualized verse list.
class _ChapterContent extends ConsumerStatefulWidget {
  final Chapter chapter;

  const _ChapterContent({required this.chapter});

  @override
  ConsumerState<_ChapterContent> createState() => _ChapterContentState();
}

class _ChapterContentState extends ConsumerState<_ChapterContent> {
  int? _selectedVerseNumber;

  @override
  Widget build(BuildContext context) {
    final bookName =
        BibleConstants.getBookName(widget.chapter.bookId) ?? 'Libro ${widget.chapter.bookId}';

    // +1 for the chapter header widget at the top.
    final itemCount = widget.chapter.verses.length + 1;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      itemCount: itemCount,
      addAutomaticKeepAlives: false,
      addRepaintBoundaries: true,
      itemBuilder: (context, index) {
        if (index == 0) {
          return _ChapterHeader(
            bookName: bookName,
            chapterNumber: widget.chapter.number,
          );
        }

        final verse = widget.chapter.verses[index - 1];
        final isSelected = _selectedVerseNumber == verse.number;

        // Check favorite status
        final isFavoritedAsync = ref.watch(
          isFavoriteProvider(FavoriteParams(
            bookId: widget.chapter.bookId,
            chapter: widget.chapter.number,
            verse: verse.number,
          )),
        );
        final isFavorited = isFavoritedAsync.valueOrNull ?? false;

        // Check note status
        final noteAsync = ref.watch(
          noteForVerseProvider(NoteVerseParams(
            bookId: widget.chapter.bookId,
            chapter: widget.chapter.number,
            verse: verse.number,
          )),
        );
        final hasNote = noteAsync.valueOrNull != null;

        return VerseTile(
          verse: verse,
          isSelected: isSelected,
          isFavorited: isFavorited,
          hasNote: hasNote,
          onTap: () {
            setState(() {
              _selectedVerseNumber = verse.number;
            });
          },
          onTapOutside: () {
            setState(() {
              _selectedVerseNumber = null;
            });
          },
          onFavorite: () => _toggleFavorite(verse),
          onNote: () => _openNoteEditor(verse),
          onShare: () => _shareVerse(verse),
        );
      },
    );
  }

  /// Toggles the favorite status of the given verse.
  void _toggleFavorite(Verse verse) {
    final useCase = ref.read(toggleFavoriteUseCaseProvider);
    useCase.call(
      widget.chapter.bookId,
      widget.chapter.number,
      verse.number,
      verse.text,
    );
    // Invalidate the provider to refresh the UI.
    ref.invalidate(isFavoriteProvider(FavoriteParams(
      bookId: widget.chapter.bookId,
      chapter: widget.chapter.number,
      verse: verse.number,
    )));
  }

  /// Opens the note editor for the given verse.
  Future<void> _openNoteEditor(Verse verse) async {
    final existingNote = ref.read(
      noteForVerseProvider(NoteVerseParams(
        bookId: widget.chapter.bookId,
        chapter: widget.chapter.number,
        verse: verse.number,
      )),
    );

    final initialText = existingNote.valueOrNull?.text ?? '';

    final updatedText = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => NoteEditorDialog(initialText: initialText),
    );

    if (updatedText != null && mounted) {
      final useCase = ref.read(manageNotesUseCaseProvider);
      await useCase.saveNote(
        bookId: widget.chapter.bookId,
        chapter: widget.chapter.number,
        verse: verse.number,
        text: updatedText,
      );
      // Invalidate to refresh the note indicator.
      ref.invalidate(noteForVerseProvider(NoteVerseParams(
        bookId: widget.chapter.bookId,
        chapter: widget.chapter.number,
        verse: verse.number,
      )));
    }
  }

  /// Opens the ShareStyleSheet for the given verse.
  void _shareVerse(Verse verse) {
    final bookName =
        BibleConstants.getBookName(widget.chapter.bookId) ?? 'Libro ${widget.chapter.bookId}';
    final reference = '$bookName ${widget.chapter.number}:${verse.number}';
    final themeSettings = ref.read(themeProvider);

    ShareStyleSheet.show(
      context,
      verseText: verse.text,
      reference: reference,
      typeface: themeSettings.typeface,
    );
  }
}

/// Chapter header widget displayed at the top of each chapter page.
class _ChapterHeader extends StatelessWidget {
  final String bookName;
  final int chapterNumber;

  const _ChapterHeader({
    required this.bookName,
    required this.chapterNumber,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            bookName,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Capítulo $chapterNumber',
            style: theme.textTheme.titleMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 16),
          Divider(
            thickness: 1,
            color: theme.colorScheme.outlineVariant.withOpacity(0.3),
          ),
        ],
      ),
    );
  }
}

/// Placeholder shown at Bible boundaries (should rarely be visible).
class _BoundaryPlaceholder extends StatelessWidget {
  const _BoundaryPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}

/// Custom scroll physics that provides resistance at Bible boundaries.
///
/// This gives a subtle "bounce back" feel when the user tries to swipe
/// past Genesis 1 or Revelation 22, reinforcing the boundary indicator.
class _BoundaryAwarePageScrollPhysics extends ScrollPhysics {
  const _BoundaryAwarePageScrollPhysics({super.parent});

  @override
  ScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return _BoundaryAwarePageScrollPhysics(
      parent: buildParent(ancestor),
    );
  }

  @override
  SpringDescription get spring => const SpringDescription(
        mass: 80,
        stiffness: 100,
        damping: 1,
      );
}
