// This class is created to schedule automatic data updates and writing them in the data base
// Data should be updated every 24 hours
import createLogMsg from "../utils/createLogMsg";
import { SearchResult, UpdateTime, Headlines } from "../logic/types";

class Scraper {
  name: string;
  requestFunc: () => Promise<SearchResult>;
  postFunc: (data: Headlines) => Promise<Headlines>;
  updateTimes: Array<UpdateTime>;
  initDelay: number;
  checkUpdateFreq: any;
  isUpdateInProgress: boolean;
  lastUpdate: Date | null;
  lastError: {
    time: Date;
    message: string | null;
  } | null;

  constructor(
    name: string,
    requestFunc: () => Promise<SearchResult>,
    postFunc: (data: Headlines) => Promise<Headlines>,
    updateTimes = [[2, 0, 0, 0] as UpdateTime],
    checkUpdateFreq = 1 * 60 * 60 * 1000, // every hour = 1 (h) * 60 (min) * 60 (s) * 1000 ms
    initDelay: number = 0
  ) {
    this.name = name;
    this.requestFunc = requestFunc;
    this.postFunc = postFunc;
    this.updateTimes = updateTimes;
    this.checkUpdateFreq = checkUpdateFreq;
    this.initDelay = initDelay;

    this.lastError = null;
    this.lastUpdate = null;
    this.isUpdateInProgress = false;
  }

  setUpdateInProgress = (bool: boolean) => {
    createLogMsg(
      bool === true
        ? `-> Initiating data fetch for ${this.name}. New requests won't be sent until this one is finished.`
        : `-> Data fetch process for ${this.name} finished, new data may be requested again.`
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
      createLogMsg(`Fetching data for ${this.name}...`);

      this.setUpdateInProgress(true);

      this.requestFunc()
        .then((response: any) => {
          createLogMsg(
            `Data fetch for ${this.name} finished. Saving in the data base...`,
            "success"
          );

          // TODO: receive promise and add logic based on success/err
          this.postFunc(response.results);
          // TODO: heading char length max 150 - if longer, do not add to db

          // createLogMsg(
          //   `Data for ${this.name} successfully saved in the data base.`,
          //   "success"
          // );

          // Update last update date on successful database update and unlock the queue
          this.lastUpdate = new Date();
          this.setUpdateInProgress(false);
        })
        .catch((error: any) => {
          createLogMsg(`Error fetching data for ${this.name}.`, "error");
          createLogMsg(error, "error");

          // Update last error on the object
          this.lastError = {
            time: new Date(),
            message: error,
          };

          // Unlock the queue
          this.setUpdateInProgress(false);

          return;
        });
    } else {
      createLogMsg(
        `Data does not need to be updated yet for ${this.name}.`,
        "info"
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

    createLogMsg(
      `*** Data fetch for ${this.name} is set and will check if it needs to update every ${intervalText}.`
    );

    createLogMsg(
      `*** New data will be fetched every day at around: ${this.updateTimes
        .map((arr) => arr.join(":"))
        .join(", ")} (H:M:S:MS) UTC.`
    );

    const interval = setInterval(() => {
      this.updateData();
    }, n);

    // clearInterval(interval);
  };

  initialize = () => {
    const timeout = setTimeout(() => {
      this.setAutomaticUpdate(this.checkUpdateFreq);
      this.updateData();
    }, this.initDelay || 0);

    // clearTimeout(timeout);
  };
}

export default Scraper;
