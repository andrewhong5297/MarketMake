import {DataSourceTemplate, log } from "@graphprotocol/graph-ts" 
import { paidTo } from "./types/WalkBadgeOracle/WalkBadgeOracle"
import { redeemedDai, boughtToy } from "./types/WalkTokenExchange/WalkTokenExchange"
import { Transfer } from './types/schema' //entities

export function handleRedeem(event: redeemedDai): void {
  let newRedeem = new Transfer(event.params.spender.toHex())
  log.info("New redeem at address: {}", [event.params.spender.toHex()])
  newRedeem.from = event.params.spender.toHex()
  newRedeem.value = event.params.amount
  newRedeem.action = event.params.action
  newRedeem.save()
}

export function handleBought(event: boughtToy): void {
  let newRedeem = new Transfer(event.params.spender.toHex())
  log.info("New toy bought at address: {}", [event.params.spender.toHex()])
  newRedeem.from = event.params.spender.toHex()
  newRedeem.value = event.params.amount
  newRedeem.action = event.params.action
  newRedeem.save()
}

export function handlePay(event: paidTo): void {
  let newRedeem = new Transfer(event.params.payee.toHex())
  log.info("New payment of WT to address: {}", [event.params.payee.toHex()])
  newRedeem.from = event.params.payee.toHex()
  newRedeem.value = event.params.amount
  newRedeem.action = event.params.action
  newRedeem.save()
}
