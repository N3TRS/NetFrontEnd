export interface Participant {
  email: string;
}

interface ParticipantAvatarsProps {
  participants: Participant[];
  max?: number;
}

const AVATAR_COLORS = ["#7C3AED", "#F97316", "#2563EB", "#16A34A"];

function initials(email: string): string {
  const local = email.split("@")[0] || email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "??";
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function ParticipantAvatars({
  participants,
  max = 4,
}: ParticipantAvatarsProps) {
  const shown = participants.slice(0, max);
  const overflow = Math.max(0, participants.length - shown.length);

  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <div
          key={p.email}
          title={p.email}
          aria-label={p.email}
          className="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-secondary"
          style={{
            backgroundColor:
              AVATAR_COLORS[hash(p.email) % AVATAR_COLORS.length],
            marginLeft: i === 0 ? 0 : -8,
          }}
        >
          {initials(p.email)}
        </div>
      ))}
      {overflow > 0 ? (
        <div
          className="grid size-6 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-white ring-2 ring-secondary"
          style={{ marginLeft: shown.length === 0 ? 0 : -8 }}
          aria-label={`${overflow} more participants`}
        >
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
