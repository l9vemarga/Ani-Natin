// Words on the About page. The headline, background paragraph and the three objectives are from the design;
// the vision is from the worksheet (Mission & Vision). <strong> is allowed in the strings that say "html".

export const background =
  'The <strong>Ani Natin Project</strong> was created by multimedia arts students to address the rural exodus and support public high schools in <strong>promoting the Agri-Fishery Arts Elective</strong>!';

// media: what the stage under the cards shows while that card is hovered, focused or tapped.
//   image: file in public/images/about/ (WebP or JPG)      video: file in public/videos/about/ (MP4)
// The files do not exist yet, so a labeled placeholder shows. Add the file with the name below and it is used
// (no code change). See ASSETS.md.
export const objectives = [
  {
    id: 'inform',
    label: 'Inform',
    tone: 'orange',
    html: '<strong>Inform</strong> high school students about modern agribusiness opportunities and sustainable practices through a <strong>Video Feature</strong> highlighting CNHS&rsquo;s GREEN Zone and Research on VermiTea.',
    media: {
      image: 'about/objective-inform.webp',
      video: 'about/objective-inform.mp4',
      caption: 'Video Feature: CNHS GREEN Zone and VermiTea research',
      alt: 'A still from the Video Feature about the CNHS GREEN Zone and the research on VermiTea',
    },
  },
  {
    id: 'provide',
    label: 'Provide',
    tone: 'green',
    html: '<strong>Provide</strong> an Informational Website that reframes agricultural education into a high-value career path by showcasing student research, career trajectories, and youth-led initiatives (e.g., 4-H Club, SEED Philippines).',
    media: {
      image: 'about/objective-provide.webp',
      caption: 'The Ani Natin website',
      alt: 'The Ani Natin website shown on a laptop and a phone',
    },
  },
  {
    id: 'create',
    label: 'Create',
    tone: 'orange',
    html: '<strong>Create</strong> a branded resellable student VermiTea Kit&mdash;to introduce primary agribusiness concepts to students and promote sustainable farming.',
    media: {
      image: 'about/objective-create.webp',
      caption: 'The branded VermiTea Kit',
      alt: 'The branded Ani Natin VermiTea Kit',
    },
  },
];

export const missionVision = {
  mission:
    'To empower incoming SHS students by providing accessible track overviews, career pathway guides, and agri-fishery arts stories that demonstrate the true possibilities of Agri-Fishery.',
  vision:
    'A future where agriculture is seen as a viable career choice in the country, public high schools are equipped to effectively promote Agri-Fishery Arts, and young Filipinos are encouraged to choose agricultural education as a practical, modern, and rewarding path.',
};
