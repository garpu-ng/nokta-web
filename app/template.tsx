// Remounts on every navigation → replays the fade-in for the incoming page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="nk-page-fade">{children}</div>;
}
