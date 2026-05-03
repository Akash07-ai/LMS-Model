const https = require('https');

function checkEmbed(vid) {
  return new Promise(res => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`,
      r => res(r.statusCode === 200)).on('error', () => res(false));
  });
}

const candidates = [
  // AWS EBS / Storage — using broader AWS tutorials that cover storage
  { youtube_id: 'a9__D53WsUs', label: 'AWS Full Course freeCodeCamp' },
  { youtube_id: 'NhDYbskXRgc', label: 'AWS S3 and Storage' },
  { youtube_id: 'ZtqBQ68cfJc', label: 'AWS Cloud Practitioner freeCodeCamp' },
  { youtube_id: 'SOTamWNgDKc', label: 'AWS Tutorial Simplilearn' },
  { youtube_id: 'k1RI5locZE4', label: 'AWS EBS Tutorial' },
  { youtube_id: 'GIDhcA0epCQ', label: 'AWS Storage Tutorial' },
  // React Native Testing — broader RN tutorials
  { youtube_id: 'obH0Po_RdWk', label: 'RN First App (already in DB)' },
  { youtube_id: 'ANdSdIlgsEw', label: 'RN Setup (already in DB)' },
  { youtube_id: 'mJ3bGvy0WAY', label: 'RN Testing Jest' },
  { youtube_id: 'CfdGIZkYwEU', label: 'RN Testing fCC' },
  { youtube_id: 'Wr6-OHHNI5I', label: 'RN Testing B' },
  { youtube_id: 'F2JCjVSZlG0', label: 'React Testing Library' },
  { youtube_id: 'OVNjsIto9xM', label: 'React Testing Tutorial' },
];

async function main() {
  for (const c of candidates) {
    const ok = await checkEmbed(c.youtube_id);
    console.log(`${ok ? '✅' : '❌'} ${c.youtube_id} | ${c.label}`);
  }
}
main();
