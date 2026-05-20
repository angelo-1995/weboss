/// Data source providing a pre-bundled pool of curated verse references
/// for the Verse of the Day feature.
///
/// Contains at least 365 carefully selected verse references covering
/// a good mix of Old Testament and New Testament books including
/// Psalms, Proverbs, Prophets, Gospels, and Epistles.
class VotdDatasource {
  VotdDatasource._();

  /// A curated pool of verse references for the Verse of the Day.
  ///
  /// Each entry is a record of (bookId, chapter, verse).
  /// The pool contains 366 entries to ensure no repeats within a 365-day cycle.
  static const List<({int bookId, int chapter, int verse})> versePool = [
    // --- Well-known verses ---
    (bookId: 43, chapter: 3, verse: 16),   // Juan 3:16
    (bookId: 19, chapter: 23, verse: 1),   // Salmos 23:1
    (bookId: 45, chapter: 8, verse: 28),   // Romanos 8:28
    (bookId: 24, chapter: 29, verse: 11),  // Jeremías 29:11
    (bookId: 50, chapter: 4, verse: 13),   // Filipenses 4:13
    (bookId: 20, chapter: 3, verse: 5),    // Proverbios 3:5
    (bookId: 23, chapter: 40, verse: 31),  // Isaías 40:31
    (bookId: 45, chapter: 12, verse: 2),   // Romanos 12:2
    (bookId: 19, chapter: 46, verse: 1),   // Salmos 46:1
    (bookId: 58, chapter: 11, verse: 1),   // Hebreos 11:1

    // --- Psalms (bookId: 19) ---
    (bookId: 19, chapter: 1, verse: 1),
    (bookId: 19, chapter: 4, verse: 8),
    (bookId: 19, chapter: 5, verse: 3),
    (bookId: 19, chapter: 8, verse: 1),
    (bookId: 19, chapter: 9, verse: 1),
    (bookId: 19, chapter: 16, verse: 8),
    (bookId: 19, chapter: 18, verse: 2),
    (bookId: 19, chapter: 19, verse: 1),
    (bookId: 19, chapter: 19, verse: 14),
    (bookId: 19, chapter: 23, verse: 4),
    (bookId: 19, chapter: 24, verse: 1),
    (bookId: 19, chapter: 25, verse: 4),
    (bookId: 19, chapter: 27, verse: 1),
    (bookId: 19, chapter: 27, verse: 4),
    (bookId: 19, chapter: 28, verse: 7),
    (bookId: 19, chapter: 29, verse: 11),
    (bookId: 19, chapter: 30, verse: 5),
    (bookId: 19, chapter: 31, verse: 24),
    (bookId: 19, chapter: 32, verse: 8),
    (bookId: 19, chapter: 33, verse: 4),
    (bookId: 19, chapter: 34, verse: 1),
    (bookId: 19, chapter: 34, verse: 8),
    (bookId: 19, chapter: 34, verse: 18),
    (bookId: 19, chapter: 37, verse: 4),
    (bookId: 19, chapter: 37, verse: 5),
    (bookId: 19, chapter: 40, verse: 1),
    (bookId: 19, chapter: 42, verse: 1),
    (bookId: 19, chapter: 46, verse: 10),
    (bookId: 19, chapter: 51, verse: 10),
    (bookId: 19, chapter: 55, verse: 22),
    (bookId: 19, chapter: 56, verse: 3),
    (bookId: 19, chapter: 62, verse: 1),
    (bookId: 19, chapter: 63, verse: 1),
    (bookId: 19, chapter: 66, verse: 1),
    (bookId: 19, chapter: 68, verse: 19),
    (bookId: 19, chapter: 73, verse: 26),
    (bookId: 19, chapter: 84, verse: 11),
    (bookId: 19, chapter: 86, verse: 5),
    (bookId: 19, chapter: 90, verse: 12),
    (bookId: 19, chapter: 91, verse: 1),
    (bookId: 19, chapter: 91, verse: 2),
    (bookId: 19, chapter: 91, verse: 11),
    (bookId: 19, chapter: 95, verse: 1),
    (bookId: 19, chapter: 100, verse: 4),
    (bookId: 19, chapter: 103, verse: 1),
    (bookId: 19, chapter: 103, verse: 12),
    (bookId: 19, chapter: 107, verse: 1),
    (bookId: 19, chapter: 118, verse: 24),
    (bookId: 19, chapter: 119, verse: 105),
    (bookId: 19, chapter: 119, verse: 11),
    (bookId: 19, chapter: 121, verse: 1),
    (bookId: 19, chapter: 121, verse: 2),
    (bookId: 19, chapter: 127, verse: 1),
    (bookId: 19, chapter: 133, verse: 1),
    (bookId: 19, chapter: 136, verse: 1),
    (bookId: 19, chapter: 138, verse: 3),
    (bookId: 19, chapter: 139, verse: 14),
    (bookId: 19, chapter: 143, verse: 8),
    (bookId: 19, chapter: 145, verse: 18),
    (bookId: 19, chapter: 147, verse: 3),
    (bookId: 19, chapter: 150, verse: 6),

    // --- Proverbs (bookId: 20) ---
    (bookId: 20, chapter: 1, verse: 7),
    (bookId: 20, chapter: 2, verse: 6),
    (bookId: 20, chapter: 3, verse: 6),
    (bookId: 20, chapter: 3, verse: 9),
    (bookId: 20, chapter: 4, verse: 23),
    (bookId: 20, chapter: 10, verse: 22),
    (bookId: 20, chapter: 11, verse: 2),
    (bookId: 20, chapter: 12, verse: 25),
    (bookId: 20, chapter: 13, verse: 20),
    (bookId: 20, chapter: 14, verse: 26),
    (bookId: 20, chapter: 15, verse: 1),
    (bookId: 20, chapter: 15, verse: 13),
    (bookId: 20, chapter: 16, verse: 3),
    (bookId: 20, chapter: 16, verse: 9),
    (bookId: 20, chapter: 17, verse: 17),
    (bookId: 20, chapter: 18, verse: 10),
    (bookId: 20, chapter: 18, verse: 24),
    (bookId: 20, chapter: 19, verse: 21),
    (bookId: 20, chapter: 22, verse: 6),
    (bookId: 20, chapter: 27, verse: 17),
    (bookId: 20, chapter: 28, verse: 1),
    (bookId: 20, chapter: 29, verse: 25),
    (bookId: 20, chapter: 31, verse: 30),

    // --- Isaiah (bookId: 23) ---
    (bookId: 23, chapter: 9, verse: 6),
    (bookId: 23, chapter: 12, verse: 2),
    (bookId: 23, chapter: 26, verse: 3),
    (bookId: 23, chapter: 30, verse: 15),
    (bookId: 23, chapter: 40, verse: 29),
    (bookId: 23, chapter: 41, verse: 10),
    (bookId: 23, chapter: 41, verse: 13),
    (bookId: 23, chapter: 43, verse: 2),
    (bookId: 23, chapter: 43, verse: 19),
    (bookId: 23, chapter: 46, verse: 4),
    (bookId: 23, chapter: 49, verse: 16),
    (bookId: 23, chapter: 53, verse: 5),
    (bookId: 23, chapter: 54, verse: 10),
    (bookId: 23, chapter: 55, verse: 8),
    (bookId: 23, chapter: 55, verse: 11),
    (bookId: 23, chapter: 58, verse: 11),
    (bookId: 23, chapter: 61, verse: 1),
    (bookId: 23, chapter: 64, verse: 4),

    // --- Jeremiah (bookId: 24) ---
    (bookId: 24, chapter: 1, verse: 5),
    (bookId: 24, chapter: 17, verse: 7),
    (bookId: 24, chapter: 29, verse: 13),
    (bookId: 24, chapter: 31, verse: 3),
    (bookId: 24, chapter: 33, verse: 3),

    // --- Genesis (bookId: 1) ---
    (bookId: 1, chapter: 1, verse: 1),
    (bookId: 1, chapter: 1, verse: 27),
    (bookId: 1, chapter: 12, verse: 2),
    (bookId: 1, chapter: 28, verse: 15),
    (bookId: 1, chapter: 50, verse: 20),

    // --- Exodus (bookId: 2) ---
    (bookId: 2, chapter: 14, verse: 14),
    (bookId: 2, chapter: 15, verse: 2),
    (bookId: 2, chapter: 33, verse: 14),

    // --- Deuteronomy (bookId: 5) ---
    (bookId: 5, chapter: 6, verse: 5),
    (bookId: 5, chapter: 31, verse: 6),
    (bookId: 5, chapter: 31, verse: 8),

    // --- Joshua (bookId: 6) ---
    (bookId: 6, chapter: 1, verse: 8),
    (bookId: 6, chapter: 1, verse: 9),

    // --- 1 Samuel (bookId: 9) ---
    (bookId: 9, chapter: 16, verse: 7),

    // --- 2 Chronicles (bookId: 14) ---
    (bookId: 14, chapter: 7, verse: 14),

    // --- Nehemiah (bookId: 16) ---
    (bookId: 16, chapter: 8, verse: 10),

    // --- Job (bookId: 18) ---
    (bookId: 18, chapter: 19, verse: 25),
    (bookId: 18, chapter: 42, verse: 2),

    // --- Ecclesiastes (bookId: 21) ---
    (bookId: 21, chapter: 3, verse: 1),
    (bookId: 21, chapter: 3, verse: 11),

    // --- Lamentations (bookId: 25) ---
    (bookId: 25, chapter: 3, verse: 22),
    (bookId: 25, chapter: 3, verse: 23),

    // --- Daniel (bookId: 27) ---
    (bookId: 27, chapter: 3, verse: 17),

    // --- Hosea (bookId: 28) ---
    (bookId: 28, chapter: 6, verse: 3),

    // --- Joel (bookId: 29) ---
    (bookId: 29, chapter: 2, verse: 28),

    // --- Micah (bookId: 33) ---
    (bookId: 33, chapter: 6, verse: 8),
    (bookId: 33, chapter: 7, verse: 18),

    // --- Habakkuk (bookId: 35) ---
    (bookId: 35, chapter: 2, verse: 3),
    (bookId: 35, chapter: 3, verse: 19),

    // --- Zephaniah (bookId: 36) ---
    (bookId: 36, chapter: 3, verse: 17),

    // --- Zechariah (bookId: 38) ---
    (bookId: 38, chapter: 4, verse: 6),

    // --- Malachi (bookId: 39) ---
    (bookId: 39, chapter: 3, verse: 10),

    // --- Matthew (bookId: 40) ---
    (bookId: 40, chapter: 5, verse: 14),
    (bookId: 40, chapter: 5, verse: 16),
    (bookId: 40, chapter: 6, verse: 33),
    (bookId: 40, chapter: 6, verse: 34),
    (bookId: 40, chapter: 7, verse: 7),
    (bookId: 40, chapter: 7, verse: 12),
    (bookId: 40, chapter: 11, verse: 28),
    (bookId: 40, chapter: 11, verse: 29),
    (bookId: 40, chapter: 17, verse: 20),
    (bookId: 40, chapter: 19, verse: 26),
    (bookId: 40, chapter: 22, verse: 37),
    (bookId: 40, chapter: 28, verse: 19),
    (bookId: 40, chapter: 28, verse: 20),

    // --- Mark (bookId: 41) ---
    (bookId: 41, chapter: 9, verse: 23),
    (bookId: 41, chapter: 10, verse: 27),
    (bookId: 41, chapter: 11, verse: 24),
    (bookId: 41, chapter: 16, verse: 15),

    // --- Luke (bookId: 42) ---
    (bookId: 42, chapter: 1, verse: 37),
    (bookId: 42, chapter: 6, verse: 31),
    (bookId: 42, chapter: 6, verse: 38),
    (bookId: 42, chapter: 11, verse: 9),
    (bookId: 42, chapter: 12, verse: 32),

    // --- John (bookId: 43) ---
    (bookId: 43, chapter: 1, verse: 1),
    (bookId: 43, chapter: 1, verse: 12),
    (bookId: 43, chapter: 3, verse: 17),
    (bookId: 43, chapter: 8, verse: 32),
    (bookId: 43, chapter: 10, verse: 10),
    (bookId: 43, chapter: 11, verse: 25),
    (bookId: 43, chapter: 13, verse: 34),
    (bookId: 43, chapter: 14, verse: 6),
    (bookId: 43, chapter: 14, verse: 27),
    (bookId: 43, chapter: 15, verse: 5),
    (bookId: 43, chapter: 15, verse: 13),
    (bookId: 43, chapter: 16, verse: 33),

    // --- Acts (bookId: 44) ---
    (bookId: 44, chapter: 1, verse: 8),
    (bookId: 44, chapter: 2, verse: 38),
    (bookId: 44, chapter: 4, verse: 12),
    (bookId: 44, chapter: 16, verse: 31),
    (bookId: 44, chapter: 20, verse: 35),

    // --- Romans (bookId: 45) ---
    (bookId: 45, chapter: 1, verse: 16),
    (bookId: 45, chapter: 3, verse: 23),
    (bookId: 45, chapter: 5, verse: 1),
    (bookId: 45, chapter: 5, verse: 8),
    (bookId: 45, chapter: 6, verse: 23),
    (bookId: 45, chapter: 8, verse: 1),
    (bookId: 45, chapter: 8, verse: 18),
    (bookId: 45, chapter: 8, verse: 31),
    (bookId: 45, chapter: 8, verse: 37),
    (bookId: 45, chapter: 8, verse: 38),
    (bookId: 45, chapter: 10, verse: 9),
    (bookId: 45, chapter: 10, verse: 17),
    (bookId: 45, chapter: 12, verse: 12),
    (bookId: 45, chapter: 15, verse: 13),

    // --- 1 Corinthians (bookId: 46) ---
    (bookId: 46, chapter: 2, verse: 9),
    (bookId: 46, chapter: 10, verse: 13),
    (bookId: 46, chapter: 13, verse: 4),
    (bookId: 46, chapter: 13, verse: 13),
    (bookId: 46, chapter: 15, verse: 57),
    (bookId: 46, chapter: 16, verse: 14),

    // --- 2 Corinthians (bookId: 47) ---
    (bookId: 47, chapter: 4, verse: 17),
    (bookId: 47, chapter: 4, verse: 18),
    (bookId: 47, chapter: 5, verse: 7),
    (bookId: 47, chapter: 5, verse: 17),
    (bookId: 47, chapter: 9, verse: 8),
    (bookId: 47, chapter: 12, verse: 9),
    (bookId: 47, chapter: 12, verse: 10),

    // --- Galatians (bookId: 48) ---
    (bookId: 48, chapter: 2, verse: 20),
    (bookId: 48, chapter: 5, verse: 1),
    (bookId: 48, chapter: 5, verse: 22),
    (bookId: 48, chapter: 6, verse: 9),

    // --- Ephesians (bookId: 49) ---
    (bookId: 49, chapter: 2, verse: 8),
    (bookId: 49, chapter: 2, verse: 10),
    (bookId: 49, chapter: 3, verse: 20),
    (bookId: 49, chapter: 4, verse: 2),
    (bookId: 49, chapter: 4, verse: 32),
    (bookId: 49, chapter: 6, verse: 10),
    (bookId: 49, chapter: 6, verse: 11),

    // --- Philippians (bookId: 50) ---
    (bookId: 50, chapter: 1, verse: 6),
    (bookId: 50, chapter: 2, verse: 3),
    (bookId: 50, chapter: 2, verse: 14),
    (bookId: 50, chapter: 3, verse: 13),
    (bookId: 50, chapter: 4, verse: 4),
    (bookId: 50, chapter: 4, verse: 6),
    (bookId: 50, chapter: 4, verse: 7),
    (bookId: 50, chapter: 4, verse: 8),
    (bookId: 50, chapter: 4, verse: 19),

    // --- Colossians (bookId: 51) ---
    (bookId: 51, chapter: 3, verse: 2),
    (bookId: 51, chapter: 3, verse: 12),
    (bookId: 51, chapter: 3, verse: 15),
    (bookId: 51, chapter: 3, verse: 23),

    // --- 1 Thessalonians (bookId: 52) ---
    (bookId: 52, chapter: 5, verse: 16),
    (bookId: 52, chapter: 5, verse: 17),
    (bookId: 52, chapter: 5, verse: 18),

    // --- 2 Timothy (bookId: 55) ---
    (bookId: 55, chapter: 1, verse: 7),
    (bookId: 55, chapter: 2, verse: 15),
    (bookId: 55, chapter: 3, verse: 16),

    // --- Hebrews (bookId: 58) ---
    (bookId: 58, chapter: 4, verse: 12),
    (bookId: 58, chapter: 4, verse: 16),
    (bookId: 58, chapter: 10, verse: 23),
    (bookId: 58, chapter: 11, verse: 6),
    (bookId: 58, chapter: 12, verse: 1),
    (bookId: 58, chapter: 12, verse: 2),
    (bookId: 58, chapter: 13, verse: 5),
    (bookId: 58, chapter: 13, verse: 8),

    // --- James (bookId: 59) ---
    (bookId: 59, chapter: 1, verse: 2),
    (bookId: 59, chapter: 1, verse: 5),
    (bookId: 59, chapter: 1, verse: 17),
    (bookId: 59, chapter: 4, verse: 7),
    (bookId: 59, chapter: 4, verse: 8),
    (bookId: 59, chapter: 5, verse: 16),

    // --- 1 Peter (bookId: 60) ---
    (bookId: 60, chapter: 2, verse: 9),
    (bookId: 60, chapter: 3, verse: 15),
    (bookId: 60, chapter: 5, verse: 7),
    (bookId: 60, chapter: 5, verse: 10),

    // --- 2 Peter (bookId: 61) ---
    (bookId: 61, chapter: 1, verse: 3),
    (bookId: 61, chapter: 3, verse: 9),

    // --- 1 John (bookId: 62) ---
    (bookId: 62, chapter: 1, verse: 9),
    (bookId: 62, chapter: 3, verse: 1),
    (bookId: 62, chapter: 4, verse: 4),
    (bookId: 62, chapter: 4, verse: 7),
    (bookId: 62, chapter: 4, verse: 8),
    (bookId: 62, chapter: 4, verse: 16),
    (bookId: 62, chapter: 4, verse: 18),
    (bookId: 62, chapter: 4, verse: 19),
    (bookId: 62, chapter: 5, verse: 4),
    (bookId: 62, chapter: 5, verse: 14),

    // --- Revelation (bookId: 66) ---
    (bookId: 66, chapter: 1, verse: 8),
    (bookId: 66, chapter: 3, verse: 20),
    (bookId: 66, chapter: 21, verse: 4),
    (bookId: 66, chapter: 22, verse: 13),

    // --- Additional OT verses for diversity ---
    // Numbers (bookId: 4)
    (bookId: 4, chapter: 6, verse: 24),
    (bookId: 4, chapter: 6, verse: 25),
    (bookId: 4, chapter: 6, verse: 26),

    // Ruth (bookId: 8)
    (bookId: 8, chapter: 1, verse: 16),

    // 2 Samuel (bookId: 10)
    (bookId: 10, chapter: 22, verse: 2),
    (bookId: 10, chapter: 22, verse: 31),

    // 1 Kings (bookId: 11)
    (bookId: 11, chapter: 8, verse: 56),

    // 1 Chronicles (bookId: 13)
    (bookId: 13, chapter: 16, verse: 11),
    (bookId: 13, chapter: 16, verse: 34),
    (bookId: 13, chapter: 29, verse: 11),

    // Ezra (bookId: 15)
    (bookId: 15, chapter: 8, verse: 22),

    // Song of Solomon (bookId: 22)
    (bookId: 22, chapter: 2, verse: 4),
    (bookId: 22, chapter: 8, verse: 7),

    // Ezekiel (bookId: 26)
    (bookId: 26, chapter: 36, verse: 26),

    // Amos (bookId: 30)
    (bookId: 30, chapter: 5, verse: 24),

    // Nahum (bookId: 34)
    (bookId: 34, chapter: 1, verse: 7),

    // --- Additional NT verses ---
    // 1 Timothy (bookId: 54)
    (bookId: 54, chapter: 4, verse: 12),
    (bookId: 54, chapter: 6, verse: 6),

    // Titus (bookId: 56)
    (bookId: 56, chapter: 3, verse: 5),

    // Philemon (bookId: 57)
    (bookId: 57, chapter: 1, verse: 6),

    // Jude (bookId: 65)
    (bookId: 65, chapter: 1, verse: 24),

    // --- More Psalms to fill pool ---
    (bookId: 19, chapter: 3, verse: 3),
    (bookId: 19, chapter: 10, verse: 17),
    (bookId: 19, chapter: 13, verse: 5),
    (bookId: 19, chapter: 16, verse: 11),
    (bookId: 19, chapter: 20, verse: 4),
    (bookId: 19, chapter: 22, verse: 3),
    (bookId: 19, chapter: 25, verse: 5),
    (bookId: 19, chapter: 26, verse: 3),
    (bookId: 19, chapter: 33, verse: 18),
    (bookId: 19, chapter: 36, verse: 5),
    (bookId: 19, chapter: 37, verse: 7),
    (bookId: 19, chapter: 40, verse: 3),
    (bookId: 19, chapter: 42, verse: 5),
    (bookId: 19, chapter: 46, verse: 5),
    (bookId: 19, chapter: 48, verse: 14),
    (bookId: 19, chapter: 50, verse: 15),
    (bookId: 19, chapter: 52, verse: 8),
    (bookId: 19, chapter: 57, verse: 10),
    (bookId: 19, chapter: 59, verse: 16),
    (bookId: 19, chapter: 61, verse: 2),
    (bookId: 19, chapter: 62, verse: 5),
    (bookId: 19, chapter: 65, verse: 4),
    (bookId: 19, chapter: 67, verse: 1),
    (bookId: 19, chapter: 71, verse: 5),
    (bookId: 19, chapter: 72, verse: 18),
    (bookId: 19, chapter: 77, verse: 14),
    (bookId: 19, chapter: 84, verse: 1),
    (bookId: 19, chapter: 85, verse: 10),
    (bookId: 19, chapter: 86, verse: 15),
    (bookId: 19, chapter: 89, verse: 1),
    (bookId: 19, chapter: 92, verse: 1),
    (bookId: 19, chapter: 94, verse: 19),
    (bookId: 19, chapter: 96, verse: 1),
    (bookId: 19, chapter: 97, verse: 1),
    (bookId: 19, chapter: 98, verse: 1),
    (bookId: 19, chapter: 100, verse: 5),
    (bookId: 19, chapter: 101, verse: 1),
    (bookId: 19, chapter: 103, verse: 2),
    (bookId: 19, chapter: 104, verse: 24),
    (bookId: 19, chapter: 105, verse: 1),
    (bookId: 19, chapter: 106, verse: 1),
    (bookId: 19, chapter: 108, verse: 4),
    (bookId: 19, chapter: 111, verse: 10),
    (bookId: 19, chapter: 112, verse: 1),
    (bookId: 19, chapter: 113, verse: 3),
    (bookId: 19, chapter: 115, verse: 1),
    (bookId: 19, chapter: 116, verse: 1),
    (bookId: 19, chapter: 117, verse: 1),
    (bookId: 19, chapter: 118, verse: 1),
    (bookId: 19, chapter: 119, verse: 1),
    (bookId: 19, chapter: 119, verse: 9),
    (bookId: 19, chapter: 119, verse: 130),
    (bookId: 19, chapter: 120, verse: 1),
    (bookId: 19, chapter: 122, verse: 1),
    (bookId: 19, chapter: 126, verse: 3),
    (bookId: 19, chapter: 130, verse: 5),
    (bookId: 19, chapter: 139, verse: 23),
    (bookId: 19, chapter: 141, verse: 3),
    (bookId: 19, chapter: 144, verse: 1),
    (bookId: 19, chapter: 145, verse: 3),
    (bookId: 19, chapter: 146, verse: 5),
    (bookId: 19, chapter: 147, verse: 5),
    (bookId: 19, chapter: 148, verse: 1),
    (bookId: 19, chapter: 149, verse: 1),

    // --- Final entries to ensure pool >= 366 ---
    (bookId: 19, chapter: 23, verse: 6),
    (bookId: 40, chapter: 5, verse: 9),
  ];

  /// Returns the total number of verses in the pool.
  static int get poolSize => versePool.length;
}
