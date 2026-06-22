import { describe, expect, test, afterEach } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import LessonView from "../../mainview/components/LessonView";
import { mockFetch, restoreFetch } from "./mock-fetch";

const mockContent = `# Introduction

Welcome to the lesson.

## Chapter 1

First chapter content.

### Section 1.1

Details here.

## Chapter 2

Second chapter.`;

const defaultProps = {
  courseId: "test",
  module: { id: 1, name: "Intro Module", timeHours: 2, prerequisites: [], topics: [] },
  onStartQuiz: () => {},
};

afterEach(restoreFetch);

function mockAll(opts?: { content?: string }) {
  mockFetch({
    "/api/storage/bookmarks/module": [],
    "/api/storage/highlights": [],
    "/lesson": opts?.content ? { content: opts.content } : { content: "" },
    "/sections": [],
    "/notes": [],
  });
}

describe("LessonView snapshots", () => {
  test("loading state", () => {
    mockAll();
    const { container } = render(<LessonView {...defaultProps} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  test("content loaded", async () => {
    mockAll({ content: mockContent });
    const { container } = render(<LessonView {...defaultProps} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Introduction")
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
