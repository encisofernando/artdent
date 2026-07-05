<?php

namespace App\Support;

/**
 * Convierte un monto en pesos a su expresión en letras (español, mayúsculas,
 * sin acentos), formato habitual en recibos de sueldo argentinos:
 * "UN MILLON SETECIENTOS VEINTICUATRO MIL TRESCIENTOS VEINTISEIS CON 00/100".
 */
class NumberToWordsEs
{
    private const UNITS = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];

    private const TEENS = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];

    private const TENS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];

    private const HUNDREDS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    public static function pesos(float $amount): string
    {
        $amount = round(abs($amount), 2);
        $integer = (int) floor($amount);
        $cents = (int) round(($amount - $integer) * 100);

        $words = $integer === 0 ? 'CERO' : self::convert($integer);

        return sprintf('%s CON %02d/100', $words, $cents);
    }

    private static function convert(int $number): string
    {
        if ($number < 10) {
            return self::UNITS[$number];
        }

        if ($number < 20) {
            return self::TEENS[$number - 10];
        }

        if ($number < 100) {
            $tens = intdiv($number, 10);
            $units = $number % 10;

            if ($tens === 2) {
                return $units > 0 ? 'VEINTI'.self::UNITS[$units] : 'VEINTE';
            }

            return self::TENS[$tens].($units > 0 ? ' Y '.self::UNITS[$units] : '');
        }

        if ($number < 1000) {
            if ($number === 100) {
                return 'CIEN';
            }

            $hundreds = intdiv($number, 100);
            $rest = $number % 100;

            return self::HUNDREDS[$hundreds].($rest > 0 ? ' '.self::convert($rest) : '');
        }

        if ($number < 1_000_000) {
            $thousands = intdiv($number, 1000);
            $rest = $number % 1000;
            $thousandsWord = $thousands === 1 ? 'MIL' : self::convert($thousands).' MIL';

            return $thousandsWord.($rest > 0 ? ' '.self::convert($rest) : '');
        }

        if ($number < 1_000_000_000) {
            $millions = intdiv($number, 1_000_000);
            $rest = $number % 1_000_000;
            $millionsWord = $millions === 1 ? 'UN MILLON' : self::convert($millions).' MILLONES';

            return $millionsWord.($rest > 0 ? ' '.self::convert($rest) : '');
        }

        return (string) $number;
    }
}
