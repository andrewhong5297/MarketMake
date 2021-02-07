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
  Container,
  Alert
} from "react-bootstrap";
import { ethers } from "ethers";
const { abi: abiDT } = require("../abis/ERC721ToyNFT.json");

export const Marketplace = (props) => {
  const [toyError, setToyError] = useState(false);
  const [isToyLoading, setToyLoading] = useState(false);
  
  const buyToy = async () => {
    const overrides = {
      gasLimit: ethers.BigNumber.from("1000000"),
    };

    const owner = props.provider.getSigner();
    const address = await owner.getAddress();
    
    const dogToy = new ethers.Contract(
      "", 
      abiDT,
      owner)  
      try {
        const toyBalance = await dogToy.connect(owner).balanceOf(address)
        if(toyBalance.toString()!="0")
        {
          setToyError(
            <Alert variant="danger" onClose={() => setToyError(null)} dismissible>
                <Alert.Heading>You already have this toy 🐕</Alert.Heading>
            </Alert>
          )  
        }
      else {
        const buyToy = await props.walkExchange.connect(owner).buyToy(overrides);
        setToyLoading(true)
        await buyToy.wait(2) //next project we should attach the etherscan tx too
        setToyLoading(false)
        setToyError(
        <Alert variant="success" onClose={() => setToyError(null)} dismissible>
            <Alert.Heading>The toy is now yours!</Alert.Heading>
        </Alert>
        )  
      }
    }
    catch(e) {
      console.error(e)
      setToyLoading(false)
      setToyError(
        <Alert variant="danger" onClose={() => setToyError(null)} dismissible>
            <Alert.Heading>That failed for some reason. Please try again.</Alert.Heading>
        </Alert>
    ) 
    }
    
  }

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
                  <span style={{fontSize: 14}}>1000 WT</span>
                  </div>
                  <div>
                  <span style={{fontSize: 14, color: "red"}}>5 Out of 20 Sold</span>
                  </div>
                  <Button onClick={buyToy} style = {{fontSize: 13}} variant = "primary" disabled={isToyLoading ? true : false}>
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
                {toyError}
            </Container>
          </div>
  )}