export const rubrics = [
  {
    key: "rubric_dpx84t1s84uv",
    url: "https://docs.google.com/document/d/1iRZyFPy1ZVn9Vb0BkRPcxuIvZ120s1be0_pg5TSLzPI/edit?tab=t.dpx84t1s84uv",
  },
  {
    key: "rubric_67ya8w23xfvw",
    url: "https://docs.google.com/document/d/1iRZyFPy1ZVn9Vb0BkRPcxuIvZ120s1be0_pg5TSLzPI/edit?tab=t.67ya8w23xfvw",
  },
  {
    key: "rubric_97yj2otfq9gx",
    url: "https://docs.google.com/document/d/1iRZyFPy1ZVn9Vb0BkRPcxuIvZ120s1be0_pg5TSLzPI/edit?tab=t.97yj2otfq9gx",
  },
  {
    key: "rubric_sxqvwprjg3pm",
    url: "https://docs.google.com/document/d/1iRZyFPy1ZVn9Vb0BkRPcxuIvZ120s1be0_pg5TSLzPI/edit?tab=t.sxqvwprjg3pm",
  },
  {
    key: "rubric_ecxm19ugthah",
    url: "https://docs.google.com/document/d/1iRZyFPy1ZVn9Vb0BkRPcxuIvZ120s1be0_pg5TSLzPI/edit?tab=t.ecxm19ugthah",
  },
] as const;

export type RubricKey = (typeof rubrics)[number]["key"];

