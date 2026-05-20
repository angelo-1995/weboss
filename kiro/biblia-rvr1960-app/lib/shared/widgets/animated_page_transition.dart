import 'package:flutter/material.dart';

/// A wrapper widget for smooth page transitions (200-400ms).
///
/// Uses a combination of [FadeTransition] and [SlideTransition] for
/// elegant screen transitions. Animations do NOT block user input
/// during playback (Requirement 11.2).
///
/// This widget can be used as a page wrapper in GoRouter custom transitions
/// or as a standalone animated container for content changes.
class AnimatedPageTransition extends StatefulWidget {
  /// Creates an animated page transition wrapper.
  ///
  /// [child] is the content to animate in.
  /// [duration] defaults to 300ms (within the 200-400ms spec range).
  /// [slideDirection] controls the direction of the slide animation.
  const AnimatedPageTransition({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 300),
    this.slideDirection = SlideDirection.fromRight,
    this.curve = Curves.easeOutCubic,
  });

  /// The content widget to display with animation.
  final Widget child;

  /// Duration of the transition animation (200-400ms per Requirement 11.2).
  final Duration duration;

  /// Direction from which the slide animation enters.
  final SlideDirection slideDirection;

  /// Animation curve for smooth motion.
  final Curve curve;

  @override
  State<AnimatedPageTransition> createState() => _AnimatedPageTransitionState();
}

class _AnimatedPageTransitionState extends State<AnimatedPageTransition>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    _slideAnimation = Tween<Offset>(
      begin: widget.slideDirection.offset,
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // IgnorePointer is NOT used here — animations don't block input
    // per Requirement 11.2.
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

/// Direction from which the slide animation enters.
enum SlideDirection {
  /// Slide in from the right (default for forward navigation).
  fromRight,

  /// Slide in from the left (for back navigation).
  fromLeft,

  /// Slide in from the bottom (for modal-style transitions).
  fromBottom,

  /// Slide in from the top.
  fromTop;

  /// Returns the starting [Offset] for the slide animation.
  Offset get offset {
    switch (this) {
      case SlideDirection.fromRight:
        return const Offset(0.15, 0);
      case SlideDirection.fromLeft:
        return const Offset(-0.15, 0);
      case SlideDirection.fromBottom:
        return const Offset(0, 0.15);
      case SlideDirection.fromTop:
        return const Offset(0, -0.15);
    }
  }
}

// Note: CustomTransitionPage integration removed — the app uses
// NoTransitionPage for tab switches and standard MaterialPageRoute
// for push navigation. The AnimatedPageTransition widget above can
// be used as a wrapper inside any screen that needs entrance animation.
