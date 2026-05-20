import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/entities/theme_settings.dart';
import '../providers/theme_provider.dart';

/// Settings screen with theme, font size, and typeface controls.
///
/// All changes apply immediately without a save button.
/// A live preview text sample updates in real-time to reflect
/// the current font size and typeface selection.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(themeProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ajustes'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        children: [
          // --- Theme mode section ---
          _SectionHeader(title: 'Tema'),
          const SizedBox(height: 12),
          _ThemeModeSelector(
            currentMode: settings.mode,
            onChanged: (mode) {
              ref.read(themeProvider.notifier).setThemeMode(mode);
            },
          ),

          const SizedBox(height: 32),

          // --- Font size section ---
          _SectionHeader(title: 'Tamaño de fuente'),
          const SizedBox(height: 12),
          _FontSizeSlider(
            currentSize: settings.fontSize,
            onChanged: (size) {
              ref.read(themeProvider.notifier).setFontSize(size);
            },
          ),

          const SizedBox(height: 32),

          // --- Typeface section ---
          _SectionHeader(title: 'Tipografía'),
          const SizedBox(height: 12),
          _TypefaceSelector(
            currentTypeface: settings.typeface,
            onChanged: (typeface) {
              ref.read(themeProvider.notifier).setTypeface(typeface);
            },
          ),

          const SizedBox(height: 32),

          // --- Live preview ---
          _SectionHeader(title: 'Vista previa'),
          const SizedBox(height: 12),
          _PreviewCard(
            fontSize: settings.fontSize.toDouble(),
            typeface: settings.typeface,
            colorScheme: colorScheme,
          ),
        ],
      ),
    );
  }
}

/// Section header label.
class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.8,
          ),
    );
  }
}

/// Theme mode toggle using SegmentedButton (Material 3).
///
/// Options: Claro (light), Oscuro (dark), Sistema (system).
class _ThemeModeSelector extends StatelessWidget {
  final ThemeMode currentMode;
  final ValueChanged<ThemeMode> onChanged;

  const _ThemeModeSelector({
    required this.currentMode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<ThemeMode>(
      segments: const [
        ButtonSegment<ThemeMode>(
          value: ThemeMode.light,
          label: Text('Claro'),
          icon: Icon(Icons.light_mode_outlined),
        ),
        ButtonSegment<ThemeMode>(
          value: ThemeMode.dark,
          label: Text('Oscuro'),
          icon: Icon(Icons.dark_mode_outlined),
        ),
        ButtonSegment<ThemeMode>(
          value: ThemeMode.system,
          label: Text('Sistema'),
          icon: Icon(Icons.settings_brightness_outlined),
        ),
      ],
      selected: {currentMode},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

/// Font size slider from 14 to 28 in steps of 2.
///
/// Displays the current value and a size indicator.
class _FontSizeSlider extends StatelessWidget {
  final int currentSize;
  final ValueChanged<int> onChanged;

  const _FontSizeSlider({
    required this.currentSize,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'A',
              style: TextStyle(
                fontSize: 14,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              '${currentSize}sp',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colorScheme.primary,
                  ),
            ),
            Text(
              'A',
              style: TextStyle(
                fontSize: 28,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        Slider(
          value: currentSize.toDouble(),
          min: 14,
          max: 28,
          divisions: 7, // (28 - 14) / 2 = 7 steps
          label: '${currentSize}sp',
          onChanged: (value) {
            onChanged(value.round());
          },
        ),
      ],
    );
  }
}

/// Typeface selector using ChoiceChips.
///
/// Shows each typeface name rendered in its own font for preview.
class _TypefaceSelector extends StatelessWidget {
  final AppTypeface currentTypeface;
  final ValueChanged<AppTypeface> onChanged;

  const _TypefaceSelector({
    required this.currentTypeface,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 8,
      children: AppTypeface.values.map((typeface) {
        final isSelected = typeface == currentTypeface;
        return ChoiceChip(
          label: Text(
            _typefaceDisplayName(typeface),
            style: _typefaceTextStyle(typeface).copyWith(
              fontSize: 14,
              color: isSelected
                  ? Theme.of(context).colorScheme.onPrimaryContainer
                  : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          selected: isSelected,
          onSelected: (_) => onChanged(typeface),
          selectedColor:
              Theme.of(context).colorScheme.primaryContainer,
          showCheckmark: false,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        );
      }).toList(),
    );
  }

  String _typefaceDisplayName(AppTypeface typeface) {
    switch (typeface) {
      case AppTypeface.serif:
        return 'Merriweather';
      case AppTypeface.sansSerif:
        return 'Inter';
      case AppTypeface.lora:
        return 'Lora';
    }
  }

  TextStyle _typefaceTextStyle(AppTypeface typeface) {
    switch (typeface) {
      case AppTypeface.serif:
        return GoogleFonts.merriweather();
      case AppTypeface.sansSerif:
        return GoogleFonts.inter();
      case AppTypeface.lora:
        return GoogleFonts.lora();
    }
  }
}

/// Live preview card showing sample Bible text with current settings.
///
/// Updates immediately when font size or typeface changes.
class _PreviewCard extends StatelessWidget {
  final double fontSize;
  final AppTypeface typeface;
  final ColorScheme colorScheme;

  const _PreviewCard({
    required this.fontSize,
    required this.typeface,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Verse number + text
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: '1 ',
                    style: _baseStyle().copyWith(
                      fontSize: fontSize - 4,
                      fontWeight: FontWeight.w700,
                      color: colorScheme.primary,
                    ),
                  ),
                  TextSpan(
                    text: 'En el principio creó Dios los cielos y la tierra.',
                    style: _baseStyle().copyWith(
                      fontSize: fontSize,
                      color: colorScheme.onSurface,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: '2 ',
                    style: _baseStyle().copyWith(
                      fontSize: fontSize - 4,
                      fontWeight: FontWeight.w700,
                      color: colorScheme.primary,
                    ),
                  ),
                  TextSpan(
                    text:
                        'Y la tierra estaba desordenada y vacía, y las tinieblas '
                        'estaban sobre la faz del abismo.',
                    style: _baseStyle().copyWith(
                      fontSize: fontSize,
                      color: colorScheme.onSurface,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Reference
            Text(
              'Génesis 1:1-2',
              style: _baseStyle().copyWith(
                fontSize: fontSize - 2,
                fontWeight: FontWeight.w500,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  TextStyle _baseStyle() {
    switch (typeface) {
      case AppTypeface.serif:
        return GoogleFonts.merriweather();
      case AppTypeface.sansSerif:
        return GoogleFonts.inter();
      case AppTypeface.lora:
        return GoogleFonts.lora();
    }
  }
}
