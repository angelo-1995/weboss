/// Constants for the RVR1960 Bible structure.
///
/// Contains all 66 book names in Spanish, their chapter counts,
/// abbreviations, and canonical ordering.
class BibleConstants {
  BibleConstants._();

  /// Total number of books in the Bible.
  static const int totalBooks = 66;

  /// Total number of Old Testament books.
  static const int oldTestamentBooks = 39;

  /// Total number of New Testament books.
  static const int newTestamentBooks = 27;

  /// Total number of chapters in the Bible.
  static const int totalChapters = 1189;

  /// Total number of verses in the RVR1960 Bible.
  static const int totalVerses = 31102;

  /// Book names in Spanish, indexed by book ID (1-66).
  static const Map<int, String> bookNames = {
    1: 'Génesis',
    2: 'Éxodo',
    3: 'Levítico',
    4: 'Números',
    5: 'Deuteronomio',
    6: 'Josué',
    7: 'Jueces',
    8: 'Rut',
    9: '1 Samuel',
    10: '2 Samuel',
    11: '1 Reyes',
    12: '2 Reyes',
    13: '1 Crónicas',
    14: '2 Crónicas',
    15: 'Esdras',
    16: 'Nehemías',
    17: 'Ester',
    18: 'Job',
    19: 'Salmos',
    20: 'Proverbios',
    21: 'Eclesiastés',
    22: 'Cantares',
    23: 'Isaías',
    24: 'Jeremías',
    25: 'Lamentaciones',
    26: 'Ezequiel',
    27: 'Daniel',
    28: 'Oseas',
    29: 'Joel',
    30: 'Amós',
    31: 'Abdías',
    32: 'Jonás',
    33: 'Miqueas',
    34: 'Nahúm',
    35: 'Habacuc',
    36: 'Sofonías',
    37: 'Hageo',
    38: 'Zacarías',
    39: 'Malaquías',
    40: 'Mateo',
    41: 'Marcos',
    42: 'Lucas',
    43: 'Juan',
    44: 'Hechos',
    45: 'Romanos',
    46: '1 Corintios',
    47: '2 Corintios',
    48: 'Gálatas',
    49: 'Efesios',
    50: 'Filipenses',
    51: 'Colosenses',
    52: '1 Tesalonicenses',
    53: '2 Tesalonicenses',
    54: '1 Timoteo',
    55: '2 Timoteo',
    56: 'Tito',
    57: 'Filemón',
    58: 'Hebreos',
    59: 'Santiago',
    60: '1 Pedro',
    61: '2 Pedro',
    62: '1 Juan',
    63: '2 Juan',
    64: '3 Juan',
    65: 'Judas',
    66: 'Apocalipsis',
  };

  /// Book abbreviations in Spanish, indexed by book ID (1-66).
  static const Map<int, String> bookAbbreviations = {
    1: 'Gn',
    2: 'Ex',
    3: 'Lv',
    4: 'Nm',
    5: 'Dt',
    6: 'Jos',
    7: 'Jue',
    8: 'Rt',
    9: '1S',
    10: '2S',
    11: '1R',
    12: '2R',
    13: '1Cr',
    14: '2Cr',
    15: 'Esd',
    16: 'Neh',
    17: 'Est',
    18: 'Job',
    19: 'Sal',
    20: 'Pr',
    21: 'Ec',
    22: 'Cnt',
    23: 'Is',
    24: 'Jer',
    25: 'Lm',
    26: 'Ez',
    27: 'Dn',
    28: 'Os',
    29: 'Jl',
    30: 'Am',
    31: 'Abd',
    32: 'Jon',
    33: 'Mi',
    34: 'Nah',
    35: 'Hab',
    36: 'Sof',
    37: 'Hag',
    38: 'Zac',
    39: 'Mal',
    40: 'Mt',
    41: 'Mr',
    42: 'Lc',
    43: 'Jn',
    44: 'Hch',
    45: 'Ro',
    46: '1Co',
    47: '2Co',
    48: 'Gá',
    49: 'Ef',
    50: 'Fil',
    51: 'Col',
    52: '1Ts',
    53: '2Ts',
    54: '1Ti',
    55: '2Ti',
    56: 'Tit',
    57: 'Flm',
    58: 'He',
    59: 'Stg',
    60: '1P',
    61: '2P',
    62: '1Jn',
    63: '2Jn',
    64: '3Jn',
    65: 'Jud',
    66: 'Ap',
  };

  /// Chapter counts for each book, indexed by book ID (1-66).
  static const Map<int, int> chapterCounts = {
    1: 50, // Génesis
    2: 40, // Éxodo
    3: 27, // Levítico
    4: 36, // Números
    5: 34, // Deuteronomio
    6: 24, // Josué
    7: 21, // Jueces
    8: 4, // Rut
    9: 31, // 1 Samuel
    10: 24, // 2 Samuel
    11: 22, // 1 Reyes
    12: 25, // 2 Reyes
    13: 29, // 1 Crónicas
    14: 36, // 2 Crónicas
    15: 10, // Esdras
    16: 13, // Nehemías
    17: 10, // Ester
    18: 42, // Job
    19: 150, // Salmos
    20: 31, // Proverbios
    21: 12, // Eclesiastés
    22: 8, // Cantares
    23: 66, // Isaías
    24: 52, // Jeremías
    25: 5, // Lamentaciones
    26: 48, // Ezequiel
    27: 12, // Daniel
    28: 14, // Oseas
    29: 3, // Joel
    30: 9, // Amós
    31: 1, // Abdías
    32: 4, // Jonás
    33: 7, // Miqueas
    34: 3, // Nahúm
    35: 3, // Habacuc
    36: 3, // Sofonías
    37: 2, // Hageo
    38: 14, // Zacarías
    39: 4, // Malaquías
    40: 28, // Mateo
    41: 16, // Marcos
    42: 24, // Lucas
    43: 21, // Juan
    44: 28, // Hechos
    45: 16, // Romanos
    46: 16, // 1 Corintios
    47: 13, // 2 Corintios
    48: 6, // Gálatas
    49: 6, // Efesios
    50: 4, // Filipenses
    51: 4, // Colosenses
    52: 5, // 1 Tesalonicenses
    53: 3, // 2 Tesalonicenses
    54: 6, // 1 Timoteo
    55: 4, // 2 Timoteo
    56: 3, // Tito
    57: 1, // Filemón
    58: 13, // Hebreos
    59: 5, // Santiago
    60: 5, // 1 Pedro
    61: 3, // 2 Pedro
    62: 5, // 1 Juan
    63: 1, // 2 Juan
    64: 1, // 3 Juan
    65: 1, // Judas
    66: 22, // Apocalipsis
  };

  /// Canonical book order (1-66). Books are already ordered by their ID.
  static const List<int> canonicalOrder = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66,
  ];

  /// Old Testament book IDs (1-39).
  static const List<int> oldTestamentBookIds = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
  ];

  /// New Testament book IDs (40-66).
  static const List<int> newTestamentBookIds = [
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66,
  ];

  /// Returns the book name for a given [bookId], or null if invalid.
  static String? getBookName(int bookId) => bookNames[bookId];

  /// Returns the chapter count for a given [bookId], or null if invalid.
  static int? getChapterCount(int bookId) => chapterCounts[bookId];

  /// Returns the abbreviation for a given [bookId], or null if invalid.
  static String? getAbbreviation(int bookId) => bookAbbreviations[bookId];

  /// Returns true if the [bookId] belongs to the Old Testament.
  static bool isOldTestament(int bookId) => bookId >= 1 && bookId <= 39;

  /// Returns true if the [bookId] belongs to the New Testament.
  static bool isNewTestament(int bookId) => bookId >= 40 && bookId <= 66;

  /// Returns true if the [bookId] is valid (1-66).
  static bool isValidBookId(int bookId) => bookId >= 1 && bookId <= 66;

  /// Returns true if [chapterNum] is valid for the given [bookId].
  static bool isValidChapter(int bookId, int chapterNum) {
    final count = chapterCounts[bookId];
    if (count == null) return false;
    return chapterNum >= 1 && chapterNum <= count;
  }
}
