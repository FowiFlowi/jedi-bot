module.exports = {
  tgId: /^\d+$/,
  mongoId: /^(?=(?:.{12}|.{24})$)[0-9a-fA-F]*$/,
  approveActionTrigger: /^approve\|\d+\|.+$/,
  rejectActionTrigger: /^reject\|\d+\|.+$/,
  pauseRequest7DaysActionTrigger: /^pause7days\|.+$/,
  pauseRequest31DaysActionTrigger: /^pause31days\|.+$/,
  continueRequestActionTrigger: /^continue\|.+$/,
  removeRequestActionTrigger: /^remove\|.+$/,
}
