import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  ovh: {
    endpoint: process.env.OVH_ENDPOINT || "eu.api.ovh.com",
    applicationKey: process.env.OVH_APPLICATION_KEY || "",
    applicationSecret: process.env.OVH_APPLICATION_SECRET || "",
    consumerKey: process.env.OVH_CONSUMER_KEY || "",
  },
};
