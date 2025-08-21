/**
 * Font fallback system for when Google Fonts fails to load
 * This provides a robust font stack that degrades gracefully
 */

export const fontStacks = {
  sans: [
    "var(--font-geist-sans)",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "Roboto",
    "'Helvetica Neue'",
    "Arial",
    "sans-serif"
  ].join(", "),
  
  mono: [
    "var(--font-geist-mono)",
    "ui-monospace",
    "'Cascadia Code'",
    "'Source Code Pro'",
    "Menlo",
    "Consolas",
    "'DejaVu Sans Mono'",
    "monospace"
  ].join(", ")
};

// CSS custom properties for font stacks
export const fontCustomProperties = `
  --font-stack-sans: ${fontStacks.sans};
  --font-stack-mono: ${fontStacks.mono};
`;

// Utility function to apply font stacks
export const applyFont = (type: 'sans' | 'mono') => ({
  fontFamily: fontStacks[type]
});
