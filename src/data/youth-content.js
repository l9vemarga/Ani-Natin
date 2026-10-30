// Words and slots on the Youth in Agri page, in the order of the final design:
//   video block, "Agri-Success Stories" + diagram, GREEN Zone (text, arch photo, photo strip), VermiTea Kit,
//   "But wait... There's more!" (expanding frames: the three partner stories), and the closing question.
// The headlines and labels are from the design and the worksheet (Youth in Agri Page). The short paragraphs are
// DRAFT copy written only from what the worksheet says; the team should replace them with the real stories (list in
// ASSETS.md). <strong> is allowed in the strings named "html", "body" and "columns".

// The lime block at the top ("Video Embed of Video Feature"). Add public/videos/youth/feature.mp4 for a video that
// the visitor starts, or set youtubeId for an embedded video. A poster image is optional.
export const hero = {
  label: 'Video Feature: CNHS GREEN Zone and VermiTea research',
  video: 'youth/feature.mp4',
  poster: 'youth/feature-poster.webp',
  youtubeId: '',
};

export const intro = {
  title: ['Agri-', 'Success', 'Stories'],
  sub: 'From young pioneers, alumni, and students just like you!',
  // the diagram: each branch links to its story (the ones with a `frame` also open that frame)
  tree: [
    {
      label: 'CNHS',
      items: [
        { label: 'GREEN Zone', href: '#green-zone' },
        { label: 'VERMI Kit', href: '#vermitea' },
      ],
    },
    {
      label: 'Young Pioneers',
      items: [
        { label: '4-H Club', href: '#more', frame: '4h' },
        { label: 'SEED PH', href: '#more', frame: 'seed' },
        { label: 'DA-ATI', href: '#more', frame: 'da-ati' },
      ],
    },
  ],
};

export const greenZone = {
  title: 'Mula sa bakanteng lupa sa school, ginawang award-winning Green Zone',
  body: [
    'Nagsimula ito sa isang bakanteng lupa sa loob ng school. Ngayon, ito ang <strong>GREEN Zone ng CNHS</strong>, isang award-winning na agri-hub.',
    'Dito makikita kung ano ang kayang gawin ng mga estudyante kapag binigyan ng lupa, ng gabay, at ng pagkakataong magtanim.',
  ],
  photo: { src: 'youth/green-zone.webp', alt: 'The CNHS GREEN Zone, an agri-hub grown from vacant school land' },
  // the strip of photos under it (slide sideways)
  gallery: [1, 2, 3, 4, 5].map((n) => ({ src: `youth/green-zone-${n}.webp`, alt: `The CNHS GREEN Zone, photo ${n}` })),
};

export const vermitea = {
  label: ['VermiTea', 'Kit'],
  heading: 'Paano kumikita ang mga estudyante gamit ang Starter Vermi Kit?',
  columns: [
    'Ang <strong>VermiTea</strong> ay organic fertilizer na gawa sa vermicompost. Sa Agri-Fishery, natututuhan ng mga estudyante kung paano ito gawin, para makatipid sila sa sariling pananim at maibenta pa sa iba.',
    'Ang branded <strong>VermiTea Kit</strong> ng Ani Natin ay resellable student kit na nagpapakilala ng primary agribusiness concepts at nagtataguyod ng sustainable farming.',
  ],
  photo: { src: 'youth/vermitea-kit.webp', alt: 'The Ani Natin VermiTea Fertilizer Kit, a cardboard carry box' },
};

// "But wait... There's more!": the expanding frames. 4-H is open first (the big frame), SEED is the tall frame next to
// it and DA-ATI peeks out from behind it; pressing a tall frame opens it. On phones they stack as an accordion.
export const more = {
  title: ['But wait...', "There's more!"],
  frames: [
    {
      id: '4h',
      name: '4-H Club Philippines',
      tone: 'yellow',
      title: 'Sama-sama sa bawat probinsya: sumali sa Youth Agri Clubs!',
      body: ['Alamin kung paano sumali sa <strong>4-H Club Philippines</strong> at makasama ang ibang kabataang gustong matuto at magtagumpay sa agrikultura, sa bawat probinsya.'],
      photo: { src: 'youth/4h-club.webp', alt: 'Members of a 4-H youth agri club' },
    },
    {
      id: 'seed',
      name: 'SEED Philippines',
      tone: 'pale',
      title: 'Gawa sa classroom, pwedeng ibenta sa market at supermarkets!',
      body: ['Mula sa mga proyektong ginawa sa classroom, may mga produktong pwedeng ibenta sa market at sa mga supermarket. Alamin ang kuwento ng <strong>SEED Philippines</strong>.'],
      photo: { src: 'youth/seed-philippines.webp', alt: 'A student product from SEED Philippines' },
    },
    {
      id: 'da-ati',
      name: 'DA-ATI',
      tone: 'green',
      title: 'Modern equipment, libreng trainings, at scholarships para sa kabataan',
      body: ['Alamin kung anong tulong ang puwedeng makuha mula sa <strong>DA-ATI</strong>: modern equipment, libreng trainings, at scholarships para sa kabataang gustong pumasok sa agrikultura.'],
      photo: { src: 'youth/da-ati.webp', alt: 'Youth learning to use modern farm tools at a DA-ATI training' },
    },
  ],
};

export const callout = {
  title: 'May gusto ka bang itanong tungkol sa Agri-Fishery Elective?',
  button: 'Proceed to Student Forum',
  href: '/community',
};
