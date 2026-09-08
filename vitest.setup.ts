import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/* jsdom is one document shared by every test in a file. Without this, the
   second render finds the first still mounted and `getByRole` throws on
   multiple matches — a failure that reads as a bug in the component. */
afterEach(cleanup);
