import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/bible/presentation/screens/initialization_screen.dart';
import 'features/settings/presentation/providers/theme_provider.dart';
import 'main.dart';

/// Provider that tracks whether the Bible database is initialized and ready.
///
/// The initialization screen sets this to `true` once the database is confirmed
/// ready. Navigation to the reader is blocked until this is `true`.
final databaseReadyProvider = StateProvider<bool>((ref) => false);

/// Provider that tracks the initialization state for the app.
///
/// States:
/// - `null`: Not yet checked
/// - `true`: Database is initialized and ready
/// - `false`: Database needs initialization
final initializationStateProvider = FutureProvider<bool>((ref) async {
  final booksBox = ref.read(booksBoxProvider);
  // Database is ready if books_box has exactly 66 entries.
  return booksBox.length == 66;
});

/// Root application widget.
///
/// Uses [ConsumerWidget] to access Riverpod providers for:
/// - GoRouter navigation via [appRouterProvider]
/// - Theme settings via [themeProvider]
/// - Database readiness via [databaseReadyProvider]
///
/// Displays the [InitializationScreen] until the database is ready,
/// then shows the main app with MaterialApp.router.
///
/// Validates: Requirements 1.5, 1.6, 10.3
class BibliaApp extends ConsumerWidget {
  const BibliaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeSettings = ref.watch(themeProvider);
    final themes = AppTheme.fromSettings(themeSettings);
    final isDatabaseReady = ref.watch(databaseReadyProvider);

    // If database is not ready, show initialization screen.
    if (!isDatabaseReady) {
      return MaterialApp(
        title: 'Biblia RVR1960',
        debugShowCheckedModeBanner: false,
        theme: themes.light,
        darkTheme: themes.dark,
        themeMode: themeSettings.mode,
        home: const InitializationScreen(),
      );
    }

    // Database is ready — show the main app with GoRouter.
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Biblia RVR1960',
      debugShowCheckedModeBanner: false,
      theme: themes.light,
      darkTheme: themes.dark,
      themeMode: themeSettings.mode,
      routerConfig: router,
    );
  }
}
