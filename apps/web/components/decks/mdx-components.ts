import {
  BenefitGrid,
  BulletList,
  ChipGrid,
  ContrastGrid,
  DataCell,
  DataGrid,
  FlowMap,
  Lead,
  Logo,
  LogoWall,
  MdxA,
  MdxBlockquote,
  MdxH1,
  MdxH2,
  MdxH3,
  MdxHr,
  MdxLi,
  MdxOl,
  MdxP,
  MdxStrong,
  MdxTable,
  MdxTbody,
  MdxTd,
  MdxTh,
  MdxThead,
  MdxTr,
  MdxUl,
  MiniMatrix,
  PersonaGrid,
  PhaseTimeline,
  PrizePodium,
  Ready,
  Rule,
  SlideTitle,
  SponsorTier,
  Stat,
  StatRow,
  Timeline,
  TimelineRow,
  TrackCard,
  Wordmark,
} from "./slide-components";

/**
 * The closed vocabulary injected into every slide. A slide cannot `import`, so
 * this map is the whole surface area available to deck authors — which is what
 * keeps the chrome unbreakable and stops one slide from pulling in a library.
 *
 * Adding a component here is a deliberate widening of the system; prefer
 * composing what already exists.
 */
export const mdxComponents = {
  // structure and text
  SlideTitle,
  Lead,
  Wordmark,
  Ready,
  Rule,
  // data and numbers
  Stat,
  StatRow,
  DataGrid,
  DataCell,
  MiniMatrix,
  PrizePodium,
  // the commercial offer
  SponsorTier,
  BenefitGrid,
  ContrastGrid,
  FlowMap,
  PersonaGrid,
  // event
  TrackCard,
  Timeline,
  TimelineRow,
  PhaseTimeline,
  // logos
  Logo,
  LogoWall,
  // lists
  BulletList,
  ChipGrid,
  // markdown base
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  p: MdxP,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  strong: MdxStrong,
  a: MdxA,
  hr: MdxHr,
  blockquote: MdxBlockquote,
  table: MdxTable,
  thead: MdxThead,
  tbody: MdxTbody,
  tr: MdxTr,
  th: MdxTh,
  td: MdxTd,
};
