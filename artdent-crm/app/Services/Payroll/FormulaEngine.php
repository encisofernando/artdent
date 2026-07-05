<?php

namespace App\Services\Payroll;

use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\ExpressionLanguage\SyntaxError;

class FormulaEngine
{
    private ExpressionLanguage $language;

    public function __construct()
    {
        $this->language = new ExpressionLanguage;
        $this->registerFunctions();
    }

    /**
     * Evalúa una fórmula contra un conjunto de variables y devuelve un número.
     *
     * @param  array<string, int|float|bool|string>  $variables
     *
     * @throws \InvalidArgumentException si la fórmula no devuelve un valor numérico.
     */
    public function evaluate(string $formula, array $variables): float
    {
        $result = $this->language->evaluate($formula, $variables);

        if (! is_numeric($result) && ! is_bool($result)) {
            throw new \InvalidArgumentException('La fórmula debe devolver un número.');
        }

        return (float) $result;
    }

    /**
     * Valida la sintaxis de una fórmula y que solo use variables conocidas.
     * Devuelve null si es válida, o el mensaje de error si no lo es.
     *
     * @param  string[]  $availableVariableNames
     */
    public function validate(string $formula, array $availableVariableNames): ?string
    {
        try {
            $this->language->parse($formula, $availableVariableNames);

            return null;
        } catch (SyntaxError $e) {
            return $e->getMessage();
        }
    }

    private function registerFunctions(): void
    {
        $this->language->register(
            'round',
            fn (string $n, string $p = '0'): string => sprintf('round(%s, %s)', $n, $p),
            fn (array $args, int|float $n, int $p = 0): float => round((float) $n, $p),
        );

        $this->language->register(
            'min',
            fn (string ...$args): string => sprintf('min(%s)', implode(', ', $args)),
            fn (array $args, int|float ...$values): int|float => min($values),
        );

        $this->language->register(
            'max',
            fn (string ...$args): string => sprintf('max(%s)', implode(', ', $args)),
            fn (array $args, int|float ...$values): int|float => max($values),
        );
    }
}
