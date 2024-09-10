import * as amqp from "amqplib";
import { log } from "../app";
import chalk = require("chalk");

export class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private queue: string;
  private exchange: string;
  private vhost: string;

  constructor(queue: string, exchange: string, vhost: string) {
    this.queue = queue;
    this.exchange = exchange;
    this.vhost = vhost;
  }

  // Connect to RabbitMQ and create a channel
  async connect() {
    try {
      const connectionString = `${
        process.env.RBMQ_URL ?? "amqp://guest:guest@localhost:5672"
      }${this.vhost}`;

      this.connection = await amqp.connect(connectionString);
      log(chalk.green(`Connected to RabbitMQ at ${connectionString}`));

      this.channel = await this.connection.createChannel();
      log(chalk.green("Channel created"));

      // Ensure the exchange exists
      await this.channel.assertExchange(this.exchange, "direct", {
        durable: false
      });

      // Ensure the queue exists
      const queueResult = await this.channel.assertQueue(this.queue, {
        durable: false
      });

      // Bind the queue to the exchange
      await this.channel.bindQueue(
        queueResult.queue,
        this.exchange,
        this.queue
      );
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
    }
  }

  // Publish a message to the queue
  async publishMessage(message: string) {
    try {
      if (!this.channel) {
        console.error("Channel is not initialized");
        return;
      }

      console.log("Publishing message...");
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 3000);
      });

      this.channel.publish(this.exchange, this.queue, Buffer.from(message));
      console.log(`Sent message: ${message}`);
    } catch (error) {
      console.error("Error publishing message:", error);
    }
  }

  // Consume messages from the queue
  async consumeMessages() {
    try {
      if (!this.channel) {
        console.error("Channel is not initialized");
        return;
      }

      this.channel.consume(this.queue, msg => {
        if (msg !== null) {
          console.log(`Message: ${msg.content.toString()}`);

          log(chalk.green("Processing message..."));

          setTimeout(() => {
            log(chalk.green("Message processed"));
          }, 3000);

          log(chalk.green("Acknowledging message..."));
          // this.channel?.ack(msg);
        }
      });
    } catch (error) {
      console.error("Error consuming messages:", error);
    }
  }

  // Close the connection to RabbitMQ
  async closeConnection() {
    try {
      await this.connection?.close();
      console.log("Connection to RabbitMQ closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }
}
