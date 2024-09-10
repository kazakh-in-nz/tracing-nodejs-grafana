import { trace } from "@opentelemetry/api";
import { Request, Response } from "express";
import { BasicMockClass } from "./basic_mock";
import { RabbitMQService } from "./QService/QService";
import "./tracing";
import chalk = require("chalk");
import express = require("express");

export const log = console.log;

const tracer = trace.getTracer("basic-tracer-node");

log(chalk.green(process.env.RBMQ_QUEUE));
log(chalk.green(process.env.RBMQ_EXCHANGE));
log(chalk.green(process.env.RMBQ_VHOST));
log(chalk.green(process.env.RBMQ_URL));

const app = express();
const rabbitMQ = new RabbitMQService(
  process.env.RBMQ_QUEUE ?? "hello",
  process.env.RBMQ_EXCHANGE ?? "hello_exchange",
  process.env.RBMQ_VHOST ?? "/"
);

app.get("/instant_hello", async (req: Request, res: Response) => {
  // Start a span for this request
  const span = tracer.startSpan("GET /hello");
  const mockClass = new BasicMockClass();

  try {
    span.addEvent("Start processing request", { timestamp: Date.now() });

    res.send(mockClass.getInstantResponse());
  } catch (error) {
    // Record any exception that occurs
    if (error instanceof Error) {
      span.recordException(error);
    }

    throw error;
  } finally {
    span.end();
  }
});

app.get("/hello", async (req: Request, res: Response) => {
  // Start a span for this request
  const span = tracer.startSpan("GET /hello");
  const mockClass = new BasicMockClass();

  const afterSecondsParam = req.query.after_seconds ?? "1";

  if (isNaN(Number(afterSecondsParam))) {
    res.status(400).send("Invalid after_seconds parameter");
    return;
  }

  try {
    span.addEvent("Start processing request", { timestamp: Date.now() });

    res.send(
      await mockClass.getResponseAfterTimeout(
        Math.min(10, Number(afterSecondsParam))
      )
    );
  } catch (error) {
    // Record any exception that occurs
    if (error instanceof Error) {
      span.recordException(error);
    }

    throw error;
  } finally {
    span.end();
  }
});

app.get("/error", async (req: Request, res: Response) => {
  // Start a span for this request
  const span = tracer.startSpan("GET /error");

  try {
    span.addEvent("Start processing request", { timestamp: Date.now() });

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 1000);
    });

    res.status(500).send("Internal server error");
  } catch (error) {
    // Record any exception that occurs
    if (error instanceof Error) {
      span.recordException(error);
    }

    throw error;
  } finally {
    span.end();
  }
});

app.get("/hello_via_rabbitmq", async (req: Request, res: Response) => {
  const message = "Hello from RabbitMQ!";

  const span = tracer.startSpan("GET /hello_via_rabbitmq");

  try {
    span.addEvent("Start processing request", { timestamp: Date.now() });

    // Publish a message to RabbitMQ
    await rabbitMQ.publishMessage(message);

    res.send("Message published to RabbitMQ!");
  } catch (error) {
    // Record any exception that occurs
    if (error instanceof Error) {
      span.recordException(error);
    }

    throw error;
  } finally {
    span.end();
  }
});

(async () => {
  await rabbitMQ.connect();
  await rabbitMQ.consumeMessages();
})();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
