import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
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
const { abi: abiDT } = require("../abis/DogToy.json");

export const Marketplace = (props) => {
  const [toyError, setToyError] = useState(false);
  const [isToyLoading, setToyLoading] = useState(false);
  
  const buyToy = async () => {
    try {
    const overrides = {
      gasLimit: ethers.BigNumber.from("1000000"),
    };

    const owner = props.provider.getSigner();
    const address = await owner.getAddress();
    
    const dogToy = new ethers.Contract(
      "0x3e3c4cb9B82d4bA208f27E41b51C2168e7f8CC0d", 
      abiDT,
      owner)  
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
      const approve = await props.walkToken.connect(owner).approve(props.walkExchange.address,ethers.BigNumber.from((1*10**21).toLocaleString('fullwide', {useGrouping:false})),overrides);
      const buyToy = await props.walkExchange.connect(owner).buyDogToyNFT("Brooklyn Squirrel",overrides);
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