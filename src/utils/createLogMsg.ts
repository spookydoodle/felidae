import logSymbols from "./logSymbols";

type LogSymbol = "info" | "warning" | "success" | "error";

export default (msg: string, logSymbol?: LogSymbol) => {
  const newMsg = `[${new Date().toLocaleString()}] ${
    logSymbol ? logSymbols[logSymbol] : ""
  } ${msg}`;

  console.log(newMsg);
};
