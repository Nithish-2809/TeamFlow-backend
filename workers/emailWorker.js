require("dotenv").config()
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const sendEmail = require("../utils/sendEmail")

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    });

const worker = new Worker("emailQueue", async (job) => {
  await sendEmail(job.data);
}, { connection });

worker.on("completed", job => console.log(`Email sent for job ${job.id}`));
worker.on("failed", (job, err) => console.log(err));