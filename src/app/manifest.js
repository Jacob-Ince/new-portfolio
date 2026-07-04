export default function manifest() {
  return {
    name: "jac.ob — Jacob Ince",
    short_name: "jac.ob",
    description:
      "Portfolio of Jacob Ince, a London-based front-end developer creating interactive web experiences across development, design, motion, and 3D.",
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
