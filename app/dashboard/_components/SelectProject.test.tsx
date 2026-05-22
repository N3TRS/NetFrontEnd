import { fireEvent, render, screen } from "@testing-library/react";
import type { GithubRepo } from "../_types/github-repo";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const refetchMock = jest.fn();
let githubState = {
  repos: [] as GithubRepo[],
  loading: false,
  error: null as string | null,
  refetch: refetchMock,
};
jest.mock("../_hooks/useGithubRepos", () => ({
  useGithubRepos: () => ({ ...githubState }),
}));

const setProjectUrlMock = jest.fn();
jest.mock("@/app/_contexts/ProjectContext", () => ({
  useProject: () => ({ projectUrl: null, setProjectUrl: setProjectUrlMock }),
}));

const javaRepo: GithubRepo = {
  id: 1,
  name: "java-app",
  full_name: "user/java-app",
  description: null,
  language: "Java",
  stargazers_count: 0,
  forks_count: 0,
  html_url: "https://github.com/user/java-app",
  clone_url: "",
  private: false,
  updated_at: "",
};

const tsRepo: GithubRepo = {
  ...javaRepo,
  id: 2,
  name: "ts-app",
  language: "TypeScript",
  html_url: "https://github.com/user/ts-app",
};

beforeEach(() => {
  jest.clearAllMocks();
  githubState = { repos: [], loading: false, error: null, refetch: refetchMock };
});

import SelectProject from "./SelectProject";

const baseProps = {
  open: true,
  onClose: jest.fn(),
  token: "tk",
  onRepoSelected: jest.fn(),
};

describe("SelectProject", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<SelectProject {...baseProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders title when open", () => {
    render(<SelectProject {...baseProps} />);
    expect(screen.getByText("Seleccionar Repositorio")).toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked and resets state", () => {
    render(<SelectProject {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Cerrar modal"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when X button clicked", () => {
    render(<SelectProject {...baseProps} />);
    const xBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(xBtn);
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("shows loading skeleton when loading=true", () => {
    githubState = { ...githubState, loading: true };
    const { container } = render(<SelectProject {...baseProps} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error and retry button when error present", () => {
    githubState = { ...githubState, error: "No se pudo conectar" };
    render(<SelectProject {...baseProps} />);
    expect(screen.getByText("No se pudo conectar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
  });

  it("calls refetch on Reintentar click", () => {
    githubState = { ...githubState, error: "err" };
    render(<SelectProject {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("calls refetch on refresh icon click", () => {
    render(<SelectProject {...baseProps} />);
    fireEvent.click(screen.getByTitle("Actualizar"));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("filters Java repos by default", () => {
    githubState = { ...githubState, repos: [javaRepo, tsRepo] };
    render(<SelectProject {...baseProps} />);
    expect(screen.getByText("java-app")).toBeInTheDocument();
    expect(screen.queryByText("ts-app")).toBeNull();
  });

  it("filters by search query", () => {
    githubState = { ...githubState, repos: [javaRepo, { ...javaRepo, id: 3, name: "other-java" }] };
    render(<SelectProject {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar repositorio/i), {
      target: { value: "other" },
    });
    expect(screen.getByText("other-java")).toBeInTheDocument();
    expect(screen.queryByText("java-app")).toBeNull();
  });

  it("calls setProjectUrl and routes on repo select", () => {
    githubState = { ...githubState, repos: [javaRepo] };
    render(<SelectProject {...baseProps} />);
    fireEvent.click(screen.getByText("java-app"));
    expect(setProjectUrlMock).toHaveBeenCalledWith(javaRepo.html_url);
    expect(pushMock).toHaveBeenCalledWith("running");
    expect(baseProps.onRepoSelected).toHaveBeenCalledWith(javaRepo);
  });

  it("shows repo count", () => {
    githubState = { ...githubState, repos: [javaRepo] };
    render(<SelectProject {...baseProps} />);
    expect(screen.getByText(/1 repositorio/)).toBeInTheDocument();
  });
});
