<?php

namespace App\Services;

class ProfanityFilter
{
    /**
     * Palabras y patrones ofensivos en español e inglés.
     * La lista cubre: insultos, discriminación, lenguaje violento y sexual explícito.
     */
    private static array $words = [
        // Insultos generales
        'pelotudo', 'pelotuda', 'boludo', 'boluda', 'idiota', 'imbecil', 'imbécil',
        'estupido', 'estupida', 'estúpido', 'estúpida', 'tarado', 'tarada',
        'mogolico', 'mogólico', 'mogolica', 'retrasado', 'retrasada',
        'hdp', 'hijo de puta', 'hija de puta', 'hdeputa',
        'gil', 'gila', 'forro', 'forra', 'cretino', 'cretina',
        'imbecil', 'Animal', 'bestia', 'inútil', 'basura',
        'mierda', 'mierdas', 'mierdoso', 'mierdosa',
        'culo', 'culos', 'culero', 'culera',
        'puta', 'putas', 'putaso', 'putaso',
        'puto', 'putos', 'prostituta',
        'coger', 'cogida', 'cogido',
        'concha', 'conchas', 'conchuda', 'conchudo',
        'choto', 'chota', 'chotada',
        'trolo', 'trola', 'trolito',
        'sorete', 'soretes',
        'garca', 'garcas',
        'cagon', 'cagón', 'cagona',
        'mamabicho', 'mamaguevo', 'mamahuevo',
        'carajo', 'carajos',
        'joder', 'jodido', 'jodete',
        'pendejo', 'pendeja', 'pendejos',
        'cabron', 'cabrón', 'cabrona',
        'cabroncete',
        'jodido', 'hijoputa', 'hijueputa', 'hijoeputa',
        'malparido', 'malparida',
        'gonorrea',
        'marica', 'maricon', 'maricón',
        'tortillera',
        'culiao', 'culiado', 'culiada', 'weon', 'weona', 'huevon', 'huevona',
        'verga', 'vergas', 'vergudo',
        'pija', 'pijas', 'pijo',
        'chinga', 'chingada', 'chingado', 'chingadera', 'chingar',
        'pinche', 'pinches',
        'guey', 'güey', 'buey',
        'ojete', 'ojetes',
        'culero', 'culera',
        // Lenguaje violento
        'matar', 'matarte', 'te mato', 'voy a matar', 'voy a golpear',
        'te golpeo', 'te rompo', 'te pego', 'te reviento', 'te destruyo',
        'muerte', 'muere', 'muerto', 'asesinato',
        'golpear', 'golpearte', 'pegar', 'pegarte',
        'amenaza', 'amenazo', 'amenazas',
        // Discriminación
        'negro de mierda', 'sudaca', 'sudacas',
        'nazi', 'nazismo', 'fascista',
        'racista', 'racismo',
        // Inglés básico
        'fuck', 'fucking', 'fucked', 'fucker', 'fuckoff',
        'shit', 'shitty', 'bullshit',
        'asshole', 'ass', 'bastard',
        'bitch', 'bitches',
        'cunt', 'cock', 'dick', 'pussy',
        'motherfucker', 'motherfucking',
        'nigger', 'nigga',
        'whore', 'slut',
        'idiot', 'moron', 'retard',
        'kill yourself', 'kys',
    ];

    /**
     * Retorna true si el texto contiene contenido ofensivo.
     */
    public static function contains(string ...$texts): bool
    {
        $combined = mb_strtolower(implode(' ', $texts));

        // Normalizar caracteres (quitar tildes y similares para detectar evasiones)
        $normalized = self::normalize($combined);

        foreach (self::$words as $word) {
            $wordNorm = self::normalize(mb_strtolower($word));

            // Buscar la palabra como término completo o dentro de palabras compuestas
            if (
                str_contains($normalized, $wordNorm) ||
                preg_match('/\b'.preg_quote($wordNorm, '/').'\b/u', $normalized)
            ) {
                return true;
            }
        }

        return false;
    }

    private static function normalize(string $text): string
    {
        // Reemplazar caracteres leetspeak comunes
        $text = strtr($text, [
            '@' => 'a', '4' => 'a', '3' => 'e', '1' => 'i',
            '0' => 'o', '$' => 's', '5' => 's', '7' => 't',
        ]);

        // Eliminar tildes / diacríticos
        return transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text) ?? $text;
    }
}
