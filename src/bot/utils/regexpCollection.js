module.exports = {
  tgId: /^\d{9}$/,
  mongoId: /^(?=(?:.{12}|.{24})$)[0-9a-fA-F]*$/,
  approveActionTrigger: /^approve|\d{9}|.+$/,
}
