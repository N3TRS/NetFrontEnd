import { fireEvent, render, screen } from "@testing-library/react";
import GithubRepoCard from "./GithubRepoCard";
import type { GithubRepo } from "../_types/github-repo";

const repo: GithubRepo = {
  id: 1,
  name: "my-repo",
  full_name: "user/my-repo",
  description: null,
  language: "Java",
  stargazers_count: 0,
  forks_count: 0,
  html_url: "",
  clone_url: "",
  private: true,
  updated_at: "",
};

describe("GithubRepoCard", () => {
  it("renders repo name + language", () => {
    render(<GithubRepoCard repo={repo} onSelect={jest.fn()} />);
    expect(screen.getByText("my-repo")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("calls onSelect with repo", () => {
    const cb = jest.fn();
    render(<GithubRepoCard repo={repo} onSelect={cb} />);
    fireEvent.click(screen.getByRole("button"));
    expect(cb).toHaveBeenCalledWith(repo);
  });

  it("hides language when null", () => {
    render(<GithubRepoCard repo={{ ...repo, language: null }} onSelect={jest.fn()} />);
    expect(screen.queryByText("Java")).toBeNull();
  });

  it("falls back to gray dot for unknown language", () => {
    const { container } = render(
      <GithubRepoCard repo={{ ...repo, language: "Brainfuck" }} onSelect={jest.fn()} />,
    );
    expect(container.querySelector(".bg-gray-400")).toBeInTheDocument();
  });
});
