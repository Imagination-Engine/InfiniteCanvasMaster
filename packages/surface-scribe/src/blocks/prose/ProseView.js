"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProseView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@tiptap/react");
const starter_kit_1 = __importDefault(require("@tiptap/starter-kit"));
const ProseView = ({ data = {} }) => {
  const content =
    data.content ||
    data.input?.payload ||
    data.params?.payload ||
    "<p>Hello Scribe!</p>";
  const editor = (0, react_1.useEditor)({
    extensions: [starter_kit_1.default],
    content,
  });
  return (0, jsx_runtime_1.jsxs)("div", {
    "data-testid": "prose-view",
    style: { border: "1px solid #ccc", padding: "1rem", minHeight: "100px" },
    children: [
      (0, jsx_runtime_1.jsx)("h3", { children: "Prose Block" }),
      (0, jsx_runtime_1.jsx)(react_1.EditorContent, {
        editor: editor,
        "data-testid": "tiptap-editor",
      }),
    ],
  });
};
exports.ProseView = ProseView;
