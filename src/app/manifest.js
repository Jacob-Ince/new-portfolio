export default function manifest() {
  return {
    name: "jac.ob — Jacob Ince",
    short_name: "jac.ob",
    description: "A Web Development Portfolio by Jacob Ince",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#10F200",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
