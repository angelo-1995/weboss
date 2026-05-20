import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../../../core/router/routes.dart';
import '../../domain/entities/favorite.dart';
import '../providers/favorites_providers.dart';

/// Screen displaying the user's saved favorite verses.
///
/// Features:
/// - Reactive list that updates when favorites change
/// - Sorted by date added (most recent first)
/// - Tap to navigate to the Reader at that verse location
/// - Empty state with instructions on how to add favorites
/// - Loading and error states
///
/// Validates: Requirements 4.4, 4.5, 4.6, 4.8
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Favoritos',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
      ),
      body: favoritesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator.adaptive(),
        ),
        error: (error, stack) => _ErrorState(
          error: error,
          onRetry: () => ref.invalidate(favoritesStreamProvider),
        ),
        data: (favorites) {
          if (favorites.isEmpty) {
            return const _EmptyState();
          }
          return _FavoritesList(favorites: favorites);
        },
      ),
    );
  }
}

/// Displays the list of favorites sorted by date added (most recent first).
class _FavoritesList extends StatelessWidget {
  final List<Favorite> favorites;

  const _FavoritesList({required this.favorites});

  @override
  Widget build(BuildContext context) {
    // Sort by addedAt descending (most recent first).
    final sorted = List<Favorite>.from(favorites)
      ..sort((a, b) => b.addedAt.compareTo(a.addedAt));

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: sorted.length,
      itemBuilder: (context, index) {
        final favorite = sorted[index];
        return _FavoriteTile(favorite: favorite);
      },
    );
  }
}

/// Individual favorite tile showing book name, chapter:verse, and date added.
///
/// Navigates to the Reader on tap.
/// Validates: Requirements 4.6
class _FavoriteTile extends StatelessWidget {
  final Favorite favorite;

  const _FavoriteTile({required this.favorite});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bookName =
        BibleConstants.getBookName(favorite.bookId) ?? 'Libro ${favorite.bookId}';
    final reference = '$bookName ${favorite.chapter}:${favorite.verse}';
    final dateText = _formatDate(favorite.addedAt);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          Icons.favorite,
          color: theme.colorScheme.primary,
          size: 20,
        ),
      ),
      title: Text(
        reference,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        dateText,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurface.withOpacity(0.6),
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: theme.colorScheme.onSurface.withOpacity(0.4),
      ),
      onTap: () => _navigateToReader(context),
    );
  }

  /// Navigates to the Reader screen at the favorite's book and chapter.
  void _navigateToReader(BuildContext context) {
    context.go(AppRoutes.readerPath(favorite.bookId, favorite.chapter));
  }

  /// Formats the date as a human-readable string in Spanish.
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dateOnly = DateTime(date.year, date.month, date.day);
    final difference = today.difference(dateOnly).inDays;

    if (difference == 0) return 'Hoy';
    if (difference == 1) return 'Ayer';
    if (difference < 7) return 'Hace $difference días';

    final months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}

/// Empty state shown when the user has no favorites.
///
/// Displays an icon, a primary message, and instructions on how to add favorites.
/// Validates: Requirements 4.8
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
              Icons.favorite_border,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 24),
            Text(
              'No tienes versículos favoritos',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withOpacity(0.8),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Toca un versículo y presiona el ícono de corazón para agregarlo a favoritos',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Error state with a retry button.
class _ErrorState extends StatelessWidget {
  final Object error;
  final VoidCallback onRetry;

  const _ErrorState({
    required this.error,
    required this.onRetry,
  });

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
              'Error al cargar favoritos',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
