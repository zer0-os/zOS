// The general problem is to write a program that prints the numbers
// from 1 to 100. But for multiples of three print “Fizz” instead of
// the number and for the multiples of five print “Buzz”. For numbers which
// are multiples of both three and five print “FizzBuzz”. The first five printed values would look like: "1, 2, Fizz, 4, Buzz".
// Initial request
// For our purposes, write a function that takes an integer and returns the appropriate FizzBuzz string: fizzbuzz(int) string

// Note: We recommend completing the initial request before reading
// the next feature request because even knowing what the next feature might
// be may impact how you approach the original problem.
// Likewise for each feature request, complete the first request before viewing the others and so on.

// FEATURE REQUEST 1
// I want to be able to specify which value triggers the Fizz
// and which value triggers the Buzz. If the number is divisible by
// the first value then print Fizz, divisible by the second then print Buzz,
// if divisible by both then FizzBuzz.
// Example: instead of 3 and 5 I want to specify that 2 means Fizz and 7 means Buzz.

// FEATURE REQUEST 2
// I want to be able to specify which words are used.
// Instead of "Fizz" and "Buzz" allow me to set "Zig" and "Zag" or whatever other two strings I want.

// FEATURE REQUEST 3
// Allow me to define the logic that determines if the first/second word
// should be printed.

//Some examples: In all cases, if both conditions are true then print FizzBuzz
// Print Fizz if the number is between 10 and 20 (inclusive), and Buzz if the number is divisible by 5.
// Print Fizz if the number has a 3 in it (eg: 3, 13, 23, 30, etc), and Buzz if the number is divisible by 5.
// Print Fizz if the number is divisible by 3, and Buzz if the number is divisible by 5 OR has a 5 in it.
// Print Fizz for number divisible by X and Buzz for number divisible by Y. This example is the original fizzbuzz logic.

// data - clump

// Where we are declaring the helper functions
const isDivisibleBy = (inputNumber: number, factor: number) => inputNumber % factor === 0;
const isInbetween = (inputNumber: number, startNumber: number, endNumber: number) =>
  inputNumber > startNumber && inputNumber < endNumber;

export const Fizzbuzz = (
  inputNumber: number,

  fizzNumber: number = 3,
  buzzNumber: number = 5,

  fizzWord: string = 'Fizz',
  buzzWord: string = 'Buzz',

  fizzLogic: boolean = false,
  buzzLogic: boolean = false
) => {
  const fizz = {
    word: fizzWord,
    fn: fizzLogic ? isInbetween : isDivisibleBy,
    params: fizzLogic
      ? [
          10,
          20,
        ]
      : [fizzNumber],
  };
  const buzz = {
    word: buzzWord,
    fn: buzzLogic ? isInbetween : isDivisibleBy,
    params: buzzLogic
      ? [
          18,
          28,
        ]
      : [buzzNumber],
  };

  return FizzbuzzNew(inputNumber, fizz, buzz);
};

interface FizzBuzzConfig {
  word: string;
  fn: (inputNumber: number, ...params: any[]) => boolean;
  params: any[];
}

export const FizzbuzzNew = (inputNumber: number, fizz: FizzBuzzConfig, buzz: FizzBuzzConfig) => {
  const isFizz = fizz.fn(inputNumber, ...fizz.params);
  const isBuzz = buzz.fn(inputNumber, ...buzz.params);

  if (isFizz && isBuzz) {
    return `${fizz.word}${buzz.word}`;
  } else if (isBuzz) {
    return buzz.word;
  } else if (isFizz) {
    return fizz.word;
  }

  return inputNumber.toString();
};

describe('Fizzbuzz', () => {
  it('should return a number as a string', function () {
    expect(Fizzbuzz(1)).toEqual('1');
  });

  describe('Fizz Tests', () => {
    it('should return "Fizz" if inputNumber is equal to fizzNumber', function () {
      expect(Fizzbuzz(3, 3)).toEqual('Fizz');
      expect(Fizzbuzz(6, 3)).toEqual('Fizz');
      expect(Fizzbuzz(2, 2)).toEqual('Fizz');
      expect(Fizzbuzz(4, 2)).toEqual('Fizz');
    });

    it('should return "Zig" if inputNumber is equal to fizzNumber', function () {
      expect(Fizzbuzz(3, 3, 0, 'Zig')).toEqual('Zig');
      expect(Fizzbuzz(3, 3, 0, 'Hello World')).toEqual('Hello World');
    });
  });

  describe('Buzz Tests', () => {
    it('should return "Buzz" if inputNumber is equal to buzzNumber', function () {
      expect(Fizzbuzz(5, 0, 5)).toEqual('Buzz');
      expect(Fizzbuzz(10, 0, 5)).toEqual('Buzz');
      expect(Fizzbuzz(7, 0, 7)).toEqual('Buzz');
    });

    it('should return "Zag" if inputNumber is equal to buzzNumber', function () {
      expect(Fizzbuzz(5, 0, 5, '', 'Zag')).toEqual('Zag');
      expect(Fizzbuzz(5, 0, 5, '', 'Hello World')).toEqual('Hello World');
    });
  });

  describe('FizzBuzz Tests', () => {
    it('should return "FizzBuzz" if number is a multiple of fizzNumber and buzzNumber', function () {
      expect(Fizzbuzz(15, 3, 5)).toEqual('FizzBuzz');
      expect(Fizzbuzz(14, 2, 7)).toEqual('FizzBuzz');
      expect(Fizzbuzz(30, 3, 5)).toEqual('FizzBuzz');
    });

    it('should return both words if number is a multiple of fizzNumber and buzzNumber', function () {
      expect(Fizzbuzz(15, 3, 5, 'Zig', 'Zag')).toEqual('ZigZag');
      expect(Fizzbuzz(15, 3, 5, 'Hello', 'World')).toEqual('HelloWorld');
    });
  });

  describe('Feature 3', () => {
    const fizzConfig = {
      word: 'Fizz',
      fn: isInbetween,
      params: [
        10,
        20,
      ],
    };

    const buzzConfig = {
      word: 'Buzz',
      fn: isDivisibleBy,
      params: [5],
    };

    it('should print Fizz if the number is between 10 and 20', function () {
      expect(FizzbuzzNew(17, fizzConfig, buzzConfig)).toEqual('Fizz');
    });

    it('should print "9" if the number is not between 10 and 20', function () {
      expect(FizzbuzzNew(9, fizzConfig, buzzConfig)).toEqual('9');
    });

    it('should print Fizz if the number is between 10 and 20, and Buzz if the number is divisible by 5', function () {
      expect(FizzbuzzNew(30, fizzConfig, buzzConfig)).toEqual('Buzz');
    });

    it('should print FizzBuzz if inputNumber is divisible by 5 and between 10 and 20', function () {
      expect(FizzbuzzNew(15, fizzConfig, buzzConfig)).toEqual('FizzBuzz');
    });

    it('should print Buzz if the number is between 18 and 28', function () {
      const buzzConfig = {
        word: 'Buzz',
        fn: isInbetween,
        params: [
          18,
          28,
        ],
      };
      expect(FizzbuzzNew(26, fizzConfig, buzzConfig)).toEqual('Buzz');
      expect(FizzbuzzNew(5, fizzConfig, buzzConfig)).toEqual('5');
    });

    it('should print FizzBuzz if inputNumber is between 18 and 20', function () {
      const buzzConfig = {
        word: 'Buzz',
        fn: isInbetween,
        params: [
          18,
          28,
        ],
      };

      expect(FizzbuzzNew(19, fizzConfig, buzzConfig)).toEqual('FizzBuzz');
    });
  });
});
