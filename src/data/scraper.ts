// This class is created to schedule automatic data updates and writing them in the data base
// Data should be updated every 24 hours
import { getAllResults } from "../search/searchHTML";
import logSymbols from "log-symbols";
import { SearchResult, UpdateTime } from "../logic/types";

class Scraper {
  name: string;
  requestFunc: any;
  updateTimes: Array<UpdateTime>;
  initDelay: number;
  checkUpdateFreq: any;
  isUpdateInProgress: boolean;
  lastUpdate: Date | null;
  lastError: string | null;

  constructor(
    name: string,
    requestFunc: any,
    updateTimes = [[2, 0, 0, 0] as UpdateTime],
    checkUpdateFreq = 5 * 60 * 1000,
    initDelay: number
  ) {
    this.name = name;
    this.requestFunc = requestFunc;
    this.updateTimes = updateTimes;
    this.checkUpdateFreq = checkUpdateFreq;
    this.initDelay = initDelay;

    this.lastError = null;
    this.lastUpdate = null;
    this.isUpdateInProgress = false;

    // Get data while initializing and set automatic check
    // if update is needed to be executed every 'checkUpdateFreq' seconds
    this.initializeUpdates(initDelay);
  }

  setUpdateInProgress = (bool: boolean) => {
    console.log(
      `[${new Date().toLocaleString()}] ${
        bool === true
          ? `-> Initiating data load for ${this.name}. New requests won't be sent to data center until this one is finshed.`
          : `-> Data load process for ${this.name} finished, new data may be requested again.`
      }`
    );

    this.isUpdateInProgress = bool;
  };

  // If now is after the updateTime and last data update is before the updateTime
  shouldUpdateData = () => {
    let shouldUpdate = false;
    const now = new Date().getTime();
    const lastUpdate = this.lastUpdate != null ? this.lastUpdate.getTime() : 0;
    const updateTimes = this.updateTimes.map((updateTime: UpdateTime) => {
      const [h, m, s, ms] = updateTime;

      return new Date().setHours(h, m, s, ms);
    });

    updateTimes.sort((a, b) => (a < b ? 1 : -1));

    for (let i = 0; i < updateTimes.length; i++) {
      if (
        now > lastUpdate &&
        now > updateTimes[i] &&
        lastUpdate < updateTimes[i]
      ) {
        shouldUpdate = true;
        break;
      }
    }

    return shouldUpdate;
  };

  updateData = () => {
    // If one update is in progress, do not initiate another
    if (this.shouldUpdateData() && !this.isUpdateInProgress) {
      console.log(
        `[${new Date().toLocaleString()}] Updatiing data for ${this.name}...`
      );

      this.setUpdateInProgress(true);

      this.requestFunc()
        .then((response: any) => {
          console.log(
            `[${new Date().toLocaleString()}] ${logSymbols.success} Data for ${
              this.name
            } updated.`
          );
        })
        .catch((error: any) => {
          console.log(
            `[${new Date().toLocaleString()}] ${
              logSymbols.error
            } Fatal error updating data for ${this.name}.`
          );
          console.error(error);

          return;
        });
    } else {
      console.log(
        `[${new Date().toLocaleString()}] ${
          logSymbols.info
        } Data does not need to be updated yet for ${this.name}.`
      );
    }
  };

  setAutomaticUpdate = (n: number) => {
    const intervalText =
      n > 1000 * 60
        ? `${n / 1000 / 60} minutes`
        : n > 1000
        ? `${n / 1000} seconds`
        : `${n} milliseconds`;
    console.log(
      `[${new Date().toLocaleString()}] *** Data updates for ${
        this.name
      } is set and will check if it needs to update every ${intervalText}.`
    );
    console.log(
      `[${new Date().toLocaleString()}] *** Data will be updated every day at around: ${this.updateTimes
        .map((arr) => arr.join(":"))
        .join(", ")} (H:M:S:MS).`
    );

    const interval = setInterval(() => {
      this.updateData();
    }, n);

    // clearInterval(interval);
  };

  initializeUpdates = (n: number) => {
    const timeout = setTimeout(() => {
      this.setAutomaticUpdate(this.checkUpdateFreq);
      this.updateData();
    }, n || 0);

    // clearTimeout(timeout);
  };
}

export default Scraper;
