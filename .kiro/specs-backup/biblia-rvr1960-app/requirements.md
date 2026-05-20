# Requirements Document

## Introduction

This document defines the requirements for the Biblia RVR1960 App — a premium, offline-first Android mobile application built with Flutter for reading the Reina Valera 1960 Bible. The app targets modern users who expect a fast, elegant, and minimalist reading experience comparable to Spotify, Kindle, or Notion. The MVP includes Bible reading with navigation, ultra-fast search, favorites, notes, verse of the day, theming, and social sharing as image.

## Glossary

- **App**: The Biblia RVR1960 Android mobile application built with Flutter
- **Reader**: The Bible text display component responsible for rendering verses with fluid scrolling
- **Navigator**: The component responsible for book, chapter, and verse selection and navigation
- **Search_Engine**: The local full-text search component that indexes and queries Bible text offline
- **Favorites_Manager**: The component responsible for persisting and retrieving user-saved verses
- **Notes_Manager**: The component responsible for creating, editing, deleting, and persisting user notes per verse
- **Theme_Engine**: The component responsible for managing dark/light mode, font size, and typeface preferences
- **Image_Generator**: The component responsible for rendering verse text into shareable image formats
- **Home_Screen**: The main landing screen displaying verse of the day, continue reading, and quick access shortcuts
- **Bible_Database**: The local Hive database storing the complete RVR1960 Bible text optimized for lazy loading
- **User_Preferences**: The local persistent storage for user settings including theme, font, and reading position
- **Verse**: A single numbered verse within a chapter of a book of the Bible
- **Chapter**: A numbered division within a book containing one or more verses
- **Book**: One of the 66 books of the RVR1960 Bible (39 Old Testament + 27 New Testament)

## Requirements

### Requirement 1: Offline Bible Data Storage

**User Story:** As a reader, I want the complete RVR1960 Bible available offline, so that I can read scripture without an internet connection.

#### Acceptance Criteria

1. THE Bible_Database SHALL store all 66 books, 1,189 chapters, and 31,102 verses of the RVR1960 Bible locally on the device
2. WHEN the Reader requests a chapter, THE Bible_Database SHALL load only that chapter's verses into memory, keeping peak memory usage for Bible text below 2 MB
3. WHEN the App is launched without internet connectivity, THE Reader SHALL provide navigation between books and chapters, full-text verse display, and search across all stored verses without degradation
4. THE Bible_Database SHALL occupy no more than 15 MB of device storage for the complete RVR1960 text and search index
5. WHEN the App is installed for the first time, THE Bible_Database SHALL initialize the complete RVR1960 dataset from bundled assets within 5 seconds on a device with at least 3 GB RAM and a quad-core processor
6. IF the Bible_Database initialization fails due to insufficient storage or corrupted bundled assets, THEN THE App SHALL display an error message indicating the failure reason and prevent navigation to the reader until initialization completes successfully
7. WHEN the Bible_Database initialization completes, THE App SHALL verify that exactly 31,102 verses across 1,189 chapters and 66 books are accessible before marking the database as ready

### Requirement 2: Bible Reading and Navigation

**User Story:** As a reader, I want to navigate the Bible by book, chapter, and verse with fluid scrolling, so that I can read scripture comfortably and efficiently.

#### Acceptance Criteria

1. THE Navigator SHALL present all 66 books organized by Old Testament (39 books) and New Testament (27 books) categories
2. WHEN a book is selected, THE Navigator SHALL display all chapters available for that book as a grid or list
3. WHEN a chapter is selected, THE Reader SHALL display all verses of that chapter with vertical scrolling at a consistent 60 frames per second
4. WHEN a chapter is selected, THE Reader SHALL render and display the chapter text within 100 milliseconds
5. WHEN the user swipes left or right on the Reader, THE Navigator SHALL transition to the next or previous chapter respectively with a smooth animation
6. IF the user swipes right on the first chapter of a book, THEN THE Navigator SHALL transition to the last chapter of the previous book; IF the user swipes left on the last chapter of a book, THEN THE Navigator SHALL transition to the first chapter of the next book
7. IF the user is on Genesis chapter 1 and swipes right, OR on Revelation's last chapter and swipes left, THEN THE Navigator SHALL not transition and SHALL provide a visual boundary indicator
8. WHEN the user navigates away from the Reader or the App is backgrounded, THE Reader SHALL persist the current reading position (book, chapter, scroll offset) to User_Preferences
9. WHEN the App is reopened, THE Reader SHALL restore the last reading position automatically; IF no reading position exists, THEN THE Reader SHALL open at Genesis chapter 1
10. THE Navigator SHALL provide a quick chapter selector overlay allowing direct jump to any chapter within the current book
11. WHEN the user taps a verse number, THE Reader SHALL highlight that verse and display contextual actions (favorite, note, share); WHEN the user taps outside the highlighted verse or selects an action, THE highlight SHALL be dismissed

### Requirement 3: Ultra-Fast Local Search

**User Story:** As a reader, I want to search the Bible by words or phrases instantly, so that I can find specific passages without delay.

#### Acceptance Criteria

1. WHEN the user types a search query of 3 or more characters, THE Search_Engine SHALL return matching results within 200 milliseconds
2. IF the user types a search query of fewer than 3 characters, THEN THE Search_Engine SHALL not execute a search and SHALL display a message indicating the minimum query length requirement
3. THE Search_Engine SHALL search across all 31,102 verses of the RVR1960 text
4. THE Search_Engine SHALL highlight the matching terms within each result
5. THE Search_Engine SHALL display results grouped by book in canonical Bible book order, showing the verse reference and up to 40 characters of surrounding context on each side of the matched term
6. THE Search_Engine SHALL display a maximum of 100 results per search query, with a count of total matches found
7. WHEN a search result is tapped, THE Navigator SHALL open the Reader at the corresponding verse location
8. THE Search_Engine SHALL support accent-insensitive search (e.g., "Jesus" matches "Jesús")
9. THE Search_Engine SHALL support partial word matching for queries of 4 or more characters
10. IF the search query returns zero results, THEN THE Search_Engine SHALL display an empty state message indicating no matches were found and suggesting the user check spelling or try fewer words
11. THE Search_Engine SHALL accept search queries with a maximum length of 100 characters

### Requirement 4: Favorites Management

**User Story:** As a reader, I want to save and manage my favorite verses, so that I can quickly access meaningful passages later.

#### Acceptance Criteria

1. WHEN the user marks a verse as favorite, THE Favorites_Manager SHALL persist the verse reference (book, chapter, verse number) and the current timestamp to local storage within 1 second of the user action
2. WHEN the user removes a verse from favorites, THE Favorites_Manager SHALL delete the verse reference from local storage within 1 second of the user action
3. IF the user marks a verse that is already in favorites, THEN THE Favorites_Manager SHALL remove it from favorites (toggle behavior)
4. THE Favorites_Manager SHALL display all saved favorites in a dedicated list view sorted by the date added (most recent first), supporting a maximum of 1,000 stored favorites
5. THE Reader SHALL display a distinct visual indicator (a filled icon differentiable from the unfilled default state) on verses that are currently marked as favorites
6. WHEN the user taps a favorite in the list view, THE Navigator SHALL open the Reader at that verse location
7. THE Favorites_Manager SHALL persist favorites data across app restarts, retaining all entries unless explicitly removed by the user
8. IF the favorites list is empty, THEN THE Favorites_Manager SHALL display an empty state message that includes instructions on how to add favorites
9. IF local storage is unavailable or the write operation fails, THEN THE Favorites_Manager SHALL display an error message indicating the favorite could not be saved and SHALL preserve the previous favorites state

### Requirement 5: Verse Notes

**User Story:** As a reader, I want to create and edit personal notes on specific verses, so that I can record my reflections and insights.

#### Acceptance Criteria

1. WHEN the user creates a note on a verse, THE Notes_Manager SHALL persist the note text associated with the verse reference (book, chapter, verse number) to local storage
2. WHEN the user edits an existing note, THE Notes_Manager SHALL update the persisted note text within 1 second of the user confirming the edit
3. WHEN the user deletes a note, THE Notes_Manager SHALL remove the note from local storage within 1 second of the user confirming the deletion
4. WHILE a verse has an associated note, THE Reader SHALL display a visual indicator on that verse
5. THE Notes_Manager SHALL display all notes in a dedicated list view sorted by last modified date (most recent first)
6. WHEN the user taps a note in the list view, THE Navigator SHALL open the Reader at the associated verse location
7. THE Notes_Manager SHALL support note text of at least 1 character and up to 2,000 characters per verse
8. IF the user attempts to save a note that is empty or exceeds 2,000 characters, THEN THE Notes_Manager SHALL prevent the save and display an error message indicating the character limit constraint
9. THE Notes_Manager SHALL persist notes data across app restarts without data loss
10. WHEN the user requests to delete a note, THE Notes_Manager SHALL prompt for confirmation before removing the note

### Requirement 6: Verse of the Day

**User Story:** As a reader, I want to see an inspiring verse each day on the home screen, so that I can start my day with scripture.

#### Acceptance Criteria

1. WHEN the app launches, THE Home_Screen SHALL display the verse of the day as the first content element visible without scrolling
2. THE App SHALL select a different verse of the day every 24 hours based on a deterministic algorithm using the current date (device local date, resetting at midnight 00:00 local time) as seed, cycling through a pre-bundled pool of at least 365 verses before repeating
3. THE App SHALL select the verse of the day without requiring internet connectivity by using a locally stored verse pool bundled with the app
4. WHEN the user taps the verse of the day, THE Navigator SHALL open the Reader at that verse location
5. THE Home_Screen SHALL display the full verse text (up to 500 characters), book name, chapter number, and verse number for the verse of the day
6. WHEN the user activates the share action for the verse of the day, THE App SHALL invoke the device share sheet with the verse text, reference (book name, chapter, and verse number), and app attribution
7. IF the verse text exceeds 500 characters, THEN THE Home_Screen SHALL truncate the displayed text with an ellipsis indicator while the share action and navigation still use the full verse text

### Requirement 7: Theme and Typography Settings

**User Story:** As a reader, I want to customize the app appearance with dark/light themes and font settings, so that I can read comfortably in any environment.

#### Acceptance Criteria

1. THE Theme_Engine SHALL provide a light theme and a dark theme compliant with Material 3 design guidelines
2. WHEN the user switches between themes, THE Theme_Engine SHALL apply the new theme to all screens within 100 milliseconds without app restart
3. WHEN the user selects a theme, THE Theme_Engine SHALL persist the selection in User_Preferences and restore the selected theme on the next app launch
4. THE Theme_Engine SHALL provide font size adjustment with a minimum of 14sp, maximum of 28sp, and increments of 2sp
5. THE Theme_Engine SHALL provide at least 3 typeface options: one serif, one sans-serif, and one additional font, each supporting the full range of font sizes defined in criterion 4
6. WHEN the user changes font size or typeface, THE Reader SHALL apply the change to all displayed text within 200 milliseconds without requiring navigation away from the current screen
7. WHEN the user selects a font size or typeface, THE Theme_Engine SHALL persist the selection in User_Preferences and restore the selected font size and typeface on the next app launch
8. IF the system theme preference is available on first launch, THEN THE Theme_Engine SHALL default to the system theme preference (dark or light)
9. IF the system theme preference is unavailable or User_Preferences data is unreadable on app launch, THEN THE Theme_Engine SHALL default to the light theme with 16sp font size and the sans-serif typeface

### Requirement 8: Share Verse as Image

**User Story:** As a reader, I want to generate elegant images of verses for sharing on social media, so that I can share scripture with others in a visually appealing format.

#### Acceptance Criteria

1. WHEN the user selects the share action on a verse, THE Image_Generator SHALL render the verse text, reference, and a decorative background into a PNG image
2. THE Image_Generator SHALL produce images at a resolution of 1080x1080 pixels in PNG format with 72 DPI
3. THE Image_Generator SHALL provide at least 3 background style options (minimalist, gradient, and textured)
4. THE Image_Generator SHALL apply the current app typeface to the verse text in the generated image
5. WHEN the image is generated, THE App SHALL invoke the Android system share sheet allowing the user to share via any installed application
6. THE Image_Generator SHALL render the complete image within 2 seconds on a device with 4 GB RAM and a quad-core processor clocked at 2.0 GHz or above
7. THE Image_Generator SHALL include the text "RVR1960" as a watermark positioned in the bottom-right corner at 30% opacity
8. IF the verse text exceeds 300 characters, THEN THE Image_Generator SHALL reduce the font size proportionally to fit all text within the image boundaries without truncation
9. IF image generation fails, THEN THE App SHALL display an error message indicating the image could not be created and SHALL not invoke the share sheet

### Requirement 9: Home Screen

**User Story:** As a reader, I want a home screen with quick access to key features, so that I can efficiently navigate the app and resume my reading.

#### Acceptance Criteria

1. THE Home_Screen SHALL display the verse of the day section at the top of the screen, refreshed once per calendar day
2. THE Home_Screen SHALL display a "continue reading" card showing the last read book, chapter, and verse
3. WHEN the user taps the continue reading card, THE Navigator SHALL open the Reader at the last reading position
4. THE Home_Screen SHALL display tappable shortcut elements for Search, Favorites, and Notes features that navigate to their respective screens when tapped
5. WHEN the user navigates to the Home_Screen, THE Home_Screen SHALL load and display all content within 500 milliseconds
6. IF no reading history exists, THEN THE Home_Screen SHALL display a welcome message with a tappable prompt that navigates the user to Genesis chapter 1 verse 1 in the Reader when tapped
7. IF the verse of the day content is unavailable, THEN THE Home_Screen SHALL display a placeholder message indicating the verse could not be loaded and SHALL render the remaining screen sections normally

### Requirement 10: Performance and Resource Optimization

**User Story:** As a user with a mid-range Android device, I want the app to be fast and battery-efficient, so that I can use it without draining my device resources.

#### Acceptance Criteria

1. WHILE the user is scrolling in the Reader, THE App SHALL maintain a frame rate of at least 55 frames per second with a target of 60 frames per second
2. WHILE the user is performing normal Bible reading (navigating chapters, scrolling, viewing verses), THE App SHALL consume no more than 80 MB of RAM
3. WHEN the App is launched from a cold start, THE Home_Screen SHALL be fully rendered and interactive within 3 seconds on a device with 3 GB RAM and a quad-core processor
4. WHEN the Reader displays a chapter, THE App SHALL load only the active chapter's data and pre-fetch the immediately adjacent chapters (previous and next)
5. THE Reader SHALL implement virtualized list rendering, keeping no more than 3 screens worth of verse widgets in the render tree at any time
6. WHILE the App is in the foreground, THE App SHALL not schedule background tasks, timers, or periodic operations unrelated to the current user interaction

### Requirement 11: Modern UI and Visual Design

**User Story:** As a user, I want a premium and modern visual experience, so that the app feels elegant and enjoyable to use.

#### Acceptance Criteria

1. THE App SHALL implement Material 3 design system with custom color schemes defining at minimum primary, secondary, tertiary, surface, error, and on-surface color tokens for both light and dark themes
2. THE App SHALL use smooth animations with duration between 200ms and 400ms for screen transitions and UI interactions, and animations SHALL NOT block user input during playback
3. THE App SHALL use consistent spacing of 8dp grid system, soft border radius (12dp-16dp), and elevation shadows between 1dp and 4dp for card and surface components
4. THE App SHALL provide a bottom navigation bar with 4 primary destinations: Home, Bible, Search, and Settings
5. THE App SHALL use a typography hierarchy with at minimum 4 distinct styles (headings, body text, verse numbers, and captions) where each style differs from adjacent levels by at least 2dp in font size or a different font weight
6. WHEN content requires asynchronous loading that exceeds 300ms, THE App SHALL display skeleton loading placeholders matching the expected content layout until the content is fully loaded or an error state is shown

### Requirement 12: Architecture and Scalability

**User Story:** As a developer, I want a clean and scalable architecture, so that the codebase supports future features and integrations.

#### Acceptance Criteria

1. THE App SHALL implement Clean Architecture with separate data/, domain/, and presentation/ sub-directories per feature module, where presentation/ shall not import directly from data/ and data/ shall not import from presentation/
2. THE App SHALL use Riverpod for state management across all features, with no other state management libraries present in the dependency tree
3. THE App SHALL use GoRouter for declarative navigation where every route is defined using TypedGoRoute code generation with typed path parameters
4. THE App SHALL use Hive for all local data persistence operations, with no other local storage libraries used for application data
5. THE App SHALL use freezed and json_serializable for all domain entities and data transfer objects (DTOs) to ensure immutability and type-safe serialization
6. THE App SHALL organize code in a feature-based directory structure under lib/features/ with shared code under lib/core/ and lib/shared/, where each feature directory contains data/, domain/, and presentation/ sub-directories
7. THE App SHALL define abstract repository interfaces in the domain layer with concrete implementations in the data layer, where domain/ contains no imports from data/ or any external package other than core Dart libraries
8. THE App SHALL define abstract service interfaces in lib/core/services/ for authentication, push notifications, analytics, and remote configuration, such that adding a Firebase implementation requires only new files in data/ layers and dependency injection configuration without modifying any existing files under lib/features/
9. IF a new feature module is added, THEN THE App SHALL require no modifications to existing feature modules, with cross-feature communication occurring exclusively through shared interfaces defined in lib/core/ or lib/shared/
