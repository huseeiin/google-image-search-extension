browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== "UPLOAD_LOCAL_IMAGE") return;

  const res = await fetch(msg.srcUrl);
  const blob = await res.blob();

  browser.runtime.sendMessage({
    type: "LOCAL_IMAGE_BLOB",
    blob,
  });
});
