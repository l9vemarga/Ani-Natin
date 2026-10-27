// Content for the Community page.
//
// Real content: the section headlines, the categories (from the Proposal and Tech Stack) and the FAQ
// answers, which are written only from what the worksheet already says about the track.
// Sample content (marked sample: true): forum topics, testimonials. Replace with real ones before launch.
// School list: see schools.json.

// Forum categories: just filters on one list (no separate pages), as in the Proposal.
export const categories = [
  { id: 'afa', label: 'Questions about AFA' },
  { id: 'school', label: 'Choosing a school' },
  { id: 'projects', label: 'Student projects' },
  { id: 'offtopic', label: 'Off-topic' },
];

export const faq = [
  {
    id: 'ano-ang-agri-fishery',
    q: 'Ano ang Agri-Fishery Elective?',
    a: 'Ang SHS Tech Pro Agri-Fishery Elective ay higit pa sa manual farming. Matututunan mo ang modern tech, applied sciences, at agribusiness, para maging handa ka sa makabagong agrikultura.',
  },
  {
    id: 'ano-ang-matututunan',
    q: 'Ano-ano ang matututunan ko dito?',
    a: 'May limang applied concepts and technologies: Hydroponics at Vertical Farming, Smart Agri-Sensors at Drones, Vermicomposting at Bio-Tech, Modern Aquaculture, at Agribusiness at Branding.',
  },
  {
    id: 'anong-trabaho',
    q: 'Anong mga trabaho ang pwede kong pasukin?',
    a: 'Tatlong branches ang career paths: Agri-Tech at Crop Science (Agri-Technologist, Soil Specialist, Farm Manager), Aquaculture at Fishery Arts (Fish Hatchery Operator, Aquaculturist, Marine Specialist), at Agribusiness at Entrepreneurship (Agri-Entrepreneur, Product Developer, Business Owner).',
  },
  {
    id: 'kailangan-ng-lupa',
    q: 'Kailangan ko ba ng malawak na lupa para mag-agri?',
    a: 'Hindi palagi. May mga paraan tulad ng hydroponics at vertical farming, na pwedeng gawin kahit walang malawak na lupa.',
  },
  {
    id: 'may-sign-up',
    q: 'Kailangan ko bang mag-sign up para magtanong?',
    a: 'Hindi. Walang sign-up o login. Nickname lang ang kailangan sa Discussion Forum, at hindi namin hinihingi ang email mo. Dumadaan sa review ang bawat post bago ito lumabas.',
  },
  {
    id: 'saan-magtanong',
    q: 'Saan ako pwedeng magtanong kung may iba pa akong gustong malaman?',
    a: 'Mag-post sa Discussion Forum sa itaas, o mag-message sa amin sa Contact page. Sasagutin ka ng Ani Natin team, mga alumni, at mga agri-pioneer.',
  },
  {
    id: 'may-agri-fishery-ba-sa-school-ko',
    q: 'Paano ko malalaman kung may Agri-Fishery sa school na malapit sa akin?',
    a: 'Gamitin ang School Locator sa ibaba ng pahinang ito. Piliin kung SHS o college, tapos ang probinsya at lungsod.',
  },
];

// Testimonials. SAMPLE placeholders: no real quotes yet. Add real ones (with the person's permission).
export const testimonials = [
  {
    id: 't1',
    quote: 'Placeholder: dito ilalagay ang totoong kuwento ng isang Agri-Fishery alumni, kasama ang pahintulot niya.',
    name: 'Pangalan ng alumni',
    role: 'Agri-Fishery alumni',
    school: 'Pangalan ng school',
    sample: true,
  },
  {
    id: 't2',
    quote: 'Placeholder: dito ilalagay ang kuwento ng isang agri-pioneer o batang negosyante sa agrikultura.',
    name: 'Pangalan ng agri-pioneer',
    role: 'Agri-pioneer',
    school: 'Pangalan ng proyekto o school',
    sample: true,
  },
  {
    id: 't3',
    quote: 'Placeholder: dito ilalagay ang sagot ng isang estudyante kung ano ang natutunan niya sa Agri-Fishery.',
    name: 'Pangalan ng estudyante',
    role: 'Estudyante sa Agri-Fishery',
    school: 'Pangalan ng school',
    sample: true,
  },
];

// Sample forum topics, used only in mock mode. daysAgo is turned into a date when the page loads.
// The replies are marked as samples too: real answers come from alumni and the team once the forum is live.
export const samplePosts = [
  {
    id: 's1',
    title: 'Ano ang pinagkaiba ng Agri-Fishery sa ibang TVL tracks?',
    category: 'afa',
    nickname: 'KabataanTala',
    body: 'Incoming Grade 10 ako at naguguluhan kung anong TVL track ang pipiliin. Ano ba talaga ang kakaiba sa Agri-Fishery?',
    daysAgo: 2,
    replies: [
      { id: 's1r1', nickname: 'Ani Natin Team', daysAgo: 2, body: 'Sa SHS Tech Pro Agri-Fishery Elective, higit sa manual farming ang matututunan mo: modern tech, applied sciences, at agribusiness.' },
      { id: 's1r2', nickname: 'KabataanTala', daysAgo: 1, body: 'Salamat po! Sample reply ito. Ang totoong mga sagot ay manggagaling sa team at sa mga alumni.' },
    ],
    sample: true,
  },
  {
    id: 's2',
    title: 'May Agri-Fishery ba sa school namin?',
    category: 'school',
    nickname: 'Mangingisda_07',
    body: 'Paano ko malalaman kung may Agri-Fishery sa school namin o sa malapit na school?',
    daysAgo: 3,
    replies: [
      { id: 's2r1', nickname: 'Ani Natin Team', daysAgo: 3, body: 'Subukan ang School Locator sa ibaba ng Community page. Piliin ang probinsya at lungsod mo.' },
    ],
    sample: true,
  },
  {
    id: 's3',
    title: 'Paano gumawa ng vermicompost sa maliit na space?',
    category: 'projects',
    nickname: 'PuhunanSaLupa',
    body: 'Gusto naming gumawa ng vermicompost bilang project sa school. Pwede ba ito sa maliit na space lang?',
    daysAgo: 5,
    replies: [
      { id: 's3r1', nickname: 'Ani Natin Team', daysAgo: 4, body: 'Ang Vermicomposting ay isa sa mga natututunan sa track, kasama ang paggawa ng organic fertilizer tulad ng VermiTea. Sample reply ito, may kasunod na mas kumpletong sagot kapag live na ang forum.' },
      { id: 's3r2', nickname: 'Hardinero22', daysAgo: 4, body: 'Sample reply: magandang simulan sa maliit na lalagyan muna.' },
      { id: 's3r3', nickname: 'PuhunanSaLupa', daysAgo: 3, body: 'Sample reply: salamat!' },
    ],
    sample: true,
  },
  {
    id: 's4',
    title: 'Kailangan ba ng sariling lupa para mag-agri?',
    category: 'afa',
    nickname: 'BatangBukid',
    body: 'Wala kaming sariling lupa. Pwede pa rin ba akong mag-Agri-Fishery?',
    daysAgo: 6,
    replies: [
      { id: 's4r1', nickname: 'Ani Natin Team', daysAgo: 6, body: 'Pwede. Ang hydroponics at vertical farming ay hindi nangangailangan ng malawak na lupa.' },
    ],
    sample: true,
  },
  {
    id: 's5',
    title: 'Anong kurso sa college ang kasunod ng Agri-Fishery?',
    category: 'school',
    nickname: 'FutureAgri',
    body: 'Anong mga college course ang magandang sunod sa Agri-Fishery track?',
    daysAgo: 8,
    replies: [],
    sample: true,
  },
  {
    id: 's6',
    title: 'Mahirap ba ang hydroponics para sa beginner?',
    category: 'projects',
    nickname: 'TubigAtHalaman',
    body: 'Beginner pa lang ako. Mahirap ba simulan ang hydroponics?',
    daysAgo: 9,
    replies: [
      { id: 's6r1', nickname: 'Hardinero22', daysAgo: 9, body: 'Sample reply: simulan sa isa o dalawang halaman muna.' },
    ],
    sample: true,
  },
  {
    id: 's7',
    title: 'Ano ang pinakamasarap na gulay na tinanim ninyo?',
    category: 'offtopic',
    nickname: 'KamoteKing',
    body: 'Kuwentuhan lang! Ano ang paborito ninyong tanim?',
    daysAgo: 12,
    replies: [],
    sample: true,
  },
];
