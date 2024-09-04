import "./tracing";
import { trace } from "@opentelemetry/api";
import express = require("express");
import { Request, Response } from "express";

const tracer = trace.getTracer("basic-tracer-node");

const app = express();

// Sample GET endpoint
app.get("/hello", async (req: Request, res: Response) => {
  // Start a span for this request
  const span = tracer.startSpan("GET /hello");

  try {
    // Set attributes and events on the span
    span.setAttribute("custom-attribute", "custom-attribute-value");
    span.addEvent("Start processing request", { timestamp: Date.now() });

    res.send("Hello, World!");

    console.log("Sleeping for 1 second...", new Date().toLocaleTimeString());
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Slept for 1 second", new Date().toLocaleTimeString());

    // End the span after all operations are complete
    span.end();
  } catch (error) {
    // Record any exception that occurs
    if (error instanceof Error) {
      span.recordException(error);
    }
    span.end();
    throw error;
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
