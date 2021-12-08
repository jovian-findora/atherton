import { error } from "../../slices/MessagesSlice";
import store from "../../store";

// List of error messages we wish to intercept
const interceptedConsoleMessages = ["Wrong network, please switch to"];

// Intercepts an error sent to console and dispatches it to the message framework.
const consoleInterceptor = (message: string) => {
  if (!message) { message = ''; }
  if (interceptedConsoleMessages.filter(v => message.startsWith(v)).length > 0) {
    store.dispatch(error(message));
  }
  (console as any)._error_old(message);
};
consoleInterceptor.isInterceptor = true;

// Replaces the console.error function by our interceptor
if ((console.error as any).isInterceptor != true) {
  (console as any)._error_old = console.error;
  console.error = consoleInterceptor;
}
