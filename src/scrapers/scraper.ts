import createLogMsg from "../utils/createLogMsg";
import { SearchResult, UpdateTime } from "../logic/types";

class Scraper<T = unknown> {
  name: string;
  requestFunc: () => Promise<SearchResult<T>>;
  postFunc: (data: T[]) => Promise<T[]>;
  updateTimes: UpdateTime[];
  initDelay: number;
  checkUpdateFreq: number;
  isUpdateInProgress: boolean;
  lastUpdate: Date | null;
  lastError: {
    time: Date;
    message: string | null;
  } | null;
  timeout: NodeJS.Timeout | null;
  interval: NodeJS.Timeout | null;

  constructor(
    name: string,
    requestFunc: () => Promise<SearchResult<T>>,
    postFunc: (data: T[]) => Promise<T[]>,
    updateTimes: [number, number, number, number][] = [[2, 0, 0, 0]],
    checkUpdateFreq = 1 * 60 * 60 * 1000, // every hour = 1 (h) * 60 (min) * 60 (s) * 1000 ms
    initDelay = 0,
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
    this.timeout = null;
    this.interval = null;
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

    for (const updateTime of updateTimes) {
      if (
        now > lastUpdate &&
        now > updateTime &&
        lastUpdate < updateTime
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
        .then((response: SearchResult<T>) => {
          createLogMsg(
            `Data fetch for ${this.name} finished. Saving in the data base...`,
            "success"
          );

          // TODO: receive promise and add logic based on success/err
          this.postFunc(response.results);

          // Update last update date on successful database update and unlock the queue
          this.lastUpdate = new Date();
          this.setUpdateInProgress(false);

          // Check for 429 error and stop scraper, if occured
          this.checkFor429(response.error);
        })
        .catch((error: string) => {
          createLogMsg(`Error fetching data for ${this.name}.`, "error");
          createLogMsg(error, "error");

          // Update last error on the object
          this.lastError = {
            time: new Date(),
            message: error,
          };

          // Unlock the queue
          this.setUpdateInProgress(false);
          
          // Check for 429 error and stop scraper, if occured
          this.checkFor429(error);

          return;
        });
    } else {
      createLogMsg(
        `Data does not need to be updated yet for ${this.name}.`,
        "info"
      );
    }
  };

  checkFor429 = (err: string | number | null) => {
    if (err === 429) {
      createLogMsg(`Scraper ${this.name} will stop due to error 429: Too many requests. Setting resume in 24 hours.`, "error");
      this.stop();

      const timeout = setTimeout(() => {
        this.initialize();
        createLogMsg(`Resuming scraper ${this.name}.`, "info");
        clearTimeout(timeout);
      }, 24 * 60 * 60 * 1000)
    }
  }

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

    this.interval = setInterval(() => {
      this.updateData();
    }, n);
  };

  initialize = (): Scraper<T> => {
    this.timeout = setTimeout(() => {
      this.setAutomaticUpdate(this.checkUpdateFreq);
      this.updateData();
    }, this.initDelay || 0);

    return this;
  };

  stop = (): Scraper<T> => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    return this;
  }
}

export default Scraper;
