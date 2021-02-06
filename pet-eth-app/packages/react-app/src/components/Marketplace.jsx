import React, { useState, useEffect } from "react";
import ScrollMenu from 'react-horizontal-scrolling-menu';
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import badges from "./badges.png";
import {
  Row,
  Col,
  Button,
  Spinner,
  Container
} from "react-bootstrap";
import { ethers } from "ethers";

export const Marketplace = (props) => {
    const [isBadgeLoading, setBadgeLoading] = useState(false);
    const [isToyLoading, setToyLoading] = useState(false);

    const badgeStuff = async () => {

    }
    //need create and upgrade badge buttons (in marketplace)
    //need NFT buy button and toy representation.
    return (
            <div style={{ marginTop: `12px`}}> 
              <Container style={{display: "flex", justifyContent: "center", alignItems: "center" }} React Center>
              <img src={badges} style = {{ marginTop: `12px`, overflow: "auto"}} className= "scrollBadge"/> &nbsp;&nbsp;&nbsp;
              <Button onClick={badgeStuff} style = {{fontSize: 14}} disabled={isBadgeLoading ? true : false}>
                          { isBadgeLoading
                          ? <Spinner 
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true" />
                          : null
                          } 
                          &nbsp;&nbsp;Create or Update Badge&nbsp;&nbsp;</Button> &nbsp;&nbsp;&nbsp;
                <Button onClick={badgeStuff} style = {{fontSize: 14}} variant = "secondary" disabled={isToyLoading ? true : false}>
                          { isToyLoading
                          ? <Spinner 
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true" />
                          : null
                          } 
                          &nbsp;&nbsp;Buy Dog Toy&nbsp;&nbsp;</Button>
              </Container>
            </div>
    )}