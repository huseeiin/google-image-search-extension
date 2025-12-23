browser.contextMenus.create({
  id: "google-reverse-image",
  title: "Search image on Google",
  contexts: ["image"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.srcUrl) return;

  // remote image - simple GET
  if (!info.srcUrl.startsWith("file://")) {
    const url =
      "https://www.google.com/searchbyimage?image_url=" +
      info.srcUrl +
      "&client=app";

    browser.tabs.create({ url });
    return;
  }

  // local image - ask content script to fetch blob
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
