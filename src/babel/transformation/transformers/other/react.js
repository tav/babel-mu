import * as react from "../../helpers/react";
import * as t from "../../../types";

export function Program(node, parent, scope, file) {
  file.set("jsxIdentifierTag", t.memberExpression(t.identifier("mu"), t.identifier("Tag")));
  file.set("jsxIdentifierElem", t.memberExpression(t.identifier("mu"), t.identifier("Elem")));
}

require("../../helpers/build-react-transformer")(exports, {
  pre(state) {
    var tagName = state.tagName;
    var args    = state.args;
    if (react.isCompatTag(tagName)) {
      args.push(t.literal(tagName));
    } else {
      args.push(state.tagExpr);
    }
  },

  post(state, file) {
    var props = state.args[1];
    if (props.type === "ObjectExpression") {
      props = props.properties;
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (prop.key.name === "class") {
          prop.key.name = "className";
        }
      }
    }
    if (react.isCompatTag(state.tagName)) {
      state.callee = file.get("jsxIdentifierTag");
    } else {
      state.callee = file.get("jsxIdentifierElem");
    }
  }
});
