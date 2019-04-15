module.exports = {
  tgId: /^\d+$/,
  mongoId: /^(?=(?:.{12}|.{24})$)[0-9a-fA-F]*$/,
  approveActionTrigger: /^approve\|\d+\|.+$/,
  rejectActionTrigger: /^reject\|\d+\|.+$/,
}
