// ignore_for_file: avoid_print
/// Script to generate the rvr1960.json Bible asset file.
/// Run with: dart run tool/generate_bible_json.dart
import 'dart:convert';
import 'dart:io';

void main() {
  // Verse counts per chapter for all 66 books of the RVR1960 Bible.
  // Each entry is a list of verse counts for each chapter of that book.
  final Map<int, List<int>> verseCounts = {
    // Old Testament
    1: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26], // Génesis
    2: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38], // Éxodo
    3: [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34], // Levítico
    4: [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13], // Números
    5: [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12], // Deuteronomio
    6: [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33], // Josué
    7: [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25], // Jueces
    8: [22,23,18,22], // Rut
    9: [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13], // 1 Samuel
    10: [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25], // 2 Samuel
    11: [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53], // 1 Reyes
    12: [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30], // 2 Reyes
    13: [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30], // 1 Crónicas
    14: [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23], // 2 Crónicas
    15: [11,70,13,24,17,22,28,36,15,44], // Esdras
    16: [11,20,32,23,19,19,73,18,38,39,36,47,31], // Nehemías
    17: [22,23,15,17,14,14,10,17,32,3], // Ester
    18: [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17], // Job
    19: [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6], // Salmos
    20: [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31], // Proverbios
    21: [18,26,22,16,20,12,29,17,18,20,10,14], // Eclesiastés
    22: [17,17,11,16,16,13,13,14], // Cantares
    23: [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24], // Isaías
    24: [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34], // Jeremías
    25: [22,22,66,22,22], // Lamentaciones
    26: [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35], // Ezequiel
    27: [21,49,30,37,31,28,28,27,27,21,45,13], // Daniel
    28: [11,23,5,19,15,11,16,14,17,15,12,14,16,9], // Oseas
    29: [20,32,21], // Joel
    30: [15,16,15,13,27,14,17,14,15], // Amós
    31: [21], // Abdías
    32: [17,10,10,11], // Jonás
    33: [16,13,12,13,15,16,20], // Miqueas
    34: [15,13,19], // Nahúm
    35: [17,20,19], // Habacuc
    36: [18,15,20], // Sofonías
    37: [15,23], // Hageo
    38: [21,13,10,14,11,15,14,23,17,12,17,14,9,21], // Zacarías
    39: [14,17,18,6], // Malaquías
    // New Testament
    40: [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20], // Mateo
    41: [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20], // Marcos
    42: [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53], // Lucas
    43: [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25], // Juan
    44: [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31], // Hechos
    45: [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27], // Romanos
    46: [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24], // 1 Corintios
    47: [24,17,18,18,21,18,16,24,15,18,33,21,14], // 2 Corintios
    48: [24,21,29,31,26,18], // Gálatas
    49: [23,22,21,32,33,24], // Efesios
    50: [30,30,21,23], // Filipenses
    51: [29,23,25,18], // Colosenses
    52: [10,20,13,18,28], // 1 Tesalonicenses
    53: [12,17,18], // 2 Tesalonicenses
    54: [20,15,16,16,25,21], // 1 Timoteo
    55: [18,26,17,22], // 2 Timoteo
    56: [16,15,15], // Tito
    57: [25], // Filemón
    58: [14,18,19,16,14,20,28,13,28,39,40,29,25], // Hebreos
    59: [27,26,18,17,20], // Santiago
    60: [25,25,22,19,14], // 1 Pedro
    61: [21,22,18], // 2 Pedro
    62: [10,29,24,21,21], // 1 Juan
    63: [13], // 2 Juan
    64: [14], // 3 Juan
    65: [25], // Judas
    66: [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21], // Apocalipsis
  };

  // Book metadata
  final Map<int, String> bookNames = {
    1: 'Génesis', 2: 'Éxodo', 3: 'Levítico', 4: 'Números', 5: 'Deuteronomio',
    6: 'Josué', 7: 'Jueces', 8: 'Rut', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Reyes', 12: '2 Reyes', 13: '1 Crónicas', 14: '2 Crónicas',
    15: 'Esdras', 16: 'Nehemías', 17: 'Ester', 18: 'Job', 19: 'Salmos',
    20: 'Proverbios', 21: 'Eclesiastés', 22: 'Cantares', 23: 'Isaías',
    24: 'Jeremías', 25: 'Lamentaciones', 26: 'Ezequiel', 27: 'Daniel',
    28: 'Oseas', 29: 'Joel', 30: 'Amós', 31: 'Abdías', 32: 'Jonás',
    33: 'Miqueas', 34: 'Nahúm', 35: 'Habacuc', 36: 'Sofonías', 37: 'Hageo',
    38: 'Zacarías', 39: 'Malaquías', 40: 'Mateo', 41: 'Marcos', 42: 'Lucas',
    43: 'Juan', 44: 'Hechos', 45: 'Romanos', 46: '1 Corintios',
    47: '2 Corintios', 48: 'Gálatas', 49: 'Efesios', 50: 'Filipenses',
    51: 'Colosenses', 52: '1 Tesalonicenses', 53: '2 Tesalonicenses',
    54: '1 Timoteo', 55: '2 Timoteo', 56: 'Tito', 57: 'Filemón',
    58: 'Hebreos', 59: 'Santiago', 60: '1 Pedro', 61: '2 Pedro',
    62: '1 Juan', 63: '2 Juan', 64: '3 Juan', 65: 'Judas', 66: 'Apocalipsis',
  };

  final Map<int, String> bookAbbreviations = {
    1: 'Gn', 2: 'Ex', 3: 'Lv', 4: 'Nm', 5: 'Dt', 6: 'Jos', 7: 'Jue',
    8: 'Rt', 9: '1S', 10: '2S', 11: '1R', 12: '2R', 13: '1Cr', 14: '2Cr',
    15: 'Esd', 16: 'Neh', 17: 'Est', 18: 'Job', 19: 'Sal', 20: 'Pr',
    21: 'Ec', 22: 'Cnt', 23: 'Is', 24: 'Jer', 25: 'Lm', 26: 'Ez',
    27: 'Dn', 28: 'Os', 29: 'Jl', 30: 'Am', 31: 'Abd', 32: 'Jon',
    33: 'Mi', 34: 'Nah', 35: 'Hab', 36: 'Sof', 37: 'Hag', 38: 'Zac',
    39: 'Mal', 40: 'Mt', 41: 'Mr', 42: 'Lc', 43: 'Jn', 44: 'Hch',
    45: 'Ro', 46: '1Co', 47: '2Co', 48: 'Gá', 49: 'Ef', 50: 'Fil',
    51: 'Col', 52: '1Ts', 53: '2Ts', 54: '1Ti', 55: '2Ti', 56: 'Tit',
    57: 'Flm', 58: 'He', 59: 'Stg', 60: '1P', 61: '2P', 62: '1Jn',
    63: '2Jn', 64: '3Jn', 65: 'Jud', 66: 'Ap',
  };

  // Some actual RVR1960 text for Genesis 1 (first 31 verses)
  final Map<int, String> genesis1Verses = {
    1: 'En el principio creó Dios los cielos y la tierra.',
    2: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.',
    3: 'Y dijo Dios: Sea la luz; y fue la luz.',
    4: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.',
    5: 'Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.',
    6: 'Luego dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas.',
    7: 'E hizo Dios la expansión, y separó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión. Y fue así.',
    8: 'Y llamó Dios a la expansión Cielos. Y fue la tarde y la mañana el día segundo.',
    9: 'Dijo también Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco. Y fue así.',
    10: 'Y llamó Dios a lo seco Tierra, y a la reunión de las aguas llamó Mares. Y vio Dios que era bueno.',
    11: 'Después dijo Dios: Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género, que su semilla esté en él, sobre la tierra. Y fue así.',
    12: 'Produjo, pues, la tierra hierba verde, hierba que da semilla según su naturaleza, y árbol que da fruto, cuya semilla está en él, según su género. Y vio Dios que era bueno.',
    13: 'Y fue la tarde y la mañana el día tercero.',
    14: 'Dijo luego Dios: Haya lumbreras en la expansión de los cielos para separar el día de la noche; y sirvan de señales para las estaciones, para días y años,',
    15: 'y sean por lumbreras en la expansión de los cielos para alumbrar sobre la tierra. Y fue así.',
    16: 'E hizo Dios las dos grandes lumbreras; la lumbrera mayor para que señorease en el día, y la lumbrera menor para que señorease en la noche; hizo también las estrellas.',
    17: 'Y las puso Dios en la expansión de los cielos para alumbrar sobre la tierra,',
    18: 'y para señorear en el día y en la noche, y para separar la luz de las tinieblas. Y vio Dios que era bueno.',
    19: 'Y fue la tarde y la mañana el día cuarto.',
    20: 'Dijo Dios: Produzcan las aguas seres vivientes, y aves que vuelen sobre la tierra, en la abierta expansión de los cielos.',
    21: 'Y creó Dios los grandes monstruos marinos, y todo ser viviente que se mueve, que las aguas produjeron según su género, y toda ave alada según su especie. Y vio Dios que era bueno.',
    22: 'Y Dios los bendijo, diciendo: Fructificad y multiplicaos, y llenad las aguas en los mares, y multiplíquense las aves en la tierra.',
    23: 'Y fue la tarde y la mañana el día quinto.',
    24: 'Luego dijo Dios: Produzca la tierra seres vivientes según su género, bestias y serpientes y animales de la tierra según su especie. Y fue así.',
    25: 'E hizo Dios animales de la tierra según su género, y ganado según su género, y todo animal que se arrastra sobre la tierra según su especie. Y vio Dios que era bueno.',
    26: 'Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree en los peces del mar, en las aves de los cielos, en las bestias, en toda la tierra, y en todo animal que se arrastra sobre la tierra.',
    27: 'Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.',
    28: 'Y los bendijo Dios, y les dijo: Fructificad y multiplicaos; llenad la tierra, y sojuzgadla, y señoread en los peces del mar, en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra.',
    29: 'Y dijo Dios: He aquí que os he dado toda planta que da semilla, que está sobre toda la tierra, y todo árbol en que hay fruto y que da semilla; os serán para comer.',
    30: 'Y a toda bestia de la tierra, y a todas las aves de los cielos, y a todo lo que se arrastra sobre la tierra, en que hay vida, toda planta verde les será para comer. Y fue así.',
    31: 'Y vio Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fue la tarde y la mañana el día sexto.',
  };

  // Build the JSON structure
  final List<Map<String, dynamic>> books = [];
  int totalVerseCount = 0;
  int totalChapterCount = 0;

  for (int bookId = 1; bookId <= 66; bookId++) {
    final chapters = <Map<String, dynamic>>[];
    final verseCountsForBook = verseCounts[bookId]!;

    for (int chapterIdx = 0; chapterIdx < verseCountsForBook.length; chapterIdx++) {
      final chapterNum = chapterIdx + 1;
      final numVerses = verseCountsForBook[chapterIdx];
      final verses = <Map<String, dynamic>>[];

      for (int verseNum = 1; verseNum <= numVerses; verseNum++) {
        String text;
        if (bookId == 1 && chapterNum == 1 && genesis1Verses.containsKey(verseNum)) {
          text = genesis1Verses[verseNum]!;
        } else {
          text = '[Texto RVR1960 pendiente - ${bookNames[bookId]} $chapterNum:$verseNum]';
        }
        verses.add({'number': verseNum, 'text': text});
        totalVerseCount++;
      }

      chapters.add({'number': chapterNum, 'verses': verses});
      totalChapterCount++;
    }

    books.add({
      'id': bookId,
      'name': bookNames[bookId],
      'abbreviation': bookAbbreviations[bookId],
      'testament': bookId <= 39 ? 'OT' : 'NT',
      'chapterCount': verseCountsForBook.length,
      'chapters': chapters,
    });
  }

  // Verify counts
  print('Total books: ${books.length}');
  print('Total chapters: $totalChapterCount');
  print('Total verses: $totalVerseCount');

  assert(books.length == 66, 'Expected 66 books, got ${books.length}');
  assert(totalChapterCount == 1189, 'Expected 1189 chapters, got $totalChapterCount');
  assert(totalVerseCount == 31102, 'Expected 31102 verses, got $totalVerseCount');

  // Write JSON file
  final outputPath = 'lib/assets/bible/rvr1960.json';
  final file = File(outputPath);
  final encoder = JsonEncoder.withIndent(null); // Compact JSON to save space
  file.writeAsStringSync(encoder.convert(books));

  final fileSizeKb = file.lengthSync() / 1024;
  print('Generated $outputPath (${fileSizeKb.toStringAsFixed(1)} KB)');
}
