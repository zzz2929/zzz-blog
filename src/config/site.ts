export const siteConfig = {
  noticeOutdate: {
    enable: true,
    style: "flat" as "simple" | "flat",
    limit_day: 365,
    position: "top" as "top" | "bottom",
    message_prev: "It has been",
    message_next: "days since the last update, the content of the article may be outdated.",
  },
  analytics: {
    baidu: "bdcde57860cd04260d3dfed9da4c398a",
    google: "YOUR_GA_MEASUREMENT_ID",
    cloudflare: "YOUR_CF_BEACON_TOKEN",
    microsoftClarity: "sy8i447y7q",
    la51: "3NC2szIj9BRz3hrm",
  },
};
