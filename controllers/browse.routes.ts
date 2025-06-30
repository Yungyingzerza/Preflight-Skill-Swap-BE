import express from "express";
import * as services from "../services/browse.services";

const router = express.Router();

router.post("/search", async (req, res) => {
    await services.search(req, res);
});

router.post("/request-swap", async (req, res) => {
    await services.requestSwap(req, res);
});

export default router;
