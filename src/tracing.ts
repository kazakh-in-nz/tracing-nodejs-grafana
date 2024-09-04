import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";

// Initialize the OpenTelemetry Node SDK with auto-instrumentation
const sdk = new NodeSDK({
  resource: new Resource({
    service: "basic-tracer-node"
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://tempo:4317/v1/traces" // Ensure this matches your Tempo endpoint
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

async function initializeTracing() {
  try {
    await sdk.start();
    console.log("Tracing initialized");
  } catch (error) {
    console.error("Error initializing tracing", error);
  }
}

// Start the tracing initialization
initializeTracing();

// Ensure that the SDK is shut down gracefully when the process exits
process.on("SIGTERM", async () => {
  try {
    await sdk.shutdown();
    console.log("Tracing terminated");
  } catch (error) {
    console.error("Error terminating tracing", error);
  }
});
