import PressRoller from "@/components/print/PressRoller";

// Remounts on every navigation → replays the entrance for the incoming page.
// The roller is a sibling of the page box, never a child: .nk-page-fade is
// animated, and an animated transform makes its box the containing block for
// any fixed descendant (which is also why the roller's presence flattens that
// animation to opacity — see base.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PressRoller />
      {/* id: the skip link's target. It goes on this box rather than a wrapper
          of its own — .nk-page-fade is the flex child .shell sizes, and another
          div between them would take the flex sizing away from it. */}
      <div className="nk-page-fade" id="nk-main">
        {children}
      </div>
    </>
  );
}
