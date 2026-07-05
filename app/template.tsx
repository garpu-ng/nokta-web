// Remounts on every navigation → replays the fade-in for incoming branch
// content, in step with the colour reveal.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="nk-page-fade">{children}</div>;
}
