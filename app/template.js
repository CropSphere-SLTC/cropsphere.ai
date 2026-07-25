// template.js REMOUNTS on every navigation (layout.js does not), which is what
// makes a CSS entrance animation replay per page. Navbar and Footer stay in
// layout.js and correctly do not move — a stable frame with only the changing
// region in motion.
export default function Template({ children }) {
  return <div className="animate-page-enter">{children}</div>;
}
