for (var ID,
         SEQ = OBJECT,
         IS_ARRAY = Array.isArray(SEQ),
         I_INDEX = 0,
         J_INDEX,
         ITERATOR = !IS_ARRAY && SEQ[Symbol.iterator]();;) {
  if (IS_ARRAY) {
    if (I_INDEX >= SEQ.length) break;
    ID = SEQ[I_INDEX++];
  } else {
    J_INDEX = ITERATOR.next();
    if (J_INDEX.done) break;
    ID = J_INDEX.value;
  }
}
