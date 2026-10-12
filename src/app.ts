import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import dns from "node:dns";
import { errorHandler } from "./middlewares/error.middlewares";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const createApp = () => {
  const app = express();
  app.use(
    (helmet as unknown as (options?: object) => express.RequestHandler)({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req: Request, res: Response) => {
    try {
      const timeStamp = new Date();
      return res.status(200).json({
        success: true,
        status: "OK",
        timeStamp: timeStamp.toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", success: false });
    }
  });
  app.use(errorHandler);

  return app;
};

export { createApp };
