import logSymbols from "./logSymbols";

type LogSymbol = keyof typeof logSymbols;

export default (msg: string, logSymbol?: LogSymbol) => {
  const newMsg = `[${new Date().toLocaleString()}] ${
    logSymbol ? logSymbols[logSymbol] : ""
  } ${msg}`;

  console.log(newMsg);
};
