Hexx is a web-based tool for finding colors and pallettes. Using a color wheel and a range of 1-6 eyedroppers, the user can select digital colors and get their values in HEX, HSL, or RGB.

The app utilizes React states and hooks to manage the translation of user interaction into displayed data. The bulk of the app is nested in one component in order to avoid using props, which reduced performance.

The color wheel contains one primary handle, and up to five additional eyedroppers, which update a color pallette based on their location. The display itself is dynamically rendered on an HTML canvas element, which allows for flexible sizing and adjustments such as the lightness slider used here.