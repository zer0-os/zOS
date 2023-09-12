// The general problem is to write a program that prints the numbers
// from 1 to 100. But for multiples of three print “Fizz” instead of
// the number and for the multiples of five print “Buzz”. For numbers which
// are multiples of both three and five print “FizzBuzz”. The first five printed values would look like: "1, 2, Fizz, 4, Buzz".
// Initial request
// For our purposes, write a function that takes an integer and returns the appropriate FizzBuzz string: fizzbuzz(int) string

import { FizzbuzzNew } from './dummy-file';

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

//Feature request 4
// Allow me to send in an arbitrary list rather than just assuming there are 2 configs. Eg: “Fizz" "Buzz" "Boop”.
// When multiple matches are made (such as FizzBoop) they should be
// printed in the order that they were in the list. Ex: fizzbuzz(int, []definitions)

// Where we are declaring the helper functions
const isDivisibleBy = (inputNumber: number, factor: number) => inputNumber % factor === 0;
const isInbetween = (inputNumber: number, startNumber: number, endNumber: number) =>
  inputNumber > startNumber && inputNumber < endNumber;

describe('Fizzbuzz', () => {
  it('should return a number as a string when neither condition matches', function () {
    expect(
      FizzbuzzNew(1, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
      ])
    ).toEqual('1');
  });

  it('should return first word if inputNumber is equal to fizzNumber', function () {
    expect(
      FizzbuzzNew(3, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
      ])
    ).toEqual('Fizz');
    expect(
      FizzbuzzNew(3, [
        divisibleBy(3, 'Zig'),
        divisibleBy(5, 'Buzz'),
      ])
    ).toEqual('Zig');
  });

  it('should return second word if inputNumber is equal to buzzNumber', function () {
    expect(
      FizzbuzzNew(5, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
      ])
    ).toEqual('Buzz');
    expect(
      FizzbuzzNew(5, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Zag'),
      ])
    ).toEqual('Zag');
  });

  it('should return "FizzBuzz" if number is a multiple of fizzNumber and buzzNumber', function () {
    expect(
      FizzbuzzNew(15, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
      ])
    ).toEqual('FizzBuzz');
    expect(
      FizzbuzzNew(15, [
        divisibleBy(3, 'Zig'),
        divisibleBy(5, 'Zag'),
      ])
    ).toEqual('ZigZag');
  });

  it('should return third word if third condition matches', function () {
    expect(
      FizzbuzzNew(7, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
        divisibleBy(7, 'Boop'),
      ])
    ).toEqual('Boop');
  });

  it('should return FizzBuzzBoop if all conditions match', function () {
    expect(
      FizzbuzzNew(105, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
        divisibleBy(7, 'Boop'),
      ])
    ).toEqual('FizzBuzzBoop');
  });

  it('should return FizzBoop if  first condition and third condition match', function () {
    expect(
      FizzbuzzNew(21, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
        divisibleBy(7, 'Boop'),
      ])
    ).toEqual('FizzBoop');
  });

  it('should return BuzzBoop if  second condition and third condition match', function () {
    expect(
      FizzbuzzNew(35, [
        divisibleBy(3, 'Fizz'),
        divisibleBy(5, 'Buzz'),
        divisibleBy(7, 'Boop'),
      ])
    ).toEqual('BuzzBoop');
  });
});

describe('isDivisbleBy', () => {
  it('should return true if inputNumber is divisble by factor', function () {
    expect(isDivisibleBy(3, 3)).toEqual(true);
    expect(isDivisibleBy(30, 3)).toEqual(true);
  });

  it('should return false if inputNumber is not divisble by factor', function () {
    expect(isDivisibleBy(2, 3)).toEqual(false);
    expect(isDivisibleBy(4, 3)).toEqual(false);
  });
});

describe('isInbetween', () => {
  it('should return true if inputNumber is inbetween startNumber and endNumber', function () {
    expect(isInbetween(17, 10, 20)).toEqual(true);
    expect(isInbetween(11, 10, 20)).toEqual(true);
    expect(isInbetween(19, 10, 20)).toEqual(true);
  });

  it('should return false if inputNumber is not inbetween startNumber and endNumber', function () {
    expect(isInbetween(8, 10, 20)).toEqual(false);
    expect(isInbetween(10, 10, 20)).toEqual(false);
    expect(isInbetween(20, 10, 20)).toEqual(false);
    expect(isInbetween(25, 10, 20)).toEqual(false);
  });
});

// Heplper
const divisibleBy = (factor: number, word: string) => ({
  word,
  fn: isDivisibleBy,
  params: [factor],
});
