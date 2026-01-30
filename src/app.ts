import express from "express";
import type { Express } from "express";
import { NovelAI } from "nekoai-js";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const client = new NovelAI({
  token: process.env.NAI_TOKEN || "",
});
