const LOG_INFO = 'INFO';
const LOG_ERROR = 'ERROR';

class Logger {
  /**
   * Constructs Logger
   *
   * @param  {string} requestId Request ID for tracing
   */
  constructor(requestId) {
    this.requestId = requestId;
  }

  /**
   * Add log entry
   *
   * @param  {string} message Log entry message
   * @param  {string} level   Log entry level
   */
  log(message, level = LOG_INFO) {
    const output = `[${level}] ${this.requestId}: ${message}\n`;

    switch (level) {
      case LOG_INFO:
        process.stdout.write(output);

        break;

      case LOG_ERROR:
        process.stderr.write(output);
    }
  }
}

module.exports = { Logger, LOG_INFO, LOG_ERROR };
