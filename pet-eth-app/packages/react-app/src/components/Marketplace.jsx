import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import graybadge from "../images/graybadge.png";
import greenbadge from "../images/greenbadge.png";
import bluebadge from "../images/bluebadge.png";
import purplebadge from "../images/purplebadge.png";
import dogtoy from "../images/dog toy.png";
import toy from "../images/toy.png";
import {
  Row, 
  Col,
  Button,
  Spinner,
  Container
} from "react-bootstrap";
import { ethers } from "ethers";

export const Marketplace = (props) => {
  const overrides = {

  }

  const [isBadgeLoading, setBadgeLoading] = useState(false);
  const [isToyLoading, setToyLoading] = useState(false);
  const [badgeLevel, setBadgeLevel] = useState(1);

  const badgeStuff = async () => {
    const owner = props.provider.getSigner()
    const address = await owner.getAddress()
    const badgeData = await props.walkBadge.connect(owner).getBadge(address)
    console.log(badgeData["level"].toString)
    setBadgeLevel(badgeData["level"].toString())
  }

  useEffect(() => {
  if (props.provider===undefined) {
    console.log("undef")
  }
  else {
    console.log("hello")
    badgeStuff();
  }
  },[props.provider])
  //need create and upgrade badge buttons (in marketplace)
  //need NFT buy button and toy representation.

  return (
          <div style={{ marginTop: `20px`}}> 
            <Container>
              <Row>

                 <Col>
                    <Container sm={6}>
                      <img src={toy} style={{height: "220px", width: "218px"}}/>
                    </Container>
                  </Col>

                  <Col>
                  <div>
                  <span style={{fontSize: 17}}><b>Brooklyn Squirrel Plush</b></span>
                  </div>
                  <div>
                  <span style={{fontSize: 14}}>Durable and soft squirrel plushie crafted with natural and organic materials handpicked from nature. Claim your limited edition now!</span>
                  </div>
                  <div>
                  <span style={{fontSize: 14, color: "red"}}>5 Out of 20 Sold</span>
                  </div>
                  <Button onClick={badgeStuff} style = {{fontSize: 13}} variant = "primary" disabled={isToyLoading ? true : false}>
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
                  </Col>
                </Row>
            </Container>
          </div>
  )}