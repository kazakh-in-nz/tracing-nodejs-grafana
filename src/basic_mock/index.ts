import { getStringAfterTimeout } from "./utils";

export class BasicMockClass {
  public getInstantResponse(): string {
    return "Hello World";
  }

  public getResponseAfterTimeout(timeoutSeconds: number): Promise<string> {
    return getStringAfterTimeout("Hello World", timeoutSeconds);
  }
}
