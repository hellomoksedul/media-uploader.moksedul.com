import { describe, expect, it } from "vitest";
import { formatSize, getExtension } from "./media-helpers";

describe("formatSize", () => {
  it("returns '0 B' for zero / falsy / negative sizes", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(-100)).toBe("0 B");
    expect(formatSize(NaN)).toBe("0 B");
  });

  it("scales into the right unit and rounds to one decimal", () => {
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(1024)).toBe("1 KB");
    expect(formatSize(1536)).toBe("1.5 KB");
    expect(formatSize(1024 * 1024)).toBe("1 MB");
    expect(formatSize(5 * 1024 * 1024 * 1024)).toBe("5 GB");
  });
});

describe("getExtension", () => {
  it("returns the uppercased extension", () => {
    expect(getExtension("photo.jpg")).toBe("JPG");
    expect(getExtension("archive.tar.gz")).toBe("GZ");
    expect(getExtension("Report.PDF")).toBe("PDF");
  });

  it("returns 'FILE' when there is no extension", () => {
    expect(getExtension("README")).toBe("FILE");
  });
});
