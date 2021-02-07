import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import graybadge from "../images/graybadge.png";
import greenbadge from "../images/greenbadge.png";
import bluebadge from "../images/bluebadge.png";
import purplebadge from "../images/purplebadge.png";
import dogtoy from "../images/dog toy.png";
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

  const getLevelImg = () => {
    switch(badgeLevel) {
      case "0":
        return (<img style={{height: "190px", width: "200px"}} src={graybadge} />)
        break;
      case "1":
        return (<img style={{height: "190px", width: "200px"}} src={greenbadge} />)
        break;
      case "2":
        return (<img style={{height: "190px", width: "200px"}} src={bluebadge} />)
        break;
      case "3":
        return (<img style={{height: "190px", width: "200px"}} src={purplebadge} />)
        break;        
          }}
    

  return (
          <div style={{ marginTop: `12px`}}> 
            <Container>
              <Row> 
                <Col sm={6}>
                  <Container style={{ justifyContent: "center", alignItems: "center" }} React Center>
                  {getLevelImg()}
                   <div>
                   <Button className="center" onClick={badgeStuff} style = {{fontSize: 14, justifyContent: "center", alignItems: "center"}} disabled={isBadgeLoading ? true : false}>
                        { isBadgeLoading
                        ? <Spinner 
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true" />
                        : null
                        } 
                        &nbsp;Create or Update Badge&nbsp;</Button>
                  </div>
                  </Container> 
                </Col> 

                 <Col sm={6}>
                    <Container>
                      <img src={dogtoy} style={{height: "190px", width: "200px"}}/>
                      <div>
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
                      </div>
                    </Container>
                  </Col>
</Row>

            </Container>
          </div>
  )}