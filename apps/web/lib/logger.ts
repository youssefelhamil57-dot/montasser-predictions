/**
 * Structured logger. JSON in production (so log aggregators can parse it),
 * pretty in development. No console.log scattered through the code.
 */

type Level = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function emit(level: Level, message: string, fields: LogFields = {}): void {
  const record = {
    level,
    msg: message,
    ts: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(record, replacer);

  // Always write through console so platform log capture works (Vercel, Docker).
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

export const logger = {
  debug(message: string, fields?: LogFields): void {
    if (process.env.NODE_ENV !== "production") emit("debug", message, fields);
  },
  info(message: string, fields?: LogFields): void {
    emit("info", message, fields);
  },
  warn(message: string, fields?: LogFields): void {
    emit("warn", message, fields);
  },
  error(message: string, fields?: LogFields): void {
    emit("error", message, fields);
  },
  child(bindings: LogFields) {
    return {
      debug: (m: string, f?: LogFields) => logger.debug(m, { ...bindings, ...f }),
      info: (m: string, f?: LogFields) => logger.info(m, { ...bindings, ...f }),
      warn: (m: string, f?: LogFields) => logger.warn(m, { ...bindings, ...f }),
      error: (m: string, f?: LogFields) => logger.error(m, { ...bindings, ...f }),
    };
  },
};
