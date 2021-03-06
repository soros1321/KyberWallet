import BigNumber from 'bignumber.js'
import constants from "../services/constants"

export function verifyAccount(addr) {
  var valid = /^0x[0-9a-fA-F]{40}$/.test(addr)

  return valid ? null : "invalid"
}

export function verifyKey(keystring) {
  try {
    var key = JSON.parse(keystring)
    if (!key.address || key.address == "" || !key.crypto || key.crypto == "") {
      return "Invalid keystore file"
    }
  } catch (e) {
    return "Malformed JSON keystore file"
  }
  return null
}

export function verifyAmount(sourceAmount,
  balance,
  sourceSymbol,
  sourceDecimal,
  rate, destDecimal, maxCap) {
  //verify number for source amount
  var testAmount = parseFloat(sourceAmount)
  if (isNaN(testAmount)) {
    return "not a number"
  }
  var sourceAmountWei = new BigNumber(sourceAmount)
  if (sourceAmountWei == 'NaN' || sourceAmountWei == 'Infinity') {
    return "not a number"
  }
  var weiParam = new BigNumber(10)
  sourceAmountWei = sourceAmountWei.times(weiParam.pow(sourceDecimal))

  //verify balance for source amount
  var sourceBalance = new BigNumber(balance)
  if (sourceBalance == 'NaN' || sourceBalance == 'Infinity') {
    throw new Error("Invalid upper bound for amount")
  }
  if (sourceAmountWei.cmp(sourceBalance) > 0) {
    return "too high"
  }

  //verify min source amount
  var rateBig = new BigNumber(rate)
  var estimateValue = sourceAmountWei
  if (sourceSymbol !== "ETH") {
    estimateValue = rateBig.times(sourceAmountWei).div(weiParam.pow(sourceDecimal))
  }
  var epsilon = new BigNumber(constants.EPSILON)
  if (estimateValue.cmp(epsilon) < 0) {
    return "too small"
  }

  //verify max cap
  //estimate value based on eth
  var maxCap = new BigNumber(maxCap)
  if (estimateValue.cmp(maxCap) > 0) {
    return "too high cap"
  }
  return null
}

export function verifyNumber(amount) {
  var result = new BigNumber(amount)
  if (result == 'NaN' || result == 'Infinity') {
    return "invalid number"
  }
  if (result.cmp(0) < 0) {
    return "nagative"
  }
  return null
}

export function verifyNonce(nonce, future) {
  return (new BigNumber(nonce).plus(future || 0)).toNumber()
}

export function anyErrors(errors) {
  var keys = Object.keys(errors)
  for (var i = 0; i < keys.length; i++) {
    if (errors[keys[i]] != null && errors[keys[i]] != "") {
      return true
    }
  }
  return false
}

export function verifyPassphrase(passphrase, repassphrase) {
  if (passphrase !== repassphrase) {
    return "Password confirmation is not match"
  } else {
    return null
  }
}
