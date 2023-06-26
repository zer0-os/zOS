// The general problem is to write a program that prints the numbers
// from 1 to 100. But for multiples of three print “Fizz” instead of
// the number and for the multiples of five print “Buzz”. For numbers which
// are multiples of both three and five print “FizzBuzz”. The first five printed values would look like: "1, 2, Fizz, 4, Buzz".
// Initial request
// For our purposes, write a function that takes an integer and returns the appropriate FizzBuzz string: fizzbuzz(int) string

// describing the test what outcome we want

export const Fizzbuzz = (num: number) => {
  if (num % 3 === 0 && num % 5 === 0) {
    return 'FizzBuzz';
  } else if (num % 5 === 0) {
    return 'Buzz';
  } else if (num % 3 === 0) {
    return 'Fizz';
  }

  return num.toString();
};

describe('Fizzbuzz', () => {
  it('should return a number as a string', function () {
    expect(Fizzbuzz(1)).toEqual('1');
  });

  it('should "2" if number passed is 2', function () {
    expect(Fizzbuzz(2)).toEqual('2');
  });

  it('should return "Fizz" if number is equal to 3', function () {
    expect(Fizzbuzz(3)).toEqual('Fizz');
  });

  it('should return "Buzz" if number is equal to 5', function () {
    expect(Fizzbuzz(5)).toEqual('Buzz');
  });

  it('should return "FizzBuzz" if number is a multiple of 3 and 5', function () {
    expect(Fizzbuzz(15)).toEqual('FizzBuzz');
  });

  it('should return "Fizz" if number is equal to 6 (multiple of 3)', function () {
    expect(Fizzbuzz(6)).toEqual('Fizz');
  });

  it('should return "Buzz" if number is equal 10 (multiple of 5)', function () {
    expect(Fizzbuzz(10)).toEqual('Buzz');
  });

  it('should return "FizzBuzz" if number is equal 30 (multiple of 3 and multiple of 5)', function () {
    expect(Fizzbuzz(30)).toEqual('FizzBuzz');
  });
});
