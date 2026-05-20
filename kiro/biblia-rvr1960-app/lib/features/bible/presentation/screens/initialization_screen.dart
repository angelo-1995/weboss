import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app.dart';
import '../../../../core/error/app_error.dart';
import '../../../../main.dart';
import '../../data/datasources/bible_init_service.dart';

/// Tracks the initialization progress state.
///
/// States:
/// - [InitState.loading]: Initialization is in progress
/// - [InitState.success]: Initialization completed successfully
/// - [InitState.error]: Initialization failed with an error message
enum InitStatus { loading, success, error }

/// Immutable state for the initialization process.
class InitState {
  final InitStatus status;
  final String message;
  final String? errorDetail;

  const InitState({
    required this.status,
    required this.message,
    this.errorDetail,
  });

  const InitState.loading([String message = 'Preparando la Biblia...'])
      : status = InitStatus.loading,
        message = message,
        errorDetail = null;

  const InitState.success()
      : status = InitStatus.success,
        message = '¡Listo!',
        errorDetail = null;

  const InitState.error(String error)
      : status = InitStatus.error,
        message = 'Error de inicialización',
        errorDetail = error;
}

/// Provider that manages the database initialization process.
///
/// Checks if the database is already initialized (books_box has 66 entries).
/// If not, runs [BibleInitService] to load and parse the bundled Bible data.
///
/// Validates: Requirements 1.5, 1.6
final initializationProvider =
    StateNotifierProvider<InitializationNotifier, InitState>((ref) {
  return InitializationNotifier(ref);
});

/// Notifier that drives the initialization flow.
class InitializationNotifier extends StateNotifier<InitState> {
  final Ref _ref;

  InitializationNotifier(this._ref) : super(const InitState.loading()) {
    _initialize();
  }

  /// Runs the initialization check and process.
  Future<void> _initialize() async {
    state = const InitState.loading('Verificando base de datos...');

    try {
      final booksBox = _ref.read(booksBoxProvider);

      // Check if already initialized (66 books present).
      if (booksBox.length == 66) {
        state = const InitState.success();
        _ref.read(databaseReadyProvider.notifier).state = true;
        return;
      }

      // Not initialized — run the initialization service.
      state = const InitState.loading('Cargando la Biblia RVR1960...');

      final chaptersBox = _ref.read(chaptersBoxProvider);
      final searchIndexBox = _ref.read(searchIndexBoxProvider);

      final initService = BibleInitService();
      final result = await initService.initialize(
        booksBox: booksBox,
        chaptersBox: chaptersBox,
        searchIndexBox: searchIndexBox,
      );

      switch (result) {
        case Success():
          state = const InitState.success();
          _ref.read(databaseReadyProvider.notifier).state = true;
        case Failure(error: final error):
          state = InitState.error(error.message);
      }
    } catch (e) {
      state = InitState.error(
        'Error inesperado durante la inicialización: $e',
      );
    }
  }

  /// Retries the initialization process after a failure.
  Future<void> retry() async {
    await _initialize();
  }
}

/// Screen displayed during first-time database initialization.
///
/// Shows:
/// - App logo/name and a progress indicator while loading
/// - Full-screen error with retry button if initialization fails
/// - Automatically transitions to the main app when initialization completes
///
/// Validates: Requirements 1.5, 1.6, 10.3
class InitializationScreen extends ConsumerWidget {
  const InitializationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initState = ref.watch(initializationProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App icon
                Icon(
                  Icons.menu_book_rounded,
                  size: 80,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(height: 24),

                // App name
                Text(
                  'Biblia RVR1960',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  'Reina Valera 1960',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 48),

                // State-dependent content
                _buildStateContent(context, ref, initState),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStateContent(
    BuildContext context,
    WidgetRef ref,
    InitState initState,
  ) {
    final theme = Theme.of(context);

    switch (initState.status) {
      case InitStatus.loading:
        return Column(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            Text(
              initState.message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        );

      case InitStatus.success:
        return Column(
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 48,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              initState.message,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        );

      case InitStatus.error:
        return Column(
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              initState.message,
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            if (initState.errorDetail != null)
              Text(
                initState.errorDetail!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                ref.read(initializationProvider.notifier).retry();
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        );
    }
  }
}
