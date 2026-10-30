interface ModifierList {
  [key: string]: boolean;
}

const modifiersToClassList = (modifierList: string | string[], styles: { [key: string]: string }): ModifierList => {
  const modifiers: ModifierList = {};
  const modifierMap = typeof modifierList === 'string' ? modifierList.split(',') : modifierList;
  modifierMap.map(modifier => {
    if (styles) {
      modifiers[styles[`--${modifier}`]] = true;
    } else {
      modifiers[`--${modifier}`] = true;
    }
  });
  return modifiers;
};

export default modifiersToClassList;
