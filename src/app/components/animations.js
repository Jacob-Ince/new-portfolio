// Glitch animation for navbar logo
// Randomly cycles characters through special characters to create a glitch effect

const SPECIAL_CHARS = [
  "!",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "{",
  "}",
  "/",
  "<",
  ">",
  "~",
  "`",
  "-",
  "_",
  "=",
  "+",
  ":",
  ";",
  '"',
  "'",
  "0",
];

/**
 * Creates a glitch effect on the navbar logo by randomly replacing characters
 * @param {HTMLElement} element - The element containing the text to glitch
 * @param {string} originalText - The original text to restore
 * @param {Object} styles - CSS module styles object
 * @param {Object} options - Animation options
 */
export function createLogoGlitch(element, originalText, styles, options = {}) {
  const {
    minInterval = 3000, // Minimum time between glitches (ms)
    maxInterval = 8000, // Maximum time between glitches (ms)
    glitchDuration = 150, // How long each glitch lasts (ms)
    glitchCycles = 3, // Number of character swaps per glitch
    intensity = 0.3, // Probability of each character being replaced (0-1)
  } = options;

  let glitchTimeout;
  let isGlitching = false;

  function getRandomChar() {
    return SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];
  }

  function glitch() {
    if (isGlitching) return;

    // Don't glitch if element is being hovered (has hovering class)
    const hoveringClass = styles?.hovering || "hovering";
    if (element.classList.contains(hoveringClass)) {
      return;
    }

    isGlitching = true;

    // Try multiple ways to find the text element
    const originalTextClass = styles?.originalText || "originalText";
    const textElement =
      element.querySelector(`.${originalTextClass}`) ||
      element.querySelector('[class*="originalText"]') ||
      element.querySelector("span");

    if (!textElement) {
      isGlitching = false;
      return;
    }

    // Store the original width of the parent element to prevent layout shifts
    const originalElementWidth = element.offsetWidth;
    const originalElementMinWidth = element.style.minWidth;

    // Set a fixed width on the parent element to prevent layout shifts
    element.style.minWidth = `${originalElementWidth}px`;

    // Store current text in case it's been modified
    const currentText = textElement.textContent;
    const originalChars = originalText.split("");
    let cycleCount = 0;

    const glitchInterval = setInterval(() => {
      // Check if element is being hovered - if so, stop glitching
      const hoveringClass = styles?.hovering || "hovering";
      if (element.classList.contains(hoveringClass)) {
        clearInterval(glitchInterval);
        textElement.textContent = originalText;
        // Restore original min-width
        element.style.minWidth = originalElementMinWidth || "";
        isGlitching = false;
        return;
      }

      // Create glitched version
      const glitchedChars = originalChars.map((char, index) => {
        // Skip spaces and dots
        if (char === " " || char === ".") return char;

        // Randomly replace characters based on intensity
        if (Math.random() < intensity) {
          return getRandomChar();
        }
        return char;
      });

      textElement.textContent = glitchedChars.join("");

      cycleCount++;
      if (cycleCount >= glitchCycles) {
        clearInterval(glitchInterval);

        // Restore original text and remove fixed width
        setTimeout(() => {
          const hoveringClass = styles?.hovering || "hovering";
          if (!element.classList.contains(hoveringClass)) {
            textElement.textContent = originalText;
          }
          // Restore original min-width
          element.style.minWidth = originalElementMinWidth || "";
          isGlitching = false;
        }, 50);
      }
    }, glitchDuration / glitchCycles);
  }

  function scheduleNextGlitch() {
    const delay = Math.random() * (maxInterval - minInterval) + minInterval;
    glitchTimeout = setTimeout(() => {
      glitch();
      scheduleNextGlitch();
    }, delay);
  }

  // Start the glitch cycle
  scheduleNextGlitch();

  // Trigger an initial glitch after a short delay to show it's working
  setTimeout(() => {
    glitch();
  }, 500);

  // Return cleanup function
  return () => {
    if (glitchTimeout) {
      clearTimeout(glitchTimeout);
    }
    isGlitching = false;
  };
}
