import type { Request, Response } from "express";
import { settingsService } from "./settings.service.js";
import { OvhClient, OvhApiError } from "../../providers/ovh/ovh.client.js";

export const settingsController = {
  getAll(_req: Request, res: Response) {
    const data = settingsService.getAll();
    res.json(data);
  },

  update(req: Request, res: Response) {
    const data = settingsService.update(req.body);
    res.json(data);
  },

  testConnection: async (req: Request, res: Response) => {
    try {
      const { ovh_endpoint, ovh_application_key, ovh_application_secret, ovh_consumer_key } = req.body ?? {};
      let result: { success: true };
      if (ovh_endpoint) {
        result = await OvhClient.testWith({
          endpoint: ovh_endpoint,
          applicationKey: ovh_application_key ?? "",
          applicationSecret: ovh_application_secret ?? "",
          consumerKey: ovh_consumer_key ?? "",
        });
      } else {
        result = await OvhClient.test();
      }
      res.json(result);
    } catch (err) {
      const message = err instanceof OvhApiError ? err.message : "Connection test failed";
      res.status(400).json({ success: false, error: message });
    }
  },
};
