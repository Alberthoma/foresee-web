/**
 * numberParser.js
 * Un sistema para convertir números escritos en español a su valor numérico.
 * Soporta enteros, miles y decimales separados por "con" o "punto".
 * Ejemplo: "mil novecientos ochenta con noventa y nueve" -> 1980.99
 */

const numberParser = (() => {
    // Diccionarios con los valores de cada palabra
    const wordValues = {
        'cero': 0, 'un': 1, 'una': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
        'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
        'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
        'veinte': 20, 'veintiún': 21, 'veintiuno': 21, 'veintidós': 22,
        'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26,
        'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
        'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60,
        'setenta': 70, 'ochenta': 80, 'noventa': 90,
        'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300,
        'cuatrocientos': 400, 'quinientos': 500, 'seiscientos': 600,
        'setecientos': 700, 'ochocientos': 800, 'novecientos': 900
    };

    const multipliers = {
        'mil': 1000
        // Se podrían añadir 'millón', 'millones' si se necesitaran números más grandes
    };

    /**
     * Parsea un trozo de texto numérico (sin miles ni decimales) y devuelve su valor.
     * @param {string[]} words - Un array de palabras numéricas.
     * @returns {number} El valor numérico del trozo.
     */
    const parseChunk = (words) => {
        let number = 0;
        for (const word of words) {
            if (wordValues[word]) {
                number += wordValues[word];
            }
        }
        return number;
    };

    /**
     * Función principal que convierte un número completo en español a un valor numérico.
     * @param {string} text - El número escrito en español.
     * @returns {number|null} El número parseado o null si no se pudo convertir.
     */
    const parseSpanishNumber = (text) => {
        if (!text || typeof text !== 'string') {
            return null;
        }

        const cleanText = text.toLowerCase().trim();
        let integerPartStr = cleanText;
        let decimalPartStr = '';

        // Separar parte entera y decimal
        const decimalSeparators = [' con ', ' punto '];
        for (const separator of decimalSeparators) {
            if (cleanText.includes(separator)) {
                const parts = cleanText.split(separator);
                integerPartStr = parts[0];
                decimalPartStr = parts.slice(1).join(separator); // Unir por si había más de un "con"
                break;
            }
        }

        const words = integerPartStr.split(/\s+/).filter(w => w !== 'y' && w);

        let total = 0;
        let currentChunk = []; // Almacena palabras antes de un multiplicador (ej. "dos" en "dos mil")

        for (const word of words) {
            if (multipliers[word]) {
                const chunkValue = currentChunk.length > 0 ? parseChunk(currentChunk) : 1;
                total += chunkValue * multipliers[word];
                currentChunk = []; // Reiniciar para el siguiente trozo
            } else {
                currentChunk.push(word);
            }
        }

        total += parseChunk(currentChunk); // Añadir el último trozo (ej. los "ciento uno" de "dos mil ciento uno")

        if (decimalPartStr) {
            const decimalWords = decimalPartStr.split(/\s+/).filter(w => w !== 'y' && w);
            const decimalValue = parseChunk(decimalWords);
            if (decimalValue > 0) {
                total += decimalValue / 100;
            }
        }

        return total > 0 ? total : null;
    };

    // Exponer la función principal para que sea accesible desde otros scripts
    return {
        parse: parseSpanishNumber
    };
})();


// --- SECCIÓN DE PRUEBAS (Para que veas cómo funciona) ---
console.log("--- Pruebas del numberParser ---");
console.log("'veinte con cincuenta' ->", numberParser.parse('veinte con cincuenta')); // -> 20.5
console.log("'mil novecientos ochenta con noventa y nueve' ->", numberParser.parse('mil novecientos ochenta con noventa y nueve')); // -> 1980.99
console.log("'ciento uno' ->", numberParser.parse('ciento uno')); // -> 101
console.log("'dos mil quinientos' ->", numberParser.parse('dos mil quinientos')); // -> 2500
console.log("'treinta y cuatro' ->", numberParser.parse('treinta y cuatro')); // -> 34
console.log("'ocho' ->", numberParser.parse('ocho')); // -> 8
console.log("'mil uno' ->", numberParser.parse('mil uno')); // -> 1001
console.log("'cincuenta y cinco con cinco' ->", numberParser.parse('cincuenta y cinco con cinco')); // -> 55.05