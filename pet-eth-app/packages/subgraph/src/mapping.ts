import {DataSourceTemplate, log } from "@graphprotocol/graph-ts" 
import { paidTo } from "./types/WalkBadgeOracle/WalkBadgeOracle"
import { redeemedDai, boughtToy } from "./types/WalkTokenExchange/WalkTokenExchange"
import { Transfer } from './types/schema' //entities

export function handleRedeem(event: redeemedDai): void {
  let newRedeem = new Transfer(event.params.time.toHex()) 
  log.info("New redeem at address: {}", [event.params.spender.toHex()])
  newRedeem.from = event.params.spender.toHex()
  newRedeem.value = event.params.amount
  newRedeem.action = event.params.action
  newRedeem.createdAt = event.params.time
  newRedeem.save()
}

export function handleBought(event: boughtToy): void {
  let newBuy = new Transfer(event.params.time.toHex()) //unique ID
  log.info("New toy bought at address: {}", [event.params.spender.toHex()])
  newBuy.from = event.params.spender.toHex()
  newBuy.value = event.params.amount
  newBuy.action = event.params.action
  newBuy.createdAt = event.params.time
  newBuy.createdAt = event.params.time
  newBuy.save()
}

export function handlePay(event: paidTo): void {
  let newPay = new Transfer(event.params.time.toHex()) //unique ID
  log.info("New payment of WT to address: {}", [event.params.payee.toHex()])
  newPay.from = event.params.payee.toHex()
  newPay.value = event.params.amount
  newPay.action = event.params.action
  newPay.createdAt = event.params.time
  newPay.save()
}
