import express from "express";
import * as services from "../services/browse.services";

const router = express.Router();

router.post("/search", async (req, res) => {
    await services.search(req, res);
});

export default router;
