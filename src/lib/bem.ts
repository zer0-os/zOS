export function bem(block: string) {
  return (element, modifier = '') => fullBem(block, element, modifier);
}

export function bemClassName(block: string) {
  return (element = '', modifier = '') => {
    return { className: fullBem(block, element, modifier) };
  };
}

function fullBem(block: string, element = '', modifier = '') {
  let result = block;
  if (element) {
    result += `__${element}`;
  }
  if (modifier) {
    result += ` ${result}--${modifier}`;
  }

  return result;
}
