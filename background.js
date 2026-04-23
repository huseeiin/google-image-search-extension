browser.contextMenus.create({
  id: "google-reverse-image",
  title: "Search image on Google",
  contexts: ["image"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.srcUrl) return;

  // local file OR localhost → upload via content script
  const isLocal =
    info.srcUrl.startsWith("file://") ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?[\/]/.test(info.srcUrl);

  if (!isLocal) {
    const url =
      "https://www.google.com/searchbyimage?image_url=" +
      encodeURIComponent(info.srcUrl) +
      "&client=app";
    browser.tabs.create({ url });
    return;
  }

  // local file or localhost → ask content script to fetch blob
  browser.tabs.sendMessage(tab.id, {
    type: "UPLOAD_LOCAL_IMAGE",
    srcUrl: info.srcUrl,
  });
});

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== "LOCAL_IMAGE_BLOB") return;
  const form = new FormData();
  form.set("encoded_image", msg.blob);
  form.set("sbisrc", "Firefox");
  const res = await fetch("https://www.google.com/searchbyimage/upload", {
    method: "POST",
    body: form,
  });
  browser.tabs.create({ url: res.url });
});
