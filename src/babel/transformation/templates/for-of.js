for (var ID,
         IS_ARRAY = Array.isArray(OBJECT),
         I_INDEX = 0,
         J_INDEX,
         ITERATOR = !IS_ARRAY && OBJECT[Symbol.iterator]();;) {
  if (IS_ARRAY) {
    if (I_INDEX >= OBJECT.length) break;
    ID = OBJECT[I_INDEX++];
  } else {
    J_INDEX = ITERATOR.next();
    if (J_INDEX.done) break;
    ID = J_INDEX.value;
  }
}
