module.exports = {
  tgId: /^\d{5,9}$/,
  mongoId: /^(?=(?:.{12}|.{24})$)[0-9a-fA-F]*$/,
  approveActionTrigger: /^approve\|\d{5,9}\|.+$/,
  rejectActionTrigger: /^reject\|\d{5,9}\|.+$/,
}
