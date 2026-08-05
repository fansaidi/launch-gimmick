// Both apps are deployed on the same GitHub Pages site (see
// .github/workflows/main.yml) - builder at the root, player under
// /player/. Building the URL from the current origin means this keeps
// working if the site's custom domain ever changes, without needing an
// env var just for this.
export function playerUrlForFlow(flowId: string) {
  return `${window.location.origin}/launch-gimmick/player/?flow=${flowId}`
}
