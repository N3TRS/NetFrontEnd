import { render, screen } from "@testing-library/react";
import { ParticipantAvatars, type Participant } from "./ParticipantAvatars";

function p(email: string): Participant {
  return { email };
}

describe("ParticipantAvatars", () => {
  it("renders initials for each participant", () => {
    render(<ParticipantAvatars participants={[p("alice.smith@x.io"), p("bob@x.io")]} />);
    expect(screen.getByLabelText("alice.smith@x.io")).toHaveTextContent("AS");
    expect(screen.getByLabelText("bob@x.io")).toHaveTextContent("BO");
  });

  it("shows overflow indicator when participants exceed max", () => {
    const list = ["a", "b", "c", "d", "e", "f"].map((x) => p(`${x}@x.io`));
    render(<ParticipantAvatars participants={list} max={4} />);
    expect(screen.getByLabelText("2 more participants")).toHaveTextContent("+2");
  });

  it("does not show overflow when within limit", () => {
    render(<ParticipantAvatars participants={[p("a@x.io")]} />);
    expect(screen.queryByLabelText(/more participants/)).toBeNull();
  });

  it("falls back to first two chars when no separators", () => {
    render(<ParticipantAvatars participants={[p("xy@x.io")]} />);
    expect(screen.getByLabelText("xy@x.io")).toHaveTextContent("XY");
  });
});
