export function bem(block: string) {
  return (element, modifier = '') => {
    let result = block;
    if (element) {
      result += `__${element}`;
    }
    if (modifier) {
      result += ` ${result}--${modifier}`;
    }

    return result;
  };
}
