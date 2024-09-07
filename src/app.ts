import "./tracing";
import { trace } from "@opentelemetry/api";
import express = require("express");
import { Request, Response } from "express";
import { BasicMockClass } from "./basic_mock";
import { resolve } from "path";

const tracer = trace.getTracer("basic-tracer-node");

const app = express();

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
  const mockClass = new BasicMockClass();

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

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
