import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CommonBlockView = ({ object }) => {
  const description = object.metadata.description
    ? String(object.metadata.description)
    : "No description provided.";
  return _jsxs("div", {
    className: "flex flex-col gap-3 h-full",
    children: [
      _jsx("p", {
        className: "text-[11px] text-white/60 leading-relaxed font-medium mb-3",
        children: String(description),
      }),
      _jsx("div", {
        className: "space-y-2",
        children: Object.entries(object.metadata).map(([key, val]) => {
          if (
            [
              "label",
              "description",
              "category",
              "role",
              "runtime",
              "capabilities",
            ].includes(key)
          )
            return null;
          if (typeof val === "object") return null;
          return _jsxs(
            "div",
            {
              className: "flex flex-col gap-1",
              children: [
                _jsx("span", {
                  className:
                    "text-[8px] font-black text-white/20 uppercase tracking-tighter",
                  children: key,
                }),
                _jsx("span", {
                  className: "text-[10px] text-white/80 font-mono truncate",
                  children: String(val),
                }),
              ],
            },
            key,
          );
        }),
      }),
    ],
  });
};
