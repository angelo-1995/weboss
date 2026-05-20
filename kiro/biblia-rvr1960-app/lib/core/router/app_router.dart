import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/bible/presentation/screens/book_selector_screen.dart';
import '../../features/bible/presentation/screens/reader_screen.dart';
import '../../features/favorites/presentation/screens/favorites_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/notes/presentation/screens/notes_screen.dart';
import '../../features/search/presentation/screens/search_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import 'routes.dart';

/// Global navigator keys for each bottom navigation branch.
///
/// These allow each branch to maintain its own navigation stack
/// independently, preserving state when switching tabs.
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'home');
final _bibleNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'bible');
final _searchNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'search');
final _settingsNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'settings');

/// Riverpod provider for the GoRouter instance.
///
/// Using a Provider ensures the router is created once and shared
/// across the app via Riverpod's dependency injection.
final appRouterProvider = Provider<GoRouter>((ref) {
  return _createRouter();
});

/// Creates the GoRouter configuration with StatefulShellRoute
/// for bottom navigation and nested routes.
///
/// Bottom navigation has 4 destinations:
/// - Inicio (Home)
/// - Biblia (Bible)
/// - Buscar (Search)
/// - Ajustes (Settings)
///
/// Favorites and Notes are accessible via push routes (not in bottom nav).
///
/// Validates: Requirements 12.3, 11.4
GoRouter _createRouter() {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.home,
    routes: [
      // --- StatefulShellRoute for bottom navigation ---
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return _AppShellScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home
          StatefulShellBranch(
            navigatorKey: _homeNavigatorKey,
            routes: [
              GoRoute(
                path: AppRoutes.home,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: HomeScreen(),
                ),
              ),
            ],
          ),

          // Branch 1: Bible
          StatefulShellBranch(
            navigatorKey: _bibleNavigatorKey,
            routes: [
              GoRoute(
                path: AppRoutes.bible,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: BookSelectorScreen(),
                ),
                routes: [
                  // Nested reader route: /bible/:bookId/:chapter
                  GoRoute(
                    path: ':bookId/:chapter',
                    builder: (context, state) {
                      final bookId = int.parse(
                        state.pathParameters['bookId']!,
                      );
                      final chapter = int.parse(
                        state.pathParameters['chapter']!,
                      );
                      return ReaderScreen(
                        initialBookId: bookId,
                        initialChapter: chapter,
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          // Branch 2: Search
          StatefulShellBranch(
            navigatorKey: _searchNavigatorKey,
            routes: [
              GoRoute(
                path: AppRoutes.search,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: SearchScreen(),
                ),
              ),
            ],
          ),

          // Branch 3: Settings
          StatefulShellBranch(
            navigatorKey: _settingsNavigatorKey,
            routes: [
              GoRoute(
                path: AppRoutes.settings,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: SettingsScreen(),
                ),
              ),
            ],
          ),
        ],
      ),

      // --- Push routes (outside bottom navigation shell) ---

      // Favorites screen
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.favorites,
        builder: (context, state) => const FavoritesScreen(),
      ),

      // Notes screen
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.notes,
        builder: (context, state) => const NotesScreen(),
      ),
    ],
  );
}


/// The app shell scaffold that wraps the bottom navigation bar
/// around the current branch's content.
///
/// Uses Material 3 [NavigationBar] with 4 destinations:
/// - Inicio (home icon)
/// - Biblia (book icon)
/// - Buscar (search icon)
/// - Ajustes (settings icon)
///
/// The [StatefulNavigationShell] preserves each branch's navigation
/// state when switching between tabs.
///
/// Validates: Requirements 11.4
class _AppShellScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const _AppShellScaffold({required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          // Navigate to the selected branch, preserving its state.
          navigationShell.goBranch(
            index,
            // If tapping the already-active destination, go to its
            // initial location (pop to root of that branch).
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.book_outlined),
            selectedIcon: Icon(Icons.book),
            label: 'Biblia',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Buscar',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Ajustes',
          ),
        ],
      ),
    );
  }
}
