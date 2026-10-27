// A one-way gate between the loading screen and the intro animations.
// The intro's entrance waits on `loaderOpen`, and the loader opens it while the vines are pulling away,
// so the intro starts moving as the screen opens. On pages with no loader (or when it is off) the gate
// is already open.
const root = document.documentElement;
let open;

export const loaderOpen = root.classList.contains('loader-on')
  ? new Promise((resolve) => {
      open = resolve;
    })
  : Promise.resolve();

export function openLoader() {
  if (open) open();
}

// Never hold the page back for long, whatever happens
setTimeout(openLoader, 9000);
