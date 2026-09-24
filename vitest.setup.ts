import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// tells Vitest to run this after every test
// unmounts anything RTL rendered after every single test in entire suite
afterEach(() => {
  cleanup();
});
