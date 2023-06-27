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

export const Fizzbuzz = (inputNumber: number, fizzNumber: number = 3, buzzNumber: number = 5) => {
  if (inputNumber % fizzNumber === 0 && inputNumber % buzzNumber === 0) {
    return 'FizzBuzz';
  } else if (inputNumber % buzzNumber === 0) {
    return 'Buzz';
  } else if (inputNumber % fizzNumber === 0) {
    return 'Fizz';
  }

  return inputNumber.toString();
};

describe('Fizzbuzz', () => {
  it('should return a number as a string', function () {
    expect(Fizzbuzz(1)).toEqual('1');
  });

  // FIZZ TESTS
  it('should return "Fizz" if inputNumber is equal to fizzNumber', function () {
    expect(Fizzbuzz(3, 3)).toEqual('Fizz');
    expect(Fizzbuzz(6, 3)).toEqual('Fizz');
    expect(Fizzbuzz(2, 2)).toEqual('Fizz');
    expect(Fizzbuzz(4, 2)).toEqual('Fizz');
  });

  // BUZZ TESTS
  it('should return "Buzz" if inputNumber is equal to buzzNumber', function () {
    expect(Fizzbuzz(5, 0, 5)).toEqual('Buzz');
    expect(Fizzbuzz(10, 0, 5)).toEqual('Buzz');
    expect(Fizzbuzz(7, 0, 7)).toEqual('Buzz');
  });

  // FIZZBUZZ TESTS
  it('should return "FizzBuzz" if number is a multiple of fizzNumber and buzzNumber', function () {
    expect(Fizzbuzz(15, 3, 5)).toEqual('FizzBuzz');
    expect(Fizzbuzz(14, 2, 7)).toEqual('FizzBuzz');
    expect(Fizzbuzz(30, 3, 5)).toEqual('FizzBuzz');
  });
});
