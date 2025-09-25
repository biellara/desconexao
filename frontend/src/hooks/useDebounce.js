import { useState, useEffect } from 'react';

/**
 * Um hook customizado que atrasa a atualização de um valor.
 * É útil para evitar requisições excessivas em campos de busca.
 * @param {*} value O valor a ser "debounced".
 * @param {number} delay O tempo de atraso em milissegundos.
 * @returns {*} O valor após o atraso.
 */
export default function useDebounce(value, delay) {
  // Estado para armazenar o valor "debounced"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Cria um temporizador que só vai atualizar o estado
    // após o tempo de 'delay' ter passado.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // A função de limpeza do useEffect.
    // Ela é chamada sempre que o 'value' ou 'delay' mudam.
    // Isso cancela o temporizador anterior, garantindo que a atualização
    // só ocorra depois que o utilizador parar de interagir.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // O efeito só é re-executado se o valor ou o delay mudarem

  return debouncedValue;
}
