interface FizzBuzzConfig {
  word: string;
  fn: (inputNumber: number, ...params: any[]) => boolean;
  params: any[];
}

export const FizzbuzzNew = (inputNumber: number, definitions: FizzBuzzConfig[]) => {
  let result = '';

  definitions.forEach((definition) => {
    if (definition.fn(inputNumber, ...definition.params)) {
      result += `${definition.word}`;
    }
  });

  return result || inputNumber.toString();
};
